use std::{convert::TryInto, rc::Rc};

use algonaut::{
    algod::v2::Algod,
    transaction::{SignedTransaction, Transaction, TransactionType},
};
use anyhow::Result;
use log::debug;
use rust_decimal::Decimal;

use crate::{format::micro_algos_to_algos_str, model::SwapRequest};

use super::model::{SubmitSwapViewData, SubmitTransferViewData};
pub struct SubmitSwapLogic {
    algod: Rc<Algod>,
}

impl SubmitSwapLogic {
    pub fn new(algod: Rc<Algod>) -> SubmitSwapLogic {
        SubmitSwapLogic { algod }
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
            my_fee: format!("{} Algos", micro_algos_to_algos_str(my_tx.fee)?),
        })
    }

    async fn to_tranfer(&self, tx: &Transaction) -> Result<SubmitTransferViewData> {
        match &tx.txn_type {
            TransactionType::Payment(p) => Ok(SubmitTransferViewData::Algos {
                amount: micro_algos_to_algos_str(p.amount)?,
            }),
            TransactionType::AssetTransferTransaction(a) => {
                let asset_config = &self.algod.asset_information(a.xfer).await?;
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

    pub async fn submit_swap(
        &self,
        my_tx: SignedTransaction,
        peer_tx: SignedTransaction,
    ) -> Result<String> {
        debug!("Sending transaction group to node");
        debug!("My signed tx: {:?}", my_tx);
        debug!("Peer signed tx: {:?}", peer_tx);

        let send_response = self
            .algod
            // same order as when generating group id
            .broadcast_signed_transactions(&[peer_tx, my_tx])
            .await;
        debug!("Response: {:?}", send_response);
        Ok(send_response?.tx_id)
    }
}
