use algonaut::transaction::Transaction;
use anyhow::Result;
use data_encoding::BASE64;
use serde::Serialize;

// Passed directly to WalletConnect in JS
#[derive(Debug, Clone, Serialize)]
pub struct WalletConnectTx {
    txn: String,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    signers: Option<Vec<String>>,
}

impl WalletConnectTx {
    pub fn new(tx: &Transaction, message: &str, to_be_signed: bool) -> Result<WalletConnectTx> {
        Ok(Self::new_with_msg_pack(
            &rmp_serde::to_vec_named(tx)?,
            message,
            to_be_signed,
        ))
    }

    /// Use if msg pack needed for something else, to avoid multiple conversion
    pub fn new_with_msg_pack(
        tx_msg_pack: &[u8],
        message: &str,
        to_be_signed: bool,
    ) -> WalletConnectTx {
        WalletConnectTx {
            txn: BASE64.encode(tx_msg_pack),
            message: message.to_owned(),
            // if it's not to be signed, wallet connect expects an empty array (nothing otherwise)
            signers: if to_be_signed { None } else { Some(vec![]) },
        }
    }
}
