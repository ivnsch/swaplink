use algonaut::{
    error::{AlgonautError, RequestError, RequestErrorDetails},
    indexer::v2::Indexer,
    model::indexer::v2::{Asset, QueryAssetsInfo},
};
use anyhow::{anyhow, Result};

pub async fn asset_infos(indexer: &Indexer, asset_id: u64) -> Result<Asset> {
    // TODO improve indexer interface in Algonaut
    let infos = indexer
        .assets_info(
            &asset_id.to_string(),
            &QueryAssetsInfo {
                include_all: Some(true),
            },
        )
        .await
        .map_err(|e| map_possible_asset_id_not_found_workaround(e, asset_id))?;

    Ok(*infos.asset)
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
        if description.contains("TypeError: Failed to fetch") {
            anyhow!("Couldn't find asset id: {}", asset_id)
        } else {
            error.into()
        }
    } else {
        error.into()
    }
}
