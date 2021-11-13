use algonaut::core::MicroAlgos;
use anyhow::{anyhow, Result};
use rust_decimal::{prelude::ToPrimitive, Decimal};

pub fn validate_algos(amount: Decimal) -> Result<MicroAlgos> {
    let amount = amount.normalize();

    if amount.is_sign_negative() || amount.is_zero() {
        return Err(anyhow!("{} amount must be positive (>0)", amount));
    };

    Ok(MicroAlgos(to_base_units(amount, 6)?))
}

pub fn to_base_units(decimal: Decimal, base_10_exp: u32) -> Result<u64> {
    let multiplier = Decimal::from_i128_with_scale(
        10u64
            .checked_pow(base_10_exp)
            .ok_or_else(|| anyhow!("exp overflow decimal: {}, exp: {}", decimal, base_10_exp))?
            as i128,
        0,
    );

    let base_units = (decimal * multiplier).normalize();
    if base_units.scale() != 0 {
        return Err(anyhow!(
            "Amount: {} has more fractional digits than allowed: {}",
            decimal,
            base_10_exp
        ));
    }

    if base_units > Decimal::from_i128_with_scale(u64::MAX as i128, 0) {
        return Err(anyhow!(
            "Base units: {} overflow, decimal: {}, exp: {}",
            base_units,
            decimal,
            base_10_exp
        ));
    }

    base_units
        .to_u64()
        .ok_or_else(|| anyhow!("Couldn't convert decimal: {} to u64", decimal))
}
