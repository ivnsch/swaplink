use crate::{
    bridge::to_bridge_res,
    dependencies::{algod, network},
    format::micro_algos_to_algos_str,
};
use anyhow::Result;
use serde::Serialize;
use std::fmt::Debug;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub async fn bridge_suggested_fees() -> Result<JsValue, JsValue> {
    log::debug!("bridge_suggested_fees");
    to_bridge_res(suggested_fees().await)
}

async fn suggested_fees() -> Result<SuggestedFeesResJs> {
    let algod = algod(&network());
    let suggested_fee = algod.suggested_transaction_params().await?.min_fee;
    let total_fee = suggested_fee * 2;
    Ok(SuggestedFeesResJs {
        mine: micro_algos_to_algos_str(suggested_fee),
        peer: micro_algos_to_algos_str(suggested_fee),
        total: micro_algos_to_algos_str(total_fee),
    })
}

#[derive(Debug, Clone, Serialize)]
pub struct SuggestedFeesResJs {
    pub mine: String,
    pub peer: String,
    pub total: String,
}
