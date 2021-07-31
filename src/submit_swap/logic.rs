use std::rc::Rc;

use algonaut::algod::v2::Algod;
use anyhow::Result;
use log::debug;
use my_algo::MyAlgo;

use crate::model::SwapRequest;

pub struct SubmitSwapLogic {
    algod: Rc<Algod>,
    my_algo: Rc<MyAlgo>,
}

impl SubmitSwapLogic {
    pub fn new(algod: Rc<Algod>, my_algo: Rc<MyAlgo>) -> SubmitSwapLogic {
        SubmitSwapLogic { algod, my_algo }
    }

    /// Process peer's swap request: sign my tx and submit the tx group to the network.
    pub async fn decode_swap(&self, encoded_swap: String) -> Result<SwapRequest> {
        SwapRequest::from_url_encoded_str(encoded_swap)
    }

    /// Process peer's swap request: sign my tx and submit the tx group to the network.
    pub async fn submit_swap(&self, request: SwapRequest) -> Result<String> {
        let my_tx = request.unsigned_tx;
        let my_signed_tx_my_algo = self.my_algo.sign(&my_tx).await?;
        let my_signed_tx = rmp_serde::from_slice(&my_signed_tx_my_algo.blob)?;

        let peer_signed_tx = request.signed_tx;

        debug!("Sending transaction group to node");
        debug!("My signed tx: {:?}", my_signed_tx);
        debug!("Peer signed tx: {:?}", peer_signed_tx);

        let send_response = self
            .algod
            .broadcast_signed_transactions(&[peer_signed_tx, my_signed_tx])
            .await;
        debug!("Response: {:?}", send_response);
        Ok(send_response?.tx_id)
    }
}
