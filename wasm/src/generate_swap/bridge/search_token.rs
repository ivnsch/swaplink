use std::collections::HashMap;

use crate::{
    account::Holdings,
    bridge::{parse_bridge_pars, to_bridge_res},
    dependencies::{algod, network},
    format::micro_algos_to_algos_str,
    generate_swap::bridge::algo_token::algo_token_view_data,
};
use algonaut::{
    algod::v2::Algod,
    model::algod::v2::{Asset, AssetHolding},
};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub async fn bridge_search_token(pars: JsValue) -> Result<JsValue, JsValue> {
    log::debug!("bridge_search_token, pars: {:?}", pars);
    to_bridge_res(search_token(parse_bridge_pars(pars)?).await)
}

pub async fn search_token(pars: SearchTokenParJs) -> Result<SearchTokenResJs> {
    let algod = algod(&network());

    let holdings = match pars.holdings_msg_pack {
        Some(h) => Some(rmp_serde::from_slice::<Holdings>(&h)?),
        None => None,
    };

    let tokens = if pars.input.is_empty() {
        default_tokens(holdings.map(|h| micro_algos_to_algos_str(h.balance)))
    } else {
        match search_with_possible_asset_id(&algod, pars.input, holdings).await? {
            Some(t) => vec![t],
            None => vec![],
        }
    };

    Ok(SearchTokenResJs { tokens })
}

fn default_tokens(algo_balance: Option<String>) -> Vec<TokenViewData> {
    vec![algo_token_view_data(algo_balance)]
}

async fn search_with_possible_asset_id(
    algod: &Algod,
    possible_id: String,
    holdings: Option<Holdings>,
) -> Result<Option<TokenViewData>> {
    let assets_by_id_map = holdings.map(|holdings| {
        holdings
            .assets
            .into_iter()
            .map(|a| (a.asset_id, a))
            .collect()
    });

    let id = possible_id.parse::<u64>();
    match id {
        Ok(id) => search_asset(algod, id, assets_by_id_map).await,
        // not an id - no results
        Err(_) => Ok(None),
    }
}

async fn search_asset(
    algod: &Algod,
    id: u64,
    assets: Option<HashMap<u64, AssetHolding>>,
) -> Result<Option<TokenViewData>> {
    let asset = algod.asset_information(id).await;
    Ok(match asset {
        Ok(asset) => Some(asset_view_data(&asset, assets)),
        Err(e) => {
            // for now assumed to be not found TODO improve
            log::debug!("Error searching for token: {:?}", e);
            None
        }
    })
}

fn asset_view_data(asset: &Asset, holdings: Option<HashMap<u64, AssetHolding>>) -> TokenViewData {
    let balance = holdings.map(|holdings| {
        holdings
            .get(&asset.index)
            .map(|a| a.amount.to_string())
            .unwrap_or_else(|| "0".to_owned())
    });

    TokenViewData {
        id: asset.index.to_string(),
        main_label: asset
            .params
            .unit_name
            .clone()
            .unwrap_or_else(|| asset.index.to_string()),
        secondary_label: asset.params.name.clone(),
        asset_type: "asset".to_owned(), // TODO from enum - use when validating inputs
        balance,
        image_url: asset.params.url.clone(),
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct SearchTokenParJs {
    pub input: String,
    pub holdings_msg_pack: Option<Vec<u8>>,
}

#[derive(Debug, Clone, Serialize)]
pub struct SearchTokenResJs {
    pub tokens: Vec<TokenViewData>,
}

#[derive(Debug, Clone, Serialize)]
pub struct TokenViewData {
    pub id: String,
    pub main_label: String,
    pub secondary_label: Option<String>,
    pub asset_type: String,
    pub balance: Option<String>,
    pub image_url: Option<String>,
}
