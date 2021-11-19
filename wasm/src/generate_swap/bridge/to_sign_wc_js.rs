use crate::wallet_connect_tx::WalletConnectTx;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct ToSignWalletConnectJs {
    /// Transactions to be passed to WalletConnect in JS
    txs: Vec<WalletConnectTx>,
    /// The index of the just signed transaction, to be retrived from the WalletConnect result
    result_index: u32,
}

impl ToSignWalletConnectJs {
    pub fn new(
        tx1: WalletConnectTx,
        tx2: WalletConnectTx,
        result_index: u32,
    ) -> ToSignWalletConnectJs {
        ToSignWalletConnectJs {
            txs: vec![tx1, tx2],
            result_index,
        }
    }
}
