use std::{convert::TryInto, rc::Rc};

use algonaut::{
    algod::v2::Algod,
    core::MicroAlgos,
    indexer::v2::Indexer,
    transaction::{Transaction, TransactionType},
};
use anyhow::Result;
use log::debug;
use my_algo::MyAlgo;
use rust_decimal::Decimal;

use crate::{asset_infos::asset_infos, model::SwapRequest};

use super::model::{SubmitSwapViewData, SubmitTransferViewData};

pub struct SubmitSwapLogic {
    algod: Rc<Algod>,
    my_algo: Rc<MyAlgo>,
    indexer: Rc<Indexer>,
}

impl SubmitSwapLogic {
    pub fn new(algod: Rc<Algod>, my_algo: Rc<MyAlgo>, indexer: Rc<Indexer>) -> SubmitSwapLogic {
        SubmitSwapLogic {
            algod,
            my_algo,
            indexer,
        }
    }

    pub async fn to_swap_request(&self, encoded_swap: String) -> Result<SwapRequest> {
        Ok(SwapRequest::from_url_encoded_str(encoded_swap)?)
    }

    pub async fn to_view_data(&self, request: &SwapRequest) -> Result<SubmitSwapViewData> {
        let my_tx = request.unsigned_tx.clone();
        let peer_tx = request.signed_tx.clone();

        Ok(SubmitSwapViewData {
            peer: peer_tx.transaction.sender().to_string(),
            send: self.to_tranfer(&my_tx).await?,
            receive: self.to_tranfer(&peer_tx.transaction).await?,
            my_fee: format!("{} Algos", Self::micro_algos_to_algos_str(my_tx.fee)?),
        })
    }

    async fn to_tranfer(&self, tx: &Transaction) -> Result<SubmitTransferViewData> {
        match &tx.txn_type {
            TransactionType::Payment(p) => Ok(SubmitTransferViewData::Algos {
                amount: Self::micro_algos_to_algos_str(p.amount)?,
            }),
            TransactionType::AssetTransferTransaction(a) => {
                let asset_config = asset_infos(&self.indexer, a.xfer).await?;
                let decimal = Decimal::from_i128_with_scale(
                    a.amount as i128,
                    asset_config.params.decimals.try_into()?,
                )
                .normalize();
                Ok(SubmitTransferViewData::Asset {
                    id: a.xfer.to_string(),
                    amount: decimal.to_string(),
                })
            }
            // this site only generates payments and asset transfers
            _ => {
                panic!("Not supported transaction type");
            }
        }
    }

    fn micro_algos_to_algos_str(micro_algos: MicroAlgos) -> Result<String> {
        let decimal = Decimal::from_i128_with_scale(micro_algos.0 as i128, 6).normalize();
        Ok(decimal.to_string())
    }

    /// Process peer's swap request: sign my tx and submit the tx group to the network.
    pub async fn submit_swap(&self, request: SwapRequest) -> Result<String> {
        let my_tx = request.unsigned_tx;
        let my_signed_tx_my_algo = self.my_algo.sign(&my_tx).await?;
        let my_signed_tx = rmp_serde::from_slice(&my_signed_tx_my_algo.blob)?;

        let peer_signed_tx = request.signed_tx;

        debug!("Sending transaction group to node");
        debug!("My signed tx: {:?}", my_signed_tx);
        debug!("Peer signed tx: {:?}", peer_signed_tx);

        let send_response = self
            .algod
            .broadcast_signed_transactions(&[peer_signed_tx, my_signed_tx])
            .await;
        debug!("Response: {:?}", send_response);
        Ok(send_response?.tx_id)
    }
}
