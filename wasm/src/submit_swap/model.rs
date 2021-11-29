/// Complete and validated swap data, ready to start the signing and link generation flow.
#[derive(Debug, Clone)]
pub struct SubmitSwapViewData {
    pub peer: String,
    pub send: SubmitTransferViewData,
    pub receive: SubmitTransferViewData,
    pub my_fee: String,
}

#[derive(Debug, Clone)]
pub enum SubmitTransferViewData {
    Algos {
        amount: String,
    },
    Asset {
        id: String,
        unit: Option<String>,
        name: Option<String>,
        amount: String,
    },
}
