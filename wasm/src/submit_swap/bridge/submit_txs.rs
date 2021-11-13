use crate::{
    bridge::{parse_bridge_pars, to_bridge_res},
    dependencies::{self, network},
    submit_swap::logic::SubmitSwapLogic,
};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::{fmt::Debug, rc::Rc};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub async fn bridge_submit_txs(pars: JsValue) -> Result<JsValue, JsValue> {
    log::debug!("bridge_submit_txs, pars: {:?}", pars);
    to_bridge_res(submit_txs(parse_bridge_pars(pars)?).await)
}

// Receiver submits the signed tx pair
pub async fn submit_txs(pars: SignedTxnsParJs) -> Result<String> {
    let my_tx = rmp_serde::from_slice(&pars.signed_my_tx_msg_pack)?;
    let peer_tx = rmp_serde::from_slice(&pars.pt.signed_peer_tx_msg_pack)?;

    submit_swap_logic().submit_swap(my_tx, peer_tx).await
}

fn submit_swap_logic() -> SubmitSwapLogic {
    dependencies::submit_swap_logic(Rc::new(dependencies::algod(&network())))
}

/// Link receiver signed their tx
#[derive(Debug, Clone, Deserialize)]
pub struct SignedTxnsParJs {
    pub signed_my_tx_msg_pack: Vec<u8>,
    pub pt: SignedTxnsPassthroughParJs, // passthrough
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignedTxnsPassthroughParJs {
    pub signed_peer_tx_msg_pack: Vec<u8>,
}
