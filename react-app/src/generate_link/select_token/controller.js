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

export const search = async (
  statusMsg,
  showProgress,
  input,
  accountMsgPack
) => {
  try {
    statusMsg.clear();
    showProgress(true);

    const { bridge_search_token } = await wasmPromise;

    let res = await bridge_search_token({
      input: input,
      account_msg_pack: accountMsgPack,
    });
    console.log("search result: " + JSON.stringify(res));
    showProgress(false);

    return res.tokens;
  } catch (e) {
    statusMsg.error(e);
    showProgress(false);
    return null;
  }
};

export const featchAccountMsgPack = async (
  statusMsg,
  showProgress,
  address
) => {
  try {
    statusMsg.clear();
    showProgress(true);

    const { bridge_account } = await wasmPromise;

    let account = await bridge_account({
      address: address,
    });
    showProgress(false);

    return account;
  } catch (e) {
    statusMsg.error(e);
    showProgress(false);
    return null;
  }
};
