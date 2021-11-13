use algonaut::core::MicroAlgos;
use anyhow::Result;
use rust_decimal::Decimal;

pub fn micro_algos_to_algos_str(micro_algos: MicroAlgos) -> Result<String> {
    let decimal = Decimal::from_i128_with_scale(micro_algos.0 as i128, 6).normalize();
    Ok(decimal.to_string())
}
