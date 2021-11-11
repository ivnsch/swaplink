use std::{convert::TryInto, rc::Rc, str::FromStr};

use algonaut::{
    algod::v2::Algod,
    core::{Address, MicroAlgos, SuggestedTransactionParams},
    transaction::{tx_group::TxGroup, Pay, Transaction, TransferAsset, TxnBuilder},
};
use anyhow::{anyhow, Result};
use rust_decimal::{prelude::ToPrimitive, Decimal};

use crate::{
    asset_infos::asset_infos,
    dependencies::base_url,
    model::{SwapRequest, UnsignedSwapTransactions},
};

use super::{
    bridge::generate_swap_txs::GenerateSwapTxsParJs,
    model::{SwapInputUnit, SwapIntent, SwapLink, SwapRole, Transfer, ValidatedSwapPars},
};

pub struct GenerateSwapLogic {
    algod: Rc<Algod>,
}

impl GenerateSwapLogic {
    pub fn new(algod: Rc<Algod>) -> GenerateSwapLogic {
        GenerateSwapLogic { algod }
    }

    async fn validate_swap_pars(&self, pars: GenerateSwapTxsParJs) -> Result<ValidatedSwapPars> {
        let me = pars.my_address.parse().map_err(anyhow::Error::msg)?;
        let peer = pars.peer_address.parse().map_err(anyhow::Error::msg)?;
        if pars.api_key.is_empty() {
            return Err(anyhow!("Please enter an API key"));
        }

        let send_amount = Decimal::from_str(&pars.send_amount)?;
        let receive_amount = Decimal::from_str(&pars.receive_amount)?;

        let send_unit = Self::validate_unit(pars.send_unit)?;
        let receive_unit = Self::validate_unit(pars.receive_unit)?;

        let send = self
            .validate_transfer(send_unit, send_amount, pars.send_asset_id, SwapRole::Sender)
            .await?;

        let receive = self
            .validate_transfer(
                receive_unit,
                receive_amount,
                pars.receive_asset_id,
                SwapRole::Receiver,
            )
            .await?;

        let my_fee = Self::validate_algos(Decimal::from_str(&pars.my_fee)?)?;
        let peer_fee = Self::validate_algos(Decimal::from_str(&pars.peer_fee)?)?;

        Ok(ValidatedSwapPars {
            me,
            api_key: pars.api_key.clone(),
            peer,
            send,
            receive,
            my_fee,
            peer_fee,
        })
    }

    fn validate_unit(unit_str: String) -> Result<SwapInputUnit> {
        match unit_str.as_ref() {
            "algo" => Ok(SwapInputUnit::Algos),
            "asset" => Ok(SwapInputUnit::Asset),
            _ => Err(anyhow!(
                "Invalid unit string: {}. UI shouldn't be passing this unit.",
                unit_str
            )),
        }
    }

    async fn validate_transfer(
        &self,
        input_unit: SwapInputUnit,
        amount: Decimal,
        asset_id_input: String,
        role: SwapRole,
    ) -> Result<Transfer> {
        match input_unit {
            SwapInputUnit::Algos => Self::validate_algos_transfer(amount),
            SwapInputUnit::Asset => Ok(self
                .validate_asset_transfer(amount, asset_id_input, role)
                .await?),
        }
    }

    pub fn validate_algos_transfer(amount: Decimal) -> Result<Transfer> {
        Ok(Transfer::Algos {
            amount: Self::validate_algos(amount)?.0,
        })
    }

    pub fn validate_algos(amount: Decimal) -> Result<MicroAlgos> {
        let amount = amount.normalize();

        if amount.is_sign_negative() || amount.is_zero() {
            return Err(anyhow!("{} amount must be positive (>0)", amount));
        };

        Ok(MicroAlgos(Self::to_base_units(amount, 6)?))
    }

    async fn validate_asset_transfer(
        &self,
        amount: Decimal,
        asset_id_input: String,
        role: SwapRole,
    ) -> Result<Transfer> {
        let asset_id = asset_id_input.parse()?;
        let asset_config = asset_infos(&self.algod, asset_id).await?;

        Self::validate_asset_transfer_with_fractionals(
            asset_config.params.decimals,
            amount,
            asset_id,
            role,
        )
    }

    pub fn validate_asset_transfer_with_fractionals(
        asset_config_max_fractional_digits: u64,
        amount: Decimal,
        asset_id: u64,
        role: SwapRole,
    ) -> Result<Transfer> {
        let amount = amount.normalize();

        if amount.is_sign_negative() || amount.is_zero() {
            return Err(anyhow!("{} amount must be positive (>0)", amount));
        };

        let input_fractionals = amount.scale();

        // explicit check, as the decimals library silently drops > 28 digits
        // and it's technically possible that asset config allows more than 28 digits in the future
        // so we validate against the current limit (< 28 digits) to prevent issues
        // also users normally should not need more than 19 fractional digits
        let asset_config_max_possible_fractional_digits = 19;
        if input_fractionals > asset_config_max_possible_fractional_digits {
            return Err(anyhow!(
                "{:?} asset amount has more fractional digits({}) than allowed({})",
                role,
                input_fractionals,
                asset_config_max_possible_fractional_digits
            ));
        }

        if input_fractionals as u64 > asset_config_max_fractional_digits {
            return Err(anyhow!(
                "{:?} asset amount has more fractional digits({}) than allowed by asset config({})",
                role,
                input_fractionals,
                asset_config_max_fractional_digits
            ));
        }

        Ok(Transfer::Asset {
            id: asset_id,
            amount: Self::to_base_units(amount, asset_config_max_fractional_digits.try_into()?)?,
        })
    }

    pub async fn generate_link(&self, request: &SwapRequest) -> Result<SwapLink> {
        Ok(SwapLink(format!(
            "{}/submit/{}",
            base_url(),
            request.as_url_encoded_str()?
        )))
    }

    pub async fn generate_unsigned_swap_transactions(
        &self,
        pars: GenerateSwapTxsParJs,
    ) -> Result<UnsignedSwapTransactions> {
        let validated_inputs = self.validate_swap_pars(pars).await?;
        Ok(self
            .swap_intent_to_unsigned_swap_transactions(validated_inputs.to_swap())
            .await?)
    }

    pub async fn swap_intent_to_unsigned_swap_transactions(
        &self,
        swap: SwapIntent,
    ) -> Result<UnsignedSwapTransactions> {
        let mut my_tx = self
            .generate_tx(swap.me, swap.peer, swap.send, swap.my_fee)
            .await?;
        let mut peer_tx = self
            .generate_tx(swap.peer, swap.me, swap.receive, swap.peer_fee)
            .await?;
        TxGroup::assign_group_id(vec![&mut my_tx, &mut peer_tx])?;

        Ok(UnsignedSwapTransactions { my_tx, peer_tx })
    }

    async fn generate_tx(
        &self,
        sender: Address,
        receiver: Address,
        unit: Transfer,
        fee: MicroAlgos,
    ) -> Result<Transaction> {
        Ok(TxnBuilder::with(
            SuggestedTransactionParams {
                fee,
                ..self.algod.suggested_transaction_params().await?
            },
            match unit {
                Transfer::Algos { amount } => {
                    Pay::new(sender, receiver, MicroAlgos(amount)).build()
                }
                Transfer::Asset { id, amount } => {
                    TransferAsset::new(sender, id, amount, receiver).build()
                }
            },
        )
        .build())
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
}
