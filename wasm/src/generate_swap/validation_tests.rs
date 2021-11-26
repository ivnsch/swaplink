#[cfg(test)]
use crate::conversions::to_base_units;
#[cfg(test)]
use crate::generate_swap::logic::GenerateSwapLogic;
#[cfg(test)]
use rust_decimal::prelude::ToPrimitive;
#[cfg(test)]
use rust_decimal::Decimal;
#[cfg(test)]
use std::str::FromStr;

#[test]
fn validate_0_asset_amount_fails() {
    let res = GenerateSwapLogic::validate_asset_transfer_with_fractionals(
        0,
        Decimal::from_str("0").unwrap(),
        1,
    );
    assert!(res.is_err());
}

#[test]
fn validate_0_with_0_fractionals_asset_amount_fails() {
    let res = GenerateSwapLogic::validate_asset_transfer_with_fractionals(
        0,
        Decimal::from_str("0.000000").unwrap(),
        1,
    );
    assert!(res.is_err());
}

#[test]
fn validate_negative_asset_amount_fails() {
    let res = GenerateSwapLogic::validate_asset_transfer_with_fractionals(
        3,
        Decimal::from_str("-2").unwrap(),
        1,
    );
    assert!(res.is_err());
}

#[test]
fn validate_negative_asset_amount_with_fractionals_fails() {
    let res = GenerateSwapLogic::validate_asset_transfer_with_fractionals(
        3,
        Decimal::from_str("-2.1").unwrap(),
        1,
    );
    assert!(res.is_err());
}

#[test]
fn validate_negative_algo_amount_fails() {
    let res = GenerateSwapLogic::validate_algos_transfer(Decimal::from_str("-2").unwrap());
    assert!(res.is_err());
}

#[test]
fn validate_negative_algo_amount_with_fractionals_fails() {
    let res = GenerateSwapLogic::validate_algos_transfer(Decimal::from_str("-2.1").unwrap());
    assert!(res.is_err());
}

#[test]
fn decimal_parses_u64_max() {
    let decimal = Decimal::from_str(&u64::MAX.to_string()).unwrap();
    assert_eq!(decimal.to_u64().unwrap(), u64::MAX);
    assert_eq!(decimal.scale(), 0);
}

#[test]
fn decimal_parses_bigger_than_u64() {
    let number = u64::MAX as u128 + 1;
    let decimal = Decimal::from_str(&number.to_string()).unwrap();
    assert_eq!(decimal.to_u128().unwrap(), number);
    assert_eq!(decimal.scale(), 0);
}

#[test]
fn asset_strips_trailing_fractional_0() {
    let res = GenerateSwapLogic::validate_asset_transfer_with_fractionals(
        2,
        Decimal::from_str("1.2000000000000000000000000000000000000000000000000000000000").unwrap(),
        1,
    );
    assert!(res.is_ok());
}

#[test]
fn asset_amount_fails_if_too_many_fractional_digits() {
    let res = GenerateSwapLogic::validate_asset_transfer_with_fractionals(
        19,
        Decimal::from_str("1.00000000000000000001").unwrap(),
        1,
    );
    assert!(res.is_err());
}

#[test]
fn converts_to_base_units() {
    let decimal = Decimal::from_str("102.002131").unwrap().normalize();
    let base_units = to_base_units(decimal, 6).unwrap();
    assert_eq!(102002131, base_units)
}

#[test]
fn converts_to_base_units_integer_with_0_exp() {
    let decimal = Decimal::from_str("123456789").unwrap().normalize();
    let base_units = to_base_units(decimal, 0).unwrap();
    assert_eq!(123456789, base_units)
}

#[test]
fn converts_to_base_units_0_integer() {
    let decimal = Decimal::from_str("0.232131999").unwrap().normalize();
    let base_units = to_base_units(decimal, 9).unwrap();
    assert_eq!(232131999, base_units)
}

#[test]
fn converts_to_base_units_0_integer_and_prefix() {
    let decimal = Decimal::from_str("0.00232131999").unwrap().normalize();
    let base_units = to_base_units(decimal, 11).unwrap();
    assert_eq!(232131999, base_units)
}

#[test]
fn converts_to_base_units_with_trailing_0() {
    let decimal = Decimal::from_str("102.00213100").unwrap().normalize(); // trailing 0s are stripped
    let base_units = to_base_units(decimal, 6).unwrap();
    assert_eq!(102002131, base_units)
}

#[test]
fn fails_converts_to_base_units_too_many_fractionals() {
    let decimal = Decimal::from_str("102.0021311").unwrap().normalize();
    let res = to_base_units(decimal, 6);
    // 7 fractional digits > 6 exp
    assert!(res.is_err());
}

#[test]
fn fails_converts_to_base_units_too_many_fractionals_0_integer_and_prefix() {
    let decimal = Decimal::from_str("0.0021311").unwrap().normalize();
    let res = to_base_units(decimal, 6);
    // 7 fractional digits > 6 exp
    assert!(res.is_err());
}

#[test]
fn validate_0_1_fractional_passes() {
    let res = GenerateSwapLogic::validate_asset_transfer_with_fractionals(
        0,
        Decimal::from_str("1").unwrap(),
        1,
    );
    assert!(res.is_ok());
}

#[test]
fn validate_1_fractional_passes() {
    let res = GenerateSwapLogic::validate_asset_transfer_with_fractionals(
        1,
        Decimal::from_str("1.1").unwrap(),
        1,
    );
    assert!(res.is_ok());
}

#[test]
fn validate_u64_max_passes() {
    let res = GenerateSwapLogic::validate_asset_transfer_with_fractionals(
        0,
        Decimal::from_str(&u64::MAX.to_string()).unwrap(),
        1,
    );
    assert!(res.is_ok());
}

#[test]
fn validate_u64_with_fractionals_fails() {
    let res = GenerateSwapLogic::validate_asset_transfer_with_fractionals(
        1,
        Decimal::from_str(&u64::MAX.to_string()).unwrap(),
        1,
    );
    assert!(res.is_err());
}

// Fails: Decimal library drops > 28 fractional digits
#[test]
#[ignore]
fn scale_100() {
    let decimal =Decimal::from_str("1.0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001").unwrap();
    assert_eq!(100, decimal.scale());
}

#[test]
fn validate_asset_amount_19_fractionals_passes() {
    let res = GenerateSwapLogic::validate_asset_transfer_with_fractionals(
        19,
        Decimal::from_str("1.0000000000000000001").unwrap(),
        1,
    );
    println!("res: {:?}", res);
    assert!(res.is_ok());
}

#[test]
fn validate_asset_amount_20_fractionals_fails() {
    // hardcoded limit
    let res = GenerateSwapLogic::validate_asset_transfer_with_fractionals(
        20,
        Decimal::from_str("1.00000000000000000001").unwrap(),
        1,
    );
    assert!(res.is_err());
}

#[test]
fn validate_error_if_exp_overflow() {
    let res = GenerateSwapLogic::validate_asset_transfer_with_fractionals(
        100,
        Decimal::from_str("1").unwrap(),
        1,
    );
    assert!(res.is_err());
}

#[test]
fn validate_less_than_max_fractional_passes() {
    let res = GenerateSwapLogic::validate_asset_transfer_with_fractionals(
        3,
        Decimal::from_str("1.12").unwrap(),
        1,
    );
    assert!(res.is_ok());
}

#[test]
fn validate_integer_max_fractional_passes() {
    let res = GenerateSwapLogic::validate_asset_transfer_with_fractionals(
        2,
        Decimal::from_str("21231456").unwrap(),
        1,
    );
    assert!(res.is_ok());
}

#[test]
fn validate_more_than_max_fractional_fails() {
    let res = GenerateSwapLogic::validate_asset_transfer_with_fractionals(
        2,
        Decimal::from_str("1.234").unwrap(),
        1,
    );
    assert!(res.is_err());
}

#[test]
fn validate_more_than_max_fractional_with_zeros_passes() {
    let res = GenerateSwapLogic::validate_asset_transfer_with_fractionals(
        1,
        Decimal::from_str("2.10").unwrap(),
        1,
    );
    assert!(res.is_ok());
}

#[test]
fn validate_more_than_max_fractional_long_number_fails() {
    let res = GenerateSwapLogic::validate_asset_transfer_with_fractionals(
        10,
        Decimal::from_str("2.99999999999").unwrap(),
        1,
    );
    assert!(res.is_err());
}

#[test]
fn from_0() {
    let decimal: Decimal = 0.into();
    assert_eq!(Decimal::from_str("0").unwrap(), decimal);
    assert_eq!(0, decimal.to_u64().unwrap());
}
