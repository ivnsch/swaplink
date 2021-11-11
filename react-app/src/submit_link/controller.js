import { sign } from "../MyAlgo";

const wasmPromise = import("wasm");

export const init = async (statusMsg) => {
  try {
    const { init_log } = await wasmPromise;
    await init_log();
  } catch (e) {
    statusMsg.error(e);
  }
};

export const fetchSwapData = async (
  link,
  apiKey,
  statusMsg,
  setSwapRequest,
  setSwapViewData,
  showProgress
) => {
  try {
    showProgress(true);

    const { bridge_decode_link } = await wasmPromise;
    console.log("will decode!");
    const swapRequest = await bridge_decode_link({
      swap_link: link,
      api_key: apiKey,
    });
    console.log("decoded!");

    setSwapRequest(swapRequest);
    setSwapViewData(swapRequest.view_data);

    showProgress(false);
  } catch (e) {
    statusMsg.error(e);
    showProgress(false);
  }
};

export const submitTxs = async (
  apiKey,
  swapRequest,
  statusMsg,
  showProgress
) => {
  const { bridge_submit_txs } = await wasmPromise;
  statusMsg.clear();

  let signed = await sign(swapRequest.unsigned_my_tx_my_algo_format);

  showProgress(true);
  try {
    const txId = await bridge_submit_txs({
      api_key: apiKey,
      signed_my_tx_msg_pack: signed,
      pt: swapRequest.pt, // passthrough
    });
    statusMsg.success("Swap submitted! Tx id: " + txId);
    showProgress(false);
  } catch (e) {
    statusMsg.error(e);
    showProgress(false);
  }
};
