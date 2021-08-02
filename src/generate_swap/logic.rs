use std::{convert::TryInto, rc::Rc, str::FromStr};

use algonaut::{
    algod::v2::Algod,
    core::{Address, MicroAlgos, SuggestedTransactionParams},
    indexer::v2::Indexer,
    transaction::{tx_group::TxGroup, Pay, Transaction, TransferAsset, TxnBuilder},
};
use anyhow::{anyhow, Result};
use my_algo::MyAlgo;
use rust_decimal::{prelude::ToPrimitive, Decimal};

use crate::{asset_infos::asset_infos, model::SwapRequest};

use super::model::{
    SwapInputUnit, SwapInputs, SwapIntent, SwapLink, SwapRole, Transfer, ValidatedSwapInputs,
};

pub struct GenerateSwapLogic {
    algod: Rc<Algod>,
    my_algo: Rc<MyAlgo>,
    indexer: Rc<Indexer>,
}

impl GenerateSwapLogic {
    pub fn new(algod: Rc<Algod>, my_algo: Rc<MyAlgo>, indexer: Rc<Indexer>) -> GenerateSwapLogic {
        GenerateSwapLogic {
            algod,
            my_algo,
            indexer,
        }
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
        let validated_inputs = self.validate_swap_inputs(inputs).await?;
        Ok(self.generate_link(validated_inputs.to_swap(me)).await?)
    }

    async fn validate_swap_inputs(&self, inputs: SwapInputs) -> Result<ValidatedSwapInputs> {
        let peer = inputs.peer.parse().map_err(anyhow::Error::msg)?;

        let send_amount = Decimal::from_str(&inputs.send_amount)?;
        let receive_amount = Decimal::from_str(&inputs.receive_amount)?;

        let send = self
            .validate_transfer(
                inputs.send_unit,
                send_amount,
                inputs.send_asset_id,
                SwapRole::Sender,
            )
            .await?;

        let receive = self
            .validate_transfer(
                inputs.receive_unit,
                receive_amount,
                inputs.receive_asset_id,
                SwapRole::Receiver,
            )
            .await?;

        let my_fee = Self::validate_algos(Decimal::from_str(&inputs.my_fee)?)?;
        let peer_fee = Self::validate_algos(Decimal::from_str(&inputs.peer_fee)?)?;

        Ok(ValidatedSwapInputs {
            peer,
            send,
            receive,
            my_fee,
            peer_fee,
        })
    }

    async fn validate_transfer(
        &self,
        input_unit: SwapInputUnit,
        amount: Decimal,
        asset_id_input: String,
        role: SwapRole,
    ) -> Result<Transfer> {
        match input_unit {
            SwapInputUnit::Algos => Self::validate_algos_transfer(amount),
            SwapInputUnit::Asset => Ok(self
                .validate_asset_transfer(amount, asset_id_input, role)
                .await?),
        }
    }

    pub fn validate_algos_transfer(amount: Decimal) -> Result<Transfer> {
        Ok(Transfer::Algos {
            amount: Self::validate_algos(amount)?.0,
        })
    }

    pub fn validate_algos(amount: Decimal) -> Result<MicroAlgos> {
        let amount = amount.normalize();

        if amount.is_sign_negative() || amount.is_zero() {
            return Err(anyhow!("{} amount must be positive (>0)", amount));
        };

        Ok(MicroAlgos(Self::to_base_units(amount, 6)?))
    }

    async fn validate_asset_transfer(
        &self,
        amount: Decimal,
        asset_id_input: String,
        role: SwapRole,
    ) -> Result<Transfer> {
        let asset_id = asset_id_input.parse()?;
        let asset_config = asset_infos(&self.indexer, asset_id).await?;

        Self::validate_asset_transfer_with_fractionals(
            asset_config.params.decimals,
            amount,
            asset_id,
            role,
        )
    }

    pub fn validate_asset_transfer_with_fractionals(
        asset_config_max_fractional_digits: u64,
        amount: Decimal,
        asset_id: u64,
        role: SwapRole,
    ) -> Result<Transfer> {
        let amount = amount.normalize();

        if amount.is_sign_negative() || amount.is_zero() {
            return Err(anyhow!("{} amount must be positive (>0)", amount));
        };

        let input_fractionals = amount.scale();

        // explicit check, as the decimals library silently drops > 28 digits
        // and it's technically possible that asset config allows more than 28 digits in the future
        // so we validate against the current limit (< 28 digits) to prevent issues
        // also users normally should not need more than 19 fractional digits
        let asset_config_max_possible_fractional_digits = 19;
        if input_fractionals > asset_config_max_possible_fractional_digits {
            return Err(anyhow!(
                "{:?} asset amount has more fractional digits({}) than allowed({})",
                role,
                input_fractionals,
                asset_config_max_possible_fractional_digits
            ));
        }

        if input_fractionals as u64 > asset_config_max_fractional_digits {
            return Err(anyhow!(
                "{:?} asset amount has more fractional digits({}) than allowed by asset config({})",
                role,
                input_fractionals,
                asset_config_max_fractional_digits
            ));
        }

        Ok(Transfer::Asset {
            id: asset_id,
            amount: Self::to_base_units(amount, asset_config_max_fractional_digits.try_into()?)?,
        })
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

    pub fn to_base_units(decimal: Decimal, base_10_exp: u32) -> Result<u64> {
        let multiplier = Decimal::from_i128_with_scale(
            10u64
                .checked_pow(base_10_exp)
                .ok_or_else(|| anyhow!("exp overflow decimal: {}, exp: {}", decimal, base_10_exp))?
                as i128,
            0,
        );

        let base_units = (decimal * multiplier).normalize();
        if base_units.scale() != 0 {
            return Err(anyhow!(
                "Amount: {} has more fractional digits than allowed: {}",
                decimal,
                base_10_exp
            ));
        }

        if base_units > Decimal::from_i128_with_scale(u64::MAX as i128, 0) {
            return Err(anyhow!(
                "Base units: {} overflow, decimal: {}, exp: {}",
                base_units,
                decimal,
                base_10_exp
            ));
        }

        base_units
            .to_u64()
            .ok_or_else(|| anyhow!("Couldn't convert decimal: {} to u64", decimal))
    }
}
