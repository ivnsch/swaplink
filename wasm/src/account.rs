use crate::{
    bridge::{parse_bridge_pars, to_bridge_res},
    dependencies::{algod, network},
};
use anyhow::{Error, Result};
use serde::Deserialize;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub async fn bridge_account(pars: JsValue) -> Result<JsValue, JsValue> {
    log::debug!("bridge_account, pars: {:?}", pars);
    to_bridge_res(account(parse_bridge_pars(pars)?).await)
}

pub async fn account(pars: AllAssetHoldingsParJs) -> Result<Vec<u8>> {
    let algod = algod(&network());

    let address = pars.address.parse().map_err(Error::msg)?;

    let account = algod.account_information(&address).await?;

    Ok(rmp_serde::to_vec_named(&account)?)
}

#[derive(Debug, Clone, Deserialize)]
pub struct AllAssetHoldingsParJs {
    pub address: String,
}
