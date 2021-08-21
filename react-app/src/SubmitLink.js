import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { connectWallet, sign } from "./MyAlgo";

const wasmPromise = import("wasm");

export const SubmitLink = () => {
  let { link } = useParams();

  const [myAddress, setMyAddress] = useState("");
  const [swapRequest, setSwapRequest] = useState(null);
  const [swapViewData, setSwapViewData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const init = async () => {
      const { init_log, decode_link } = await wasmPromise;
      const swapRequest = await decode_link(link);

      init_log();
      setSwapRequest(swapRequest);
      setSwapViewData(swapRequest.view_data);
    };
    init();
  }, [link]);

  const swapViewDataElement = () => {
    if (swapViewData) {
      return (
        <div>
          <div className="submit-swap-label">{"From:"}</div>
          <div>{swapViewData.peer}</div>
          <div className="submit-swap-label">{"You send:"}</div>
          {tranferElement(swapViewData.send)}
          <div className="submit-swap-label">{"You receive:"}</div>
          {tranferElement(swapViewData.receive)}
          <div className="submit-swap-label">{"Your fee:"}</div>
          <div>{swapViewData.my_fee}</div>
        </div>
      );
    } else {
      return null;
    }
  };

  const successMsgElement = () => {
    if (successMsg) {
      return <div className="success">{successMsg}</div>;
    } else {
      return null;
    }
  };

  const errorMsgElement = () => {
    if (errorMsg) {
      return <div className="error">{errorMsg}</div>;
    } else {
      return null;
    }
  };

  const yourAddressElement = () => {
    if (myAddress !== "") {
      return (
        <div>
          <div>{"Your address:"}</div>
          <div className="your-address">{myAddress}</div>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div>
      <div className="container">
        <div className="warning">
          {
            "This site is under development. It operates on TestNet. Use only for testing purposes."
          }
        </div>
        <button
          className="connect-button"
          onClick={async (event) => {
            try {
              setMyAddress(await connectWallet());
            } catch (e) {
              setErrorMsg(e + "");
            }
          }}
        >
          {"Connect My Algo wallet"}
        </button>
        {yourAddressElement()}
        <div className="submit-swap-title">{"You got a swap request!"}</div>
        {successMsgElement()}
        {errorMsgElement()}
        {swapViewDataElement(swapViewData)}
        <button
          className="submit-sign-and-submit-button"
          onClick={async () => {
            const { submit_transactions } = await wasmPromise;
            setErrorMsg("");

            try {
              const signed_txns = {
                signed_my_tx_msg_pack: await sign(
                  swapRequest.unsigned_my_tx_my_algo_format
                ),
                signed_peer_tx_msg_pack: swapRequest.signed_peer_tx_msg_pack, // passthrough
              };
              const tx_id = await submit_transactions(signed_txns);
              setSuccessMsg("Swap submitted! Tx id: " + tx_id);
            } catch (e) {
              setErrorMsg(e + "");
            }
          }}
        >
          {"Sign and submit"}
        </button>
      </div>
    </div>
  );
};

const tranferElement = (transfer) => {
  if (transfer.unit === "algo") {
    return <div>{transfer.amount + " Algos"}</div>;
  } else if (transfer.unit === "asset") {
    return (
      <div>
        {"Asset id: " + transfer.asset_id + ", amount: " + transfer.amount}
      </div>
    );
  } else {
    throw new Error("Invalid transfer type: " + transfer.unit);
  }
};
