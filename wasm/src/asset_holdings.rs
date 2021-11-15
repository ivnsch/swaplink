use crate::{
    bridge::{parse_bridge_pars, to_bridge_res},
    conversions::AssetHoldingExt,
    dependencies::{algod, network},
};
use anyhow::{Error, Result};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub async fn bridge_asset_holdings(pars: JsValue) -> Result<JsValue, JsValue> {
    log::debug!("bridge_asset_holdings, pars: {:?}", pars);
    to_bridge_res(asset_holdings(parse_bridge_pars(pars)?).await)
}

pub async fn asset_holdings(pars: AssetHoldingsParJs) -> Result<AssetHoldingsResJs> {
    let algod = algod(&network());

    let address = pars.address.parse().map_err(Error::msg)?;
    let asset_id = pars.asset_id.parse::<u64>()?;
    let asset_decimals = pars.pt.asset_decimals.parse::<u64>()?;

    let account = algod.account_information(&address).await?;
    let holdings_opt = account.assets.iter().find(|a| a.asset_id == asset_id);
    let holdings = match &holdings_opt {
        Some(h) => h.amount_decimal(asset_decimals),
        // Not opted in or opted in an no holdings -> 0
        None => Ok(0.into()),
    }?;

    Ok(AssetHoldingsResJs {
        asset_id: asset_id.to_string(),
        holdings: holdings.to_string(),
    })
}

#[derive(Debug, Clone, Deserialize)]
pub struct AssetHoldingsParJs {
    pub address: String,
    pub asset_id: String,
    pub pt: AssetHoldingsPassthroughParJs,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssetHoldingsPassthroughParJs {
    // pub asset_id: String,
    pub asset_decimals: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct AssetHoldingsResJs {
    pub asset_id: String,
    pub holdings: String,
}
