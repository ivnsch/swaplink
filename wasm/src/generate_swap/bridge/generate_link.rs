use crate::{
    bridge::{parse_bridge_pars, to_bridge_res},
    dependencies::{self, network},
    generate_swap::logic::GenerateSwapLogic,
    model::SwapRequest,
};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::{fmt::Debug, rc::Rc};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub async fn bridge_generate_link(pars: JsValue) -> Result<JsValue, JsValue> {
    log::debug!("bridge_generate_link, pars: {:?}", pars);
    to_bridge_res(generate_link(parse_bridge_pars(pars)?).await)
}

/// Signed "my tx" + passthrough peer tx -> link
async fn generate_link(pars: GenerateLinkParJs) -> Result<String> {
    let request = SwapRequest {
        signed_tx: rmp_serde::from_slice(&pars.signed_my_tx_msg_pack)?,
        unsigned_tx: rmp_serde::from_slice(&pars.pt.unsigned_peer_tx_msg_pack)?,
    };

    let link = generate_swap_logic(&pars.api_key)
        .generate_link(&request)
        .await?;

    Ok(link.0)
}

fn generate_swap_logic(api_key: &str) -> GenerateSwapLogic {
    dependencies::generate_swap_logic(Rc::new(dependencies::algod(&network(), api_key)))
}

#[derive(Debug, Clone, Deserialize)]
pub struct GenerateLinkParJs {
    pub api_key: String,
    pub signed_my_tx_msg_pack: Vec<u8>,
    pub pt: GenerateLinkPassthroughParJs, // passthrough
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerateLinkPassthroughParJs {
    pub unsigned_peer_tx_msg_pack: Vec<u8>,
}
