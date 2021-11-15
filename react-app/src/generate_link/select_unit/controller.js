const wasmPromise = import("wasm");

export const fetchAssetData = async (statusMsg, assetId, showProgress) => {
  try {
    statusMsg.clear();
    showProgress(true);

    const { bridge_asset_infos } = await wasmPromise;

    let assetInfos = await bridge_asset_infos({
      asset_id: assetId,
    });
    console.log("fetched asset infos: " + JSON.stringify(assetInfos));
    showProgress(false);

    return {
      assetId: assetInfos.id,
      unitLabel: assetInfos.name_id_label,
      ptForBridgeAssetHoldings: assetInfos.pt,
    };
  } catch (e) {
    statusMsg.error(e);
    showProgress(false);
    return null;
  }
};
