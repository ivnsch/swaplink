use algonaut::{algod::v2::Algod, error::AlgonautError, model::algod::v2::PendingTransaction};
use gloo_timers::future::TimeoutFuture;
use instant::Instant;
use std::time::Duration;

/// Utility function to wait on a transaction to be confirmed
pub async fn wait_for_pending_transaction(
    algod: &Algod,
    tx_id: &str,
) -> Result<Option<PendingTransaction>, AlgonautError> {
    let timeout = Duration::from_secs(60);
    let start = Instant::now();
    log::debug!("Start waiting for pending tx confirmation..");
    loop {
        let pending_transaction = algod.pending_transaction_with_id(tx_id).await?;
        // If the transaction has been confirmed or we time out, exit.
        if pending_transaction.confirmed_round.is_some() {
            return Ok(Some(pending_transaction));
        } else if start.elapsed() >= timeout {
            log::debug!("Timeout waiting for pending tx");
            return Ok(None);
        }
        TimeoutFuture::new(250).await;
    }
}
