use crate::{
    dependencies::{self, network},
    generate_swap::logic::GenerateSwapLogic,
    js_bridge::to_js_value,
    model::SwapRequest,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{fmt::Debug, rc::Rc};
use wasm_bindgen::prelude::*;

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

fn generate_swap_logic(api_key: &str) -> GenerateSwapLogic {
    dependencies::generate_swap_logic(Rc::new(dependencies::algod(&network(), api_key)))
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
