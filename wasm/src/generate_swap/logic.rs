use std::{convert::TryInto, rc::Rc, str::FromStr};

use algonaut::{
    algod::v2::Algod,
    core::{Address, MicroAlgos},
    transaction::{
        builder::TxnFee, tx_group::TxGroup, Pay, Transaction, TransferAsset, TxnBuilder,
    },
};
use anyhow::{anyhow, Result};
use rust_decimal::Decimal;

use crate::{
    conversions::{to_base_units, validate_algos},
    dependencies::base_url,
    model::{SwapRequest, UnsignedSwapTransactions},
};

use super::{
    bridge::generate_swap_txs::GenerateSwapTxsParJs,
    model::{SwapInputUnit, SwapIntent, SwapLink, Transfer, ValidatedSwapPars},
};

pub struct GenerateSwapLogic {
    algod: Rc<Algod>,
}

impl GenerateSwapLogic {
    pub fn new(algod: Rc<Algod>) -> GenerateSwapLogic {
        GenerateSwapLogic { algod }
    }

    async fn validate_swap_pars(&self, pars: GenerateSwapTxsParJs) -> Result<ValidatedSwapPars> {
        let me = pars
            .my_address
            .parse()
            .map_err(|_| anyhow!("Your address ({:?}) is invalid.", pars.my_address))?;
        let peer = pars
            .peer_address
            .parse()
            .map_err(|_| anyhow!("Peer address ({:?}) is invalid", pars.peer_address))?;

        let send_amount = Decimal::from_str(&pars.send_amount)
            .map_err(|e| anyhow!("Send amount ({:?}) is invalid: {}", pars.send_amount, e))?;
        let receive_amount = Decimal::from_str(&pars.receive_amount).map_err(|e| {
            anyhow!(
                "Receive amount ({:?}) is invalid: {}",
                pars.receive_amount,
                e
            )
        })?;

        let send_unit = Self::validate_unit(&pars.send_unit)
            .map_err(|e| anyhow!("Send token ({:?}) is invalid: {}", pars.send_unit, e))?;
        let receive_unit = Self::validate_unit(&pars.receive_unit)
            .map_err(|e| anyhow!("Receive token ({:?}) is invalid: {}", pars.receive_unit, e))?;

        let send = self
            .validate_transfer(send_unit, send_amount, &pars.send_asset_id)
            .await
            .map_err(|e| anyhow!("Send transfer validation failed: {}", e))?;

        let receive = self
            .validate_transfer(receive_unit, receive_amount, &pars.receive_asset_id)
            .await
            .map_err(|e| anyhow!("Receive transfer validation failed: {}", e))?;

        let my_fee = validate_algos(
            Decimal::from_str(&pars.my_fee)
                .map_err(|e| anyhow!("Your fee ({:?}) couldn't be parsed: {}", pars.my_fee, e))?,
        )?;
        let peer_fee =
            validate_algos(Decimal::from_str(&pars.peer_fee).map_err(|e| {
                anyhow!("Peer fee ({:?}) couldn't be parsed: {}", pars.peer_fee, e)
            })?)?;

        Ok(ValidatedSwapPars {
            me,
            peer,
            send,
            receive,
            my_fee,
            peer_fee,
        })
    }

    fn validate_unit(unit_str: &str) -> Result<SwapInputUnit> {
        match unit_str {
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
        asset_id_input: &str,
    ) -> Result<Transfer> {
        match input_unit {
            SwapInputUnit::Algos => Self::validate_algos_transfer(amount),
            SwapInputUnit::Asset => {
                Ok(self.validate_asset_transfer(amount, asset_id_input).await?)
            }
        }
    }

    pub fn validate_algos_transfer(amount: Decimal) -> Result<Transfer> {
        Ok(Transfer::Algos {
            amount: validate_algos(amount)?.0,
        })
    }

    async fn validate_asset_transfer(
        &self,
        amount: Decimal,
        asset_id_input: &str,
    ) -> Result<Transfer> {
        let asset_id = asset_id_input.parse()?;
        let asset_config = &self.algod.asset_information(asset_id).await?;
        Self::validate_asset_transfer_with_fractionals(
            asset_config.params.decimals,
            amount,
            asset_id,
        )
    }

    pub fn validate_asset_transfer_with_fractionals(
        asset_config_max_fractional_digits: u64,
        amount: Decimal,
        asset_id: u64,
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
                "Asset amount has more fractional digits({}) than allowed({})",
                input_fractionals,
                asset_config_max_possible_fractional_digits
            ));
        }

        if input_fractionals as u64 > asset_config_max_fractional_digits {
            return Err(anyhow!(
                "Asset amount has more fractional digits({}) than allowed by asset config({})",
                input_fractionals,
                asset_config_max_fractional_digits
            ));
        }

        Ok(Transfer::Asset {
            id: asset_id,
            amount: to_base_units(amount, asset_config_max_fractional_digits.try_into()?)?,
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
        TxGroup::assign_group_id(&mut [&mut my_tx, &mut peer_tx])?;

        Ok(UnsignedSwapTransactions { my_tx, peer_tx })
    }

    async fn generate_tx(
        &self,
        sender: Address,
        receiver: Address,
        unit: Transfer,
        fee: MicroAlgos,
    ) -> Result<Transaction> {
        let params = self.algod.suggested_transaction_params().await?;
        Ok(TxnBuilder::with_fee(
            &params,
            TxnFee::Fixed(fee),
            match unit {
                Transfer::Algos { amount } => {
                    Pay::new(sender, receiver, MicroAlgos(amount)).build()
                }
                Transfer::Asset { id, amount } => {
                    TransferAsset::new(sender, id, amount, receiver).build()
                }
            },
        )
        .build()?)
    }
}
