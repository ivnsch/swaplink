import { sign } from "../MyAlgo";

const wasmPromise = import("wasm");

export const init = async (
  link,
  apiKey,
  setErrorMsg,
  setSwapRequest,
  setSwapViewData
) => {
  try {
    const { init_log, bridge_decode_link } = await wasmPromise;
    const swapRequest = await bridge_decode_link({
      swap_link: link,
      api_key: apiKey,
    });

    init_log();
    setSwapRequest(swapRequest);
    setSwapViewData(swapRequest.view_data);
  } catch (e) {
    setErrorMsg(e + "");
  }
};

export const submitTxs = async (
  apiKey,
  swapRequest,
  setSuccessMsg,
  setErrorMsg
) => {
  const { bridge_submit_txs } = await wasmPromise;
  setErrorMsg("");

  try {
    const txId = await bridge_submit_txs({
      api_key: apiKey,
      signed_my_tx_msg_pack: await sign(
        swapRequest.unsigned_my_tx_my_algo_format
      ),
      pr: swapRequest.pr, // passthrough
    });
    setSuccessMsg("Swap submitted! Tx id: " + txId);
  } catch (e) {
    setErrorMsg(e + "");
  }
};
