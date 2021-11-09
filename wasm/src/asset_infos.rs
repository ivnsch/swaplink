use algonaut::{
    algod::v2::Algod,
    error::{AlgonautError, RequestError, RequestErrorDetails},
    model::algod::v2::Asset,
};
use anyhow::{anyhow, Result};

pub async fn asset_infos(algod: &Algod, asset_id: u64) -> Result<Asset> {
    let infos = algod
        .asset_information(asset_id)
        .await
        .map_err(|e| map_possible_asset_id_not_found_workaround(e, asset_id))?;

    Ok(infos)
}

// Workaround for PureStake API, from which we get a CORS error when the asset id isn't found.
fn map_possible_asset_id_not_found_workaround(
    error: AlgonautError,
    asset_id: u64,
) -> anyhow::Error {
    if let AlgonautError::Request(RequestError {
        url: _,
        details: RequestErrorDetails::Client { description },
    }) = &error
    {
        if description.contains("TypeError: Failed to fetch")
            || description.contains("not allowed by Access-Control-Allow-Origin")
        {
            anyhow!("Couldn't find asset id: {}", asset_id)
        } else {
            error.into()
        }
    } else {
        error.into()
    }
}
