use std::rc::Rc;

use algonaut::{
    algod::v2::Algod,
    core::{Address, MicroAlgos, SuggestedTransactionParams},
    transaction::{tx_group::TxGroup, Pay, Transaction, TransferAsset, TxnBuilder},
};
use anyhow::{anyhow, Result};
use my_algo::MyAlgo;

use crate::model::SwapRequest;

use super::model::{SwapInputUnit, SwapInputs, SwapIntent, SwapLink, Transfer, ValidatedSwapInputs};

pub struct GenerateSwapLogic {
    algod: Rc<Algod>,
    my_algo: Rc<MyAlgo>,
}

impl GenerateSwapLogic {
    pub fn new(algod: Rc<Algod>, my_algo: Rc<MyAlgo>) -> GenerateSwapLogic {
        GenerateSwapLogic { algod, my_algo }
    }

    pub async fn connect_wallet(&self) -> Result<Address> {
        self.my_algo
            .connect_wallet()
            .await
            .and_then(|addresses| match addresses.get(0) {
                Some(address) => Ok(address.to_owned()),
                None => Err(anyhow!(
                    "Unexpected: My Algo connect success but no addresses"
                )),
            })
    }

    pub async fn generate_swap_link(&self, me: Address, inputs: SwapInputs) -> Result<SwapLink> {
        let validated_inputs = Self::validate_swap_inputs(inputs)?;
        Ok(self.generate_link(validated_inputs.to_swap(me)).await?)
    }

    fn validate_swap_inputs(inputs: SwapInputs) -> Result<ValidatedSwapInputs> {
        let peer = inputs.peer.parse().map_err(anyhow::Error::msg)?;

        let send_amount = inputs.send_amount.parse()?;
        let receive_amount = inputs.receive_amount.parse()?;

        let send = Self::to_transfer(inputs.send_unit, send_amount, inputs.send_asset_id)?;
        let receive =
            Self::to_transfer(inputs.receive_unit, receive_amount, inputs.receive_asset_id)?;

        let my_fee = MicroAlgos(inputs.my_fee.parse()?);
        let peer_fee = MicroAlgos(inputs.peer_fee.parse()?);

        Ok(ValidatedSwapInputs {
            peer,
            send,
            receive,
            my_fee,
            peer_fee,
        })
    }

    fn to_transfer(
        input_unit: SwapInputUnit,
        amount: u64,
        asset_id_input: String,
    ) -> Result<Transfer> {
        match input_unit {
            SwapInputUnit::Algos => Ok(Transfer::Algos { amount }),
            SwapInputUnit::Asset => Ok(Transfer::Asset {
                id: asset_id_input.parse()?,
                amount,
            }),
        }
    }

    /// Generate a swap link containing a serialized tx group with my signed tx and the peer's unsigned tx.
    pub async fn generate_link(&self, swap: SwapIntent) -> Result<SwapLink> {
        Ok(SwapLink(format!(
            "http://localhost:8000/submit/{}",
            self.to_swap_request(swap).await?.as_url_encoded_str()?
        )))
    }

    async fn to_swap_request(&self, swap: SwapIntent) -> Result<SwapRequest> {
        let mut my_tx = self
            .generate_tx(swap.me, swap.peer, swap.send, swap.my_fee)
            .await?;
        let mut peer_tx = self
            .generate_tx(swap.peer, swap.me, swap.receive, swap.peer_fee)
            .await?;
        TxGroup::assign_group_id(vec![&mut my_tx, &mut peer_tx])?;

        let my_signed_tx_my_algo = self.my_algo.sign(&my_tx).await?;
        let my_signed_tx = rmp_serde::from_slice(&my_signed_tx_my_algo.blob)?;
        Ok(SwapRequest {
            signed_tx: my_signed_tx,
            unsigned_tx: peer_tx,
        })
    }

    async fn generate_tx(
        &self,
        sender: Address,
        receiver: Address,
        unit: Transfer,
        fee: MicroAlgos,
    ) -> Result<Transaction> {
        Ok(TxnBuilder::with(
            SuggestedTransactionParams {
                fee,
                ..self.algod.suggested_transaction_params().await?
            },
            match unit {
                Transfer::Algos { amount } => {
                    Pay::new(sender, receiver, MicroAlgos(amount)).build()
                }
                Transfer::Asset { id, amount } => {
                    TransferAsset::new(sender, id, amount, receiver).build()
                }
            },
        )
        .build())
    }
}
