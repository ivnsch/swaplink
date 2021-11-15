use crate::{
    asset_holdings::AssetHoldingsPassthroughParJs,
    bridge::{parse_bridge_pars, to_bridge_res},
    dependencies::{algod, network},
};
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub async fn bridge_asset_infos(pars: JsValue) -> Result<JsValue, JsValue> {
    log::debug!("bridge_asset_infos, pars: {:?}", pars);
    to_bridge_res(asset_infos(parse_bridge_pars(pars)?).await)
}

pub async fn asset_infos(pars: AssetInfosParJs) -> Result<AssetInfosResJs> {
    let algod = algod(&network());

    let asset_id = pars.asset_id.parse::<u64>()?;

    let asset = algod.asset_information(asset_id).await?;

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
        pt: AssetHoldingsPassthroughParJs {
            asset_decimals: asset.params.decimals.to_string(),
        },
    })
}

#[derive(Debug, Clone, Deserialize)]
pub struct AssetInfosParJs {
    pub asset_id: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct AssetInfosResJs {
    pub id: String,
    pub name_id_label: String,
    pub pt: AssetHoldingsPassthroughParJs,
}
