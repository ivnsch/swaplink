use crate::{
    bridge::{parse_bridge_pars, to_bridge_res},
    conversions::validate_algos,
    format::micro_algos_to_algos_str,
};
use anyhow::Result;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use std::{fmt::Debug, str::FromStr};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn bridge_add_fees(pars: JsValue) -> Result<JsValue, JsValue> {
    log::debug!("bridge_add_fees, pars: {:?}", pars);
    to_bridge_res(add_fees(parse_bridge_pars(pars)?))
}

fn add_fees(pars: AddFeesParJs) -> Result<AddFeesResJs> {
    let my_fee = validate_algos(Decimal::from_str(&pars.my_fee)?)?;
    let peer_fee = validate_algos(Decimal::from_str(&pars.peer_fee)?)?;

    let total_fee = my_fee + peer_fee;

    Ok(AddFeesResJs {
        total: micro_algos_to_algos_str(total_fee)?,
    })
}

#[derive(Debug, Clone, Deserialize)]
pub struct AddFeesParJs {
    pub my_fee: String,
    pub peer_fee: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct AddFeesResJs {
    pub total: String,
}
