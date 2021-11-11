use crate::{
    dependencies::{algod, network},
    network_util::wait_for_pending_transaction,
};
use anyhow::Result;
use log::debug;
use serde::{de::DeserializeOwned, Serialize};
use std::fmt::Debug;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub async fn init_log() -> Result<(), JsValue> {
    wasm_logger::init(wasm_logger::Config::default());
    debug!("Initialized wasm logs");
    Ok(())
}

#[wasm_bindgen]
pub async fn bridge_wait_for_pending_tx(id: String) -> Result<(), JsValue> {
    let algod = algod(&network());
    wait_for_pending_transaction(&algod, &id)
        .await
        .map_err(to_js_value)?;
    Ok(())
}

pub fn to_js_value<T: Debug>(t: T) -> JsValue {
    JsValue::from_str(&format!("{:?}", t))
}

pub fn parse_bridge_pars<T: DeserializeOwned>(pars: JsValue) -> Result<T, JsValue> {
    Ok(pars.into_serde::<T>().map_err(to_js_value)?)
}

pub fn to_bridge_res<T: Serialize>(res: Result<T>) -> Result<JsValue, JsValue> {
    let res = res.map_err(to_js_value)?;
    Ok(JsValue::from_serde(&res).map_err(to_js_value)?)
}
