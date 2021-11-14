const wasmPromise = import("wasm");

export const onAlgoClick = async (onUnitSelected, setAssetUnitLabel) => {
  onUnitSelected("algo");
  setAssetUnitLabel("algo");
};

export const onAssetSubmit = async (
  statusMsg,
  address,
  assetId,
  setAssetId,
  setAssetBalance,
  onUnitSelected,
  setAssetUnitLabel
) => {
  try {
    statusMsg.clear();
    let assetInfos = await fetchAssetInfos(address, assetId);
    setAssetId(assetInfos.id);
    setAssetBalance(assetInfos.balance);
    onUnitSelected("asset");
    setAssetUnitLabel(assetInfos.name_id_label);
  } catch (e) {
    statusMsg.error(e);
  }
};

const fetchAssetInfos = async (address, assetId) => {
  const { bridge_asset_infos } = await wasmPromise;

  let assetInfos = await bridge_asset_infos({
    address: address,
    asset_id: assetId,
  });
  console.log("fetched asset infos: " + JSON.stringify(assetInfos));
  return assetInfos;
};
