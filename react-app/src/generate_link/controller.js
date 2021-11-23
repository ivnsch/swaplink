import { sign } from "../MyAlgo";
import {
  unitIsAlgo,
  unitIsAsset,
  emptyAsset,
  emptyAlgo,
} from "./TokenFunctions";

const wasmPromise = import("wasm");

export const init = async (statusMsg, setMyFee, setPeerFee, setFeeTotal) => {
  try {
    const { init_log, bridge_suggested_fees } = await wasmPromise;
    await init_log();

    const suggestedFees = await bridge_suggested_fees();
    setMyFee(suggestedFees.mine);
    setPeerFee(suggestedFees.peer);
    setFeeTotal(suggestedFees.total);
  } catch (e) {
    statusMsg.error(e);
  }
};

export const generateSwapTxs = async (
  sendToken,
  receiveToken,
  myAddress,
  peerAddress,
  myFee,
  peerFee,
  statusMsg,
  showProgress,
  setSwapLink,
  setSwapLinkTruncated,
  setShowLinkModal,
  wallet
) => {
  try {
    const { bridge_generate_swap_txs, bridge_generate_link } =
      await wasmPromise;
    statusMsg.clear();
    showProgress(true);

    let swapPars = {
      my_address: myAddress,
      peer_address: peerAddress,

      send_amount: sendToken.amount,
      send_asset_id: sendToken.unit.assetData?.assetId ?? "",
      send_unit: sendToken.unit.name,

      receive_amount: receiveToken.amount,
      receive_asset_id: receiveToken.unit.assetData?.assetId ?? "",
      receive_unit: receiveToken.unit.name,

      my_fee: myFee,
      peer_fee: peerFee,
    };

    let swapTxs = await bridge_generate_swap_txs(swapPars);
    showProgress(false);

    const signedTx = await wallet.sign(swapTxs.to_sign_wc);

    let link = await bridge_generate_link({
      api_key: swapPars.api_key,
      signed_my_tx_msg_pack: signedTx,
      pt: swapTxs.pt, // passthrough
    });

    setSwapLink(link);
    setSwapLinkTruncated(link.replace(/(.*)\/(.*).(?=....)/, "$1/..."));
    setShowLinkModal(true);
  } catch (e) {
    statusMsg.error(e);
    showProgress(false);
  }
};

export const updateFeeTotal = async (
  statusMsg,
  myFee,
  peerFee,
  setTotalFee,
  setHideFeeTotal
) => {
  try {
    const { bridge_add_fees } = await wasmPromise;
    statusMsg.clear();

    let res = await bridge_add_fees({
      my_fee: myFee,
      peer_fee: peerFee,
    });
    setTotalFee(res.total);
    setHideFeeTotal(false);
  } catch (e) {
    statusMsg.error(e);
    // couldn't calculate total: clear the outdated total (just for correctness) and hide the view
    setTotalFee("");
    setHideFeeTotal(true);
  }
};

export const updateTokenWithUserSelectedUnit = async (
  statusMsg,
  showProgress,
  myAddress,
  myBalance,
  setToken,
  unit
) => {
  // when the user selects the unit we fetch the balance to show on the UI
  const balance = await getBalanceForToken(
    statusMsg,
    showProgress,
    myAddress,
    myBalance,
    unit
  );
  setToken((token) => updateTokenWithUnitAndBalance(token, unit, balance));
};

const getBalanceForToken = async (
  statusMsg,
  showProgress,
  myAddress,
  myBalance,
  unit
) => {
  var balance;
  if (unitIsAsset(unit)) {
    if (!unit.assetData) {
      throw Error("Illegal state: asset must have assetData on user selection");
    }
    // if token is asset, we've to fetch balance
    balance = await fetchAssetHoldings(
      statusMsg,
      showProgress,
      myAddress,
      unit.assetData.assetId,
      unit.assetData.ptForBridgeAssetHoldings
    );
  } else if (unitIsAlgo(unit)) {
    // if token is algo, we've balance already (outer hook)
    balance = myBalance;
  } else {
    throw Error("Invalid unit: " + unit);
  }
  return balance;
};

const updateTokenWithUnitAndBalance = (token, newUnit, newBalance) => {
  var tokenToUpdate = token;
  // if token not set yet (can happen at the beginning, when one of the inupts is unselected - normally meant for an asset)
  // initialize to an empty token
  if (!tokenToUpdate) {
    if (unitIsAsset(newUnit)) {
      tokenToUpdate = emptyAsset();
    } else if (unitIsAlgo(newUnit)) {
      tokenToUpdate = emptyAlgo();
    }
  }

  return {
    ...tokenToUpdate,
    unit: newUnit,
    balance: newBalance,
  };
};

export const fetchAssetHoldings = async (
  statusMsg,
  showProgress,
  address,
  assetId,
  ptForBridgeAssetHoldings
) => {
  try {
    const { bridge_asset_holdings } = await wasmPromise;
    statusMsg.clear();
    showProgress(true);

    let res = await bridge_asset_holdings({
      address: address,
      asset_id: assetId,
      pt: ptForBridgeAssetHoldings,
    });

    showProgress(false);

    return res.holdings;
  } catch (e) {
    statusMsg.error(e);
    showProgress(false);
  }
};
