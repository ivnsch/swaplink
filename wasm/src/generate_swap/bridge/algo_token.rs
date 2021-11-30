use super::search_token::TokenViewData;
use crate::bridge::{parse_bridge_pars, to_bridge_res};
use anyhow::Result;
use serde::Deserialize;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub async fn bridge_algo_token(pars: JsValue) -> Result<JsValue, JsValue> {
    log::debug!("bridge_algo_token called");
    to_bridge_res(algo_token_res(parse_bridge_pars(pars)?))
}

pub fn algo_token_res(pars: AlgoTokenParsJs) -> Result<TokenViewData> {
    Ok(algo_token_view_data(pars.balance))
}

pub fn algo_token_view_data(balance: Option<String>) -> TokenViewData {
    TokenViewData {
        id: "algo".to_owned(), // just has to be unique
        main_label: "Algo".to_owned(),
        secondary_label: None,
        asset_type: "algo".to_owned(), // TODO from enum - use when validating inputs
        balance: balance.clone(),
        image_url: Some(
            "https://www.pngall.com/wp-content/uploads/10/Algorand-Crypto-Logo-PNG-Pic.png"
                .to_owned(),
        ),
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct AlgoTokenParsJs {
    // if balance is already known in react, use it, to not fetch here again
    pub balance: Option<String>,
}
