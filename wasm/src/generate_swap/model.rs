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
pub struct ValidatedSwapPars {
    pub me: Address,
    pub peer: Address,
    pub send: Transfer,
    pub receive: Transfer,
    pub my_fee: MicroAlgos,
    pub peer_fee: MicroAlgos,
}

impl ValidatedSwapPars {
    pub fn to_swap(&self) -> SwapIntent {
        SwapIntent {
            me: self.me,
            peer: self.peer,
            send: self.send.clone(),
            receive: self.receive.clone(),
            my_fee: self.my_fee,
            peer_fee: self.peer_fee,
        }
    }
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
