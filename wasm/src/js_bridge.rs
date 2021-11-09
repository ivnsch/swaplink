use log::debug;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{fmt::Debug, rc::Rc};

use wasm_bindgen::prelude::*;

use crate::{
    dependencies,
    generate_swap::logic::GenerateSwapLogic,
    model::SwapRequest,
    submit_swap::{
        logic::SubmitSwapLogic,
        model::{SubmitSwapViewData, SubmitTransferViewData},
    },
};

#[wasm_bindgen]
pub async fn init_log() -> Result<(), JsValue> {
    wasm_logger::init(wasm_logger::Config::default());
    debug!("Initialized wasm logs");
    Ok(())
}

/// Swap inputs -> unsigned tx pair
#[wasm_bindgen]
pub async fn generate_unsigned_swap_transactions(
    my_address_str: String,
    inputs: JsValue,
    api_key: String,
) -> Result<JsValue, JsValue> {
    let inputs = inputs.into_serde().map_err(to_js_value)?;

    let txns = generate_swap_logic(&api_key)
        .generate_unsigned_swap_transactions(my_address_str, inputs)
        .await
        .map_err(to_js_value)?;

    let tnxs_for_js = UnsignedTxnsForJs {
        my_tx_my_algo_format: my_algo::to_my_algo_transaction::to_my_algo_transaction_value(
            &txns.my_tx,
        )
        .map_err(to_js_value)?,
        peer_tx_msg_pack: rmp_serde::to_vec_named(&txns.peer_tx).map_err(to_js_value)?,
    };

    Ok(JsValue::from_serde(&tnxs_for_js).map_err(to_js_value)?)
}

/// Signed "my tx" + passthrough peer tx -> link
#[wasm_bindgen]
pub async fn generate_link(raw_request_js: JsValue, api_key: String) -> Result<JsValue, JsValue> {
    let raw_request = raw_request_js
        .into_serde::<SwapRequestFromJs>()
        .map_err(to_js_value)?;

    let request = SwapRequest {
        signed_tx: rmp_serde::from_slice(&raw_request.signed_my_tx_msg_pack)
            .map_err(to_js_value)?,
        unsigned_tx: rmp_serde::from_slice(&raw_request.unsigned_peer_tx_msg_pack)
            .map_err(to_js_value)?,
    };

    let link = generate_swap_logic(&api_key)
        .generate_link(&request)
        .await
        .map_err(to_js_value)?;

    Ok(JsValue::from_str(&link.0))
}

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

fn generate_swap_logic(api_key: &str) -> GenerateSwapLogic {
    dependencies::generate_swap_logic(Rc::new(dependencies::algod(api_key)))
}

fn submit_swap_logic(api_key: &str) -> SubmitSwapLogic {
    dependencies::submit_swap_logic(Rc::new(dependencies::algod(api_key)))
}

fn to_js_value<T: Debug>(t: T) -> JsValue {
    JsValue::from_str(&format!("{:?}", t))
}

#[derive(Debug, Clone, Serialize)]
/// The transaction to be signed with My Algo in JS + passthough peer tx
pub struct UnsignedTxnsForJs {
    pub my_tx_my_algo_format: Value,
    pub peer_tx_msg_pack: Vec<u8>, // passthrough
}

/// JS sends signed tx + unsigned passthrough tx
#[derive(Debug, Clone, Deserialize)]
pub struct SwapRequestFromJs {
    pub signed_my_tx_msg_pack: Vec<u8>,
    pub unsigned_peer_tx_msg_pack: Vec<u8>,
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

fn unit_str(transfer: &SubmitTransferViewData) -> String {
    match transfer {
        SubmitTransferViewData::Algos { amount: _ } => "algo",
        SubmitTransferViewData::Asset { id: _, amount: _ } => "asset",
    }
    .to_owned()
}

fn amount_str(transfer: &SubmitTransferViewData) -> String {
    match transfer {
        SubmitTransferViewData::Algos { amount } => amount,
        SubmitTransferViewData::Asset { id: _, amount } => amount,
    }
    .to_owned()
}

fn asset_id_str(transfer: &SubmitTransferViewData) -> String {
    match transfer {
        SubmitTransferViewData::Algos { amount: _ } => "",
        SubmitTransferViewData::Asset { id, amount: _ } => id,
    }
    .to_owned()
}
