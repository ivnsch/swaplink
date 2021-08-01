use algonaut::core::{Address, MicroAlgos};

/// Complete and validated swap data, ready to start the signing and link generation flow.
#[derive(Debug, Clone)]
pub struct SwapIntent {
    pub me: Address,
    pub peer: Address,
    pub send: Transfer,
    pub receive: Transfer,
    pub my_fee: MicroAlgos,
    pub peer_fee: MicroAlgos,
}

/// Validated form inputs
#[derive(Debug, Clone)]
pub struct ValidatedSwapInputs {
    pub peer: Address,
    pub send: Transfer,
    pub receive: Transfer,
    pub my_fee: MicroAlgos,
    pub peer_fee: MicroAlgos,
}

impl ValidatedSwapInputs {
    pub fn to_swap(&self, me: Address) -> SwapIntent {
        SwapIntent {
            me,
            peer: self.peer,
            send: self.send.clone(),
            receive: self.receive.clone(),
            my_fee: self.my_fee,
            peer_fee: self.peer_fee,
        }
    }
}

/// Raw form inputs
#[derive(Debug, Clone)]
pub struct SwapInputs {
    pub peer: String,
    pub send_amount: String,
    pub send_unit: SwapInputUnit,
    pub send_asset_id: String,
    pub receive_amount: String,
    pub receive_unit: SwapInputUnit,
    pub receive_asset_id: String,
    pub my_fee: String,
    pub peer_fee: String,
}

/// Wrapper for the link path containg the encoded swap data.
#[derive(Debug, Clone)]
pub struct SwapLink(pub String);

#[derive(Debug, Clone)]
pub enum SwapRole {
    Sender,
    Receiver,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SwapInputUnit {
    Algos,
    Asset,
}

#[derive(Debug, Clone)]
pub enum Transfer {
    Algos { amount: u64 },
    Asset { id: u64, amount: u64 },
}
