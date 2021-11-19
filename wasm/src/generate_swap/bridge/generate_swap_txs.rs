use crate::{
    bridge::{parse_bridge_pars, to_bridge_res},
    dependencies::{self, network},
    generate_swap::logic::GenerateSwapLogic,
    wallet_connect_tx::WalletConnectTx,
};
use anyhow::Result;
use my_algo::to_my_algo_transaction::to_my_algo_transaction_value;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{fmt::Debug, rc::Rc};
use wasm_bindgen::prelude::*;

use super::{generate_link::GenerateLinkPassthroughParJs, to_sign_wc_js::ToSignWalletConnectJs};

#[wasm_bindgen]
pub async fn bridge_generate_swap_txs(pars: JsValue) -> Result<JsValue, JsValue> {
    log::debug!("bridge_generate_swap_txs, pars: {:?}", pars);
    to_bridge_res(generate_swap_txs(parse_bridge_pars(pars)?).await)
}

/// Swap inputs -> unsigned tx pair
async fn generate_swap_txs(pars: GenerateSwapTxsParJs) -> Result<UnsignedTxnsResJs> {
    let txns = generate_swap_logic()
        .generate_unsigned_swap_transactions(pars)
        .await?;

    let peer_tx_msg_pack = rmp_serde::to_vec_named(&txns.peer_tx)?;

    Ok(UnsignedTxnsResJs {
        to_sign_my_algo: ToSignMyAlgoJs {
            my_tx: to_my_algo_transaction_value(&txns.my_tx)?,
        },
        to_sign_wc: ToSignWalletConnectJs::new(
            WalletConnectTx::new(&txns.my_tx, "I send", true)?,
            WalletConnectTx::new_with_msg_pack(&peer_tx_msg_pack.clone(), "I receive", false),
            0,
        ),
        pt: GenerateLinkPassthroughParJs {
            unsigned_peer_tx_msg_pack: peer_tx_msg_pack,
        },
    })
}

fn generate_swap_logic() -> GenerateSwapLogic {
    dependencies::generate_swap_logic(Rc::new(dependencies::algod(&network())))
}

#[derive(Debug, Clone, Deserialize)]
pub struct GenerateSwapTxsParJs {
    pub my_address: String,
    pub peer_address: String,
    pub send_amount: String,
    pub send_unit: String,
    pub send_asset_id: String,
    pub receive_amount: String,
    pub receive_unit: String,
    pub receive_asset_id: String,
    pub my_fee: String,
    pub peer_fee: String,
}

#[derive(Debug, Clone, Serialize)]
/// The transaction to be signed in JS + passthough peer tx
/// We return formats for My Algo and WalletConnect: JS decides which to use
pub struct UnsignedTxnsResJs {
    pub to_sign_my_algo: ToSignMyAlgoJs,
    pub to_sign_wc: ToSignWalletConnectJs,

    pub pt: GenerateLinkPassthroughParJs, // passthrough
}

#[derive(Debug, Clone, Serialize)]
pub struct ToSignMyAlgoJs {
    pub my_tx: Value,
}
