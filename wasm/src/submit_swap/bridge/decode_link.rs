use crate::{
    bridge::{parse_bridge_pars, to_bridge_res},
    dependencies::{self, network},
    generate_swap::bridge::to_sign_wc_js::ToSignWalletConnectJs,
    submit_swap::{
        logic::SubmitSwapLogic,
        model::{SubmitSwapViewData, SubmitTransferViewData},
    },
    wallet_connect_tx::WalletConnectTx,
};
use anyhow::Result;
use my_algo::to_my_algo_transaction::to_my_algo_transaction_value;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{fmt::Debug, rc::Rc};
use wasm_bindgen::prelude::*;

use super::submit_txs::SignedTxnsPassthroughParJs;

#[wasm_bindgen]
pub async fn bridge_decode_link(pars: JsValue) -> Result<JsValue, JsValue> {
    log::debug!("bridge_decode_link, pars: {:?}", pars);
    to_bridge_res(decode_link(parse_bridge_pars(pars)?).await)
}

/// Receiver decodes link
pub async fn decode_link(pars: DecodeLinkParJs) -> Result<DecodedLinkResJs> {
    let logic = submit_swap_logic();

    let request = logic.to_swap_request(pars.swap_link).await?;

    let view_data = logic.to_view_data(&request).await?;

    Ok(DecodedLinkResJs {
        to_sign_my_algo: ToSignMyAlgoJs {
            my_tx: to_my_algo_transaction_value(&request.unsigned_tx)?,
        },
        to_sign_wc: ToSignWalletConnectJs::new(
            WalletConnectTx::new(&request.signed_tx.transaction, "I receive", false)?,
            WalletConnectTx::new(&request.unsigned_tx, "I send", true)?,
            1,
        ),

        view_data: view_data.into(),
        pt: SignedTxnsPassthroughParJs {
            signed_peer_tx_msg_pack: rmp_serde::to_vec_named(&request.signed_tx)?,
        },
    })
}

fn submit_swap_logic() -> SubmitSwapLogic {
    dependencies::submit_swap_logic(Rc::new(dependencies::algod(&network())))
}

#[derive(Debug, Clone, Deserialize)]
pub struct DecodeLinkParJs {
    pub swap_link: String,
}

/// Decoded link data: tx to be signed + passthrough peer tx + data to be displayed
#[derive(Debug, Clone, Serialize)]
pub struct DecodedLinkResJs {
    pub to_sign_my_algo: ToSignMyAlgoJs,
    pub to_sign_wc: ToSignWalletConnectJs,

    pub view_data: SubmitSwapViewDataForJs,

    pub pt: SignedTxnsPassthroughParJs,
}

#[derive(Debug, Clone, Serialize)]
pub struct ToSignMyAlgoJs {
    pub my_tx: Value,
}

#[derive(Debug, Clone, Serialize)]
pub struct SubmitSwapViewDataForJs {
    pub peer: String,
    pub send: SubmitTransferViewDataForJs,
    pub receive: SubmitTransferViewDataForJs,
    pub my_fee: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct SubmitTransferViewDataForJs {
    pub amount: String,
    pub label: String,
    pub unit: String,
    pub asset_id: String,
}

impl From<SubmitSwapViewData> for SubmitSwapViewDataForJs {
    fn from(view_data: SubmitSwapViewData) -> Self {
        SubmitSwapViewDataForJs {
            peer: view_data.peer,
            send: SubmitTransferViewDataForJs {
                amount: amount_str(&view_data.send),
                unit: unit_str(&view_data.send),
                asset_id: asset_id_str(&view_data.send),
                label: label(&view_data.send),
            },
            receive: SubmitTransferViewDataForJs {
                amount: amount_str(&view_data.receive),
                unit: unit_str(&view_data.receive),
                asset_id: asset_id_str(&view_data.receive),
                label: label(&view_data.receive),
            },
            my_fee: view_data.my_fee,
        }
    }
}

pub fn label(transfer: &SubmitTransferViewData) -> String {
    match transfer {
        SubmitTransferViewData::Algos { amount: _ } => "".to_owned(),
        SubmitTransferViewData::Asset {
            id,
            amount: _,
            unit,
            name: _,
        } => unit.clone().unwrap_or_else(|| id.to_owned()),
    }
}

pub fn unit_str(transfer: &SubmitTransferViewData) -> String {
    match transfer {
        SubmitTransferViewData::Algos { amount: _ } => "algo",
        SubmitTransferViewData::Asset {
            id: _,
            amount: _,
            unit: _,
            name: _,
        } => "asset",
    }
    .to_owned()
}

pub fn amount_str(transfer: &SubmitTransferViewData) -> String {
    match transfer {
        SubmitTransferViewData::Algos { amount } => amount,
        SubmitTransferViewData::Asset {
            id: _,
            amount,
            unit: _,
            name: _,
        } => amount,
    }
    .to_owned()
}

pub fn asset_id_str(transfer: &SubmitTransferViewData) -> String {
    match transfer {
        SubmitTransferViewData::Algos { amount: _ } => "",
        SubmitTransferViewData::Asset {
            id,
            amount: _,
            unit: _,
            name: _,
        } => id,
    }
    .to_owned()
}
