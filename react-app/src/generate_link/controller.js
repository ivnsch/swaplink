import { sign } from "../MyAlgo";

const wasmPromise = import("wasm");

export const init = async (statusMsg, setMyFee, setPeerFee, setFeeTotal) => {
  try {
    const { init_log, bridge_suggested_fees } = await wasmPromise;
    await init_log();

    const suggestedFees = await bridge_suggested_fees();
    console.log("suggested fees: " + JSON.stringify(suggestedFees));
    setMyFee(suggestedFees.mine);
    setPeerFee(suggestedFees.peer);
    setFeeTotal(suggestedFees.total);
  } catch (e) {
    statusMsg.error(e);
  }
};

export const generateSwapTxs = async (
  swapPars,
  statusMsg,
  showProgress,
  setSwapLink,
  setSwapLinkTruncated,
  setShowLinkModal
) => {
  try {
    const { bridge_generate_swap_txs, bridge_generate_link } =
      await wasmPromise;
    statusMsg.clear();
    showProgress(true);

    let unsignedSwapTransactions = await bridge_generate_swap_txs(swapPars);
    showProgress(false);

    let link = await bridge_generate_link({
      signed_my_tx_msg_pack: await sign(
        unsignedSwapTransactions.my_tx_my_algo_format
      ),
      pt: unsignedSwapTransactions.pt, // passthrough
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
