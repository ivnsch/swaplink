use crate::{
    bridge::{parse_bridge_pars, to_bridge_res},
    conversions::AssetHoldingExt,
    dependencies::{algod, network},
};
use algonaut::{algod::v2::Algod, core::Address, model::algod::v2::Asset};
use anyhow::{anyhow, Error, Result};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub async fn bridge_asset_infos(pars: JsValue) -> Result<JsValue, JsValue> {
    log::debug!("bridge_asset_infos, pars: {:?}", pars);
    to_bridge_res(asset_infos(parse_bridge_pars(pars)?).await)
}

pub async fn asset_infos(pars: AssetInfosParJs) -> Result<AssetInfosResJs> {
    let algod = algod(&network());

    log::debug!("holdings pars: {:?}", pars);
    let address = pars.address.parse().map_err(Error::msg)?;
    let asset_id = pars.asset_id.parse::<u64>()?;
    log::debug!("holdings pars: {:?}", pars);

    let asset = algod.asset_information(asset_id).await?;
    let holdings = asset_holdings(&algod, &address, &asset).await?;

    log::debug!("holdings: {:?}", holdings);

    if asset.index != asset_id {
        return Err(anyhow!(
            "Illegal state: returned asset id: {} != queried asset id: {}",
            asset.index,
            asset_id
        ));
    }

    let name_id_label = match asset.params.name {
        Some(name) => format!("{} ({})", name, asset.index),
        None => format!("{}", asset.index),
    };

    Ok(AssetInfosResJs {
        id: asset.index.to_string(),
        name_id_label,
        balance: holdings.to_string(),
    })
}

pub async fn asset_holdings(algod: &Algod, address: &Address, asset: &Asset) -> Result<Decimal> {
    let account = algod.account_information(&address).await?;
    let holding = account.assets.iter().find(|a| a.asset_id == asset.index);
    match &holding {
        Some(h) => h.amount_decimal(&asset.params),
        // Not opted in or opted in an no holdings -> 0
        None => Ok(0.into()),
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct AssetInfosParJs {
    pub address: String,
    pub asset_id: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct AssetInfosResJs {
    pub id: String,
    pub name_id_label: String,
    pub balance: String,
}
