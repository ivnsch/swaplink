use log::debug;
use std::fmt::Debug;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub async fn init_log() -> Result<(), JsValue> {
    wasm_logger::init(wasm_logger::Config::default());
    debug!("Initialized wasm logs");
    Ok(())
}

pub fn to_js_value<T: Debug>(t: T) -> JsValue {
    JsValue::from_str(&format!("{:?}", t))
}
