use algonaut::{
    core::MicroAlgos,
    model::algod::v2::{AssetHolding, AssetParams},
};
use anyhow::{anyhow, Result};
use rust_decimal::{prelude::ToPrimitive, Decimal};
use std::convert::TryFrom;

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

pub trait AssetHoldingExt {
    fn amount_decimal(&self, params: &AssetParams) -> Result<Decimal>;
}

impl AssetHoldingExt for AssetHolding {
    fn amount_decimal(&self, params: &AssetParams) -> Result<Decimal> {
        // This cast should always succeed, as decimals max 19 (currently) and should never be > u32::MAX. Safe conversion anyway.
        let decimals_u32 = u32::try_from(params.decimals)?;
        to_decimal(self.amount, decimals_u32)
    }
}

// Fails if decimals > Decimal max precision. Note that this is an internal of the library and may change with upgrades.
fn to_decimal(base_units: u64, decimals: u32) -> Result<Decimal> {
    Ok(Decimal::try_from_i128_with_scale(base_units as i128, decimals).map(|d| d.normalize())?)
}

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use crate::conversions::to_decimal;
    use rust_decimal::Decimal;

    #[test]
    fn test_to_decimal_123_1() {
        let base_units = 123;
        let decimals = 1;
        let res = to_decimal(base_units, decimals);
        assert!(res.is_ok());
        let decimal = res.unwrap();
        assert_eq!(Decimal::from_str("12.3").unwrap(), decimal);
    }

    #[test]
    fn test_to_decimal_123_2() {
        let base_units = 123;
        let decimals = 2;
        let res = to_decimal(base_units, decimals);
        assert!(res.is_ok());
        let decimal = res.unwrap();
        assert_eq!(Decimal::from_str("1.23").unwrap(), decimal);
    }

    #[test]
    fn test_to_decimal_123_3() {
        let base_units = 123;
        let decimals = 3;
        let res = to_decimal(base_units, decimals);
        assert!(res.is_ok());
        let decimal = res.unwrap();
        assert_eq!(Decimal::from_str("0.123").unwrap(), decimal);
    }

    #[test]
    fn test_to_decimal_123_4() {
        let base_units = 123;
        let decimals = 4;
        let res = to_decimal(base_units, decimals);
        assert!(res.is_ok());
        let decimal = res.unwrap();
        assert_eq!(Decimal::from_str("0.0123").unwrap(), decimal);
    }

    #[test]
    fn test_to_decimal_123_20() {
        let base_units = 123;
        let decimals = 20;
        let res = to_decimal(base_units, decimals);
        assert!(res.is_ok());
        let decimal = res.unwrap();

        assert_eq!(
            Decimal::from_str("0.00000000000000000123").unwrap(),
            decimal
        );
    }

    #[test]
    fn test_to_decimal_0_0() {
        let base_units = 0;
        let decimals = 0;
        let res = to_decimal(base_units, decimals);
        assert!(res.is_ok());
        let decimal = res.unwrap();

        assert_eq!(Decimal::from(0), decimal);
    }

    #[test]
    fn test_to_decimal_0_1() {
        let base_units = 0;
        let decimals = 1;
        let res = to_decimal(base_units, decimals);
        assert!(res.is_ok());
        let decimal = res.unwrap();

        assert_eq!(Decimal::from(0), decimal);
    }

    #[test]
    fn test_to_decimal_0_10() {
        let base_units = 0;
        let decimals = 10;
        let res = to_decimal(base_units, decimals);
        assert!(res.is_ok());
        let decimal = res.unwrap();

        assert_eq!(Decimal::from(0), decimal);
    }

    #[test]
    fn test_to_decimal_u64_0() {
        let base_units = u64::MAX;
        let decimals = 0;
        let res = to_decimal(base_units, decimals);
        assert!(res.is_ok());
        let decimal = res.unwrap();

        assert_eq!(Decimal::from(u64::MAX), decimal);
    }

    #[test]
    fn test_to_decimal_u64_1() {
        let base_units = u64::MAX;
        let decimals = 1;
        let res = to_decimal(base_units, decimals);
        assert!(res.is_ok());
        let decimal = res.unwrap();

        assert_eq!(Decimal::from_str("1844674407370955161.5").unwrap(), decimal);
    }

    #[test]
    fn test_to_decimal_u64_2() {
        let base_units = u64::MAX;
        let decimals = 2;
        let res = to_decimal(base_units, decimals);
        assert!(res.is_ok());
        let decimal = res.unwrap();

        assert_eq!(Decimal::from_str("184467440737095516.15").unwrap(), decimal);
    }

    #[test]
    fn test_to_decimal_u64_28() {
        let base_units = u64::MAX;
        let decimals = 28;
        let res = to_decimal(base_units, decimals);
        assert!(res.is_ok());
        let decimal = res.unwrap();

        assert_eq!(
            Decimal::from_str("0.0000000018446744073709551615").unwrap(),
            decimal
        );
    }

    #[test]
    fn test_to_decimal_123_29_decimals_fails() {
        let base_units = 123;
        // exceeds Decimals max precision. Note that this can change with Decimal's upgrades.
        let decimals = 29;
        let res = to_decimal(base_units, decimals);
        println!("expected error: {:?}", res);
        assert!(res.is_err());
    }
}
