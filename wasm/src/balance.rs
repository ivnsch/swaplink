use crate::{
    bridge::{parse_bridge_pars, to_bridge_res},
    dependencies::{algod, network},
    format::micro_algos_to_algos_str,
};
use anyhow::{Error, Result};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub async fn bridge_balance(pars: JsValue) -> Result<JsValue, JsValue> {
    log::debug!("bridge_balance, pars: {:?}", pars);
    to_bridge_res(balance(parse_bridge_pars(pars)?).await)
}

pub async fn balance(pars: BalanceParJs) -> Result<BalanceResJs> {
    let algod = algod(&network());
    let balance = algod
        .account_information(&pars.address.parse().map_err(Error::msg)?)
        .await?
        .amount;
    Ok(BalanceResJs {
        balance: micro_algos_to_algos_str(balance),
    })
}

#[derive(Debug, Clone, Deserialize)]
pub struct BalanceParJs {
    pub address: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct BalanceResJs {
    pub balance: String,
}
