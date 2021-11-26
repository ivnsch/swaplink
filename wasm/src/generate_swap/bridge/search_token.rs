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

    let holdings = rmp_serde::from_slice::<Holdings>(&pars.holdings_msg_pack)?;

    let tokens = if pars.input.is_empty() {
        default_tokens(micro_algos_to_algos_str(holdings.balance))
    } else {
        let assets_by_id_map = holdings
            .assets
            .into_iter()
            .map(|a| (a.asset_id, a))
            .collect();

        let mut tokens = vec![];
        if let Some(asset) =
            search_with_possible_asset_id(&algod, pars.input, &assets_by_id_map).await?
        {
            tokens.push(asset)
        }
        tokens
    };

    Ok(SearchTokenResJs { tokens })
}

fn default_tokens(algo_balance: String) -> Vec<TokenViewData> {
    vec![algo_token_view_data(algo_balance)]
}

async fn search_with_possible_asset_id(
    algod: &Algod,
    possible_id: String,
    assets: &HashMap<u64, AssetHolding>,
) -> Result<Option<TokenViewData>> {
    let id = possible_id.parse::<u64>();
    match id {
        Ok(id) => search_asset(algod, id, assets).await,
        // not an id - no results
        Err(_) => Ok(None),
    }
}

async fn search_asset(
    algod: &Algod,
    id: u64,
    assets: &HashMap<u64, AssetHolding>,
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

fn asset_view_data(asset: &Asset, assets: &HashMap<u64, AssetHolding>) -> TokenViewData {
    let holding = assets.get(&asset.index);

    TokenViewData {
        id: asset.index.to_string(),
        main_label: asset
            .params
            .unit_name
            .clone()
            .unwrap_or(asset.index.to_string()),
        secondary_label: asset.params.name.clone(),
        asset_type: "asset".to_owned(), // TODO from enum - use when validating inputs
        balance: holding
            .map(|a| a.amount.to_string())
            .unwrap_or_else(|| "0".to_owned()),
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct SearchTokenParJs {
    pub input: String,
    pub holdings_msg_pack: Vec<u8>,
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
    pub balance: String,
}
