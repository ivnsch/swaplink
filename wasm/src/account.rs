use crate::{
    bridge::{parse_bridge_pars, to_bridge_res},
    dependencies::{algod, network},
};
use algonaut::{core::MicroAlgos, model::algod::v2::AssetHolding};
use anyhow::{Error, Result};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub async fn bridge_holdings(pars: JsValue) -> Result<JsValue, JsValue> {
    log::debug!("bridge_holdings, pars: {:?}", pars);
    to_bridge_res(holdings(parse_bridge_pars(pars)?).await)
}

pub async fn holdings(pars: HoldingsParJs) -> Result<Vec<u8>> {
    let algod = algod(&network());

    let address = pars.address.parse().map_err(Error::msg)?;

    let account = algod.account_information(&address).await?;
    let holdings = Holdings {
        balance: account.amount,
        assets: account.assets,
    };

    Ok(rmp_serde::to_vec_named(&holdings)?)
}

#[derive(Debug, Clone, Deserialize)]
pub struct HoldingsParJs {
    pub address: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Holdings {
    pub balance: MicroAlgos,
    pub assets: Vec<AssetHolding>,
}
