const wasmPromise = import("wasm");

export const init = async (statusMsg) => {
  try {
    const { init_log } = await wasmPromise;
    await init_log();
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
  setShowLinkModal,
  wallet
) => {
  try {
    const { bridge_generate_swap_txs, bridge_generate_link } =
      await wasmPromise;
    statusMsg.clear();
    showProgress(true);

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
