use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{fmt::Debug, rc::Rc};

use wasm_bindgen::prelude::*;

use crate::{
    dependencies::{self, network},
    js_bridge::to_js_value,
    submit_swap::{
        logic::SubmitSwapLogic,
        model::{SubmitSwapViewData, SubmitTransferViewData},
    },
};

/// Receiver decodes link
#[wasm_bindgen]
pub async fn decode_link(swap_link: String, api_key: String) -> Result<JsValue, JsValue> {
    let logic = submit_swap_logic(&api_key);

    let request = logic
        .to_swap_request(swap_link)
        .await
        .map_err(to_js_value)?;

    let view_data = logic.to_view_data(&request).await.map_err(to_js_value)?;

    let decoded_link_for_js = DecodedLinkForJs {
        signed_peer_tx_msg_pack: rmp_serde::to_vec_named(&request.signed_tx)
            .map_err(to_js_value)?,
        unsigned_my_tx_my_algo_format:
            my_algo::to_my_algo_transaction::to_my_algo_transaction_value(&request.unsigned_tx)
                .map_err(to_js_value)?,
        view_data: view_data.into(),
    };

    JsValue::from_serde(&decoded_link_for_js).map_err(to_js_value)
}

// Receiver submits the signed tx pair
#[wasm_bindgen]
pub async fn submit_transactions(
    raw_signed_txns: JsValue,
    api_key: String,
) -> Result<String, JsValue> {
    let raw_txns = raw_signed_txns
        .into_serde::<SignedTxnsFromJs>()
        .map_err(to_js_value)?;

    let my_tx = rmp_serde::from_slice(&raw_txns.signed_my_tx_msg_pack).map_err(to_js_value)?;
    let peer_tx = rmp_serde::from_slice(&raw_txns.signed_peer_tx_msg_pack).map_err(to_js_value)?;

    submit_swap_logic(&api_key)
        .submit_swap(my_tx, peer_tx)
        .await
        .map_err(to_js_value)
}

fn submit_swap_logic(api_key: &str) -> SubmitSwapLogic {
    dependencies::submit_swap_logic(Rc::new(dependencies::algod(&network(), api_key)))
}

/// Decoded link data: tx to be signed + passthrough peer tx + data to be displayed
#[derive(Debug, Clone, Serialize)]
pub struct DecodedLinkForJs {
    pub signed_peer_tx_msg_pack: Vec<u8>,
    pub unsigned_my_tx_my_algo_format: Value,
    pub view_data: SubmitSwapViewDataForJs,
}

/// Link receiver signed their tx
#[derive(Debug, Clone, Deserialize)]
pub struct SignedTxnsFromJs {
    pub signed_my_tx_msg_pack: Vec<u8>,
    pub signed_peer_tx_msg_pack: Vec<u8>, // passthrough
}

#[derive(Debug, Clone, Serialize)]
pub struct SubmitSwapViewDataForJs {
    pub peer: String,
    pub send: SubmitTransferViewDataForJs,
    pub receive: SubmitTransferViewDataForJs,
    pub my_fee: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct SubmitTransferViewDataForJs {
    pub amount: String,
    pub unit: String,
    pub asset_id: String,
}

impl From<SubmitSwapViewData> for SubmitSwapViewDataForJs {
    fn from(view_data: SubmitSwapViewData) -> Self {
        SubmitSwapViewDataForJs {
            peer: view_data.peer,
            send: SubmitTransferViewDataForJs {
                amount: amount_str(&view_data.send),
                unit: unit_str(&view_data.send),
                asset_id: asset_id_str(&view_data.send),
            },
            receive: SubmitTransferViewDataForJs {
                amount: amount_str(&view_data.receive),
                unit: unit_str(&view_data.receive),
                asset_id: asset_id_str(&view_data.receive),
            },
            my_fee: view_data.my_fee,
        }
    }
}

pub fn unit_str(transfer: &SubmitTransferViewData) -> String {
    match transfer {
        SubmitTransferViewData::Algos { amount: _ } => "algo",
        SubmitTransferViewData::Asset { id: _, amount: _ } => "asset",
    }
    .to_owned()
}

pub fn amount_str(transfer: &SubmitTransferViewData) -> String {
    match transfer {
        SubmitTransferViewData::Algos { amount } => amount,
        SubmitTransferViewData::Asset { id: _, amount } => amount,
    }
    .to_owned()
}

pub fn asset_id_str(transfer: &SubmitTransferViewData) -> String {
    match transfer {
        SubmitTransferViewData::Algos { amount: _ } => "",
        SubmitTransferViewData::Asset { id, amount: _ } => id,
    }
    .to_owned()
}
