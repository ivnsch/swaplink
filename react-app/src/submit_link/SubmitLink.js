import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { init, submitTxs, fetchSwapData } from "./controller";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { MdContentCopy } from "react-icons/md";

export const SubmitLink = (props) => {
  let { link } = useParams();

  const [swapRequest, setSwapRequest] = useState(null);
  const [swapViewData, setSwapViewData] = useState(null);
  const [peerAddressIsCopied, setPeerAddressIsCopied] = useState(false);

  const [sendAssetIdIsCopied, setSendAssetIdIsCopied] = useState(false);
  const [receiveAssetIdIsCopied, setReceiveAssetIdIsCopied] = useState(false);

  useEffect(() => {
    init(
      link,
      props.statusMsg,
      setSwapRequest,
      setSwapViewData,
      props.showProgress
    );
  }, []);

  const onCopyPeerAddress = () => {
    setPeerAddressIsCopied(true);
    setTimeout(() => {
      setPeerAddressIsCopied(false);
    }, 1000);
  };

  const onCopySendAssetId = () => {
    setSendAssetIdIsCopied(true);
    setTimeout(() => {
      setSendAssetIdIsCopied(false);
    }, 1000);
  };

  const onCopyReceiveAssetId = () => {
    setReceiveAssetIdIsCopied(true);
    setTimeout(() => {
      setReceiveAssetIdIsCopied(false);
    }, 1000);
  };

  const swapViewDataView = () => {
    return (
      swapViewData && (
        <div>
          <div className="submit-swap-label">{"From:"}</div>
          <CopyToClipboard text={swapViewData.peer} onCopy={onCopyPeerAddress}>
            <div className="copyable">
              {swapViewData.peer}
              <span class="copy">
                {peerAddressIsCopied ? "copied!" : <MdContentCopy />}
              </span>
            </div>
          </CopyToClipboard>
          <div className="submit-swap-label">{"You send:"}</div>
          {tranferView(
            swapViewData.send,
            sendAssetIdIsCopied,
            onCopySendAssetId
          )}
          <div className="submit-swap-label">{"You receive:"}</div>
          {tranferView(
            swapViewData.receive,
            receiveAssetIdIsCopied,
            onCopyReceiveAssetId
          )}
          <div className="submit-swap-label">{"Your fee:"}</div>
          <div>{swapViewData.my_fee}</div>
        </div>
      )
    );
  };

  return (
    <div>
      <div className="container">
        <div className="submit-swap-title">{"You got a swap request!"}</div>
        {swapViewDataView(swapViewData)}
        <button
          className="submit-sign-and-submit-button"
          disabled={!swapViewData}
          onClick={async () => {
            await submitTxs(swapRequest, props.statusMsg, props.showProgress);
          }}
        >
          {"Sign and submit"}
        </button>
      </div>
    </div>
  );
};

const tranferView = (transfer, assetIdIsCopied, onCopyAssetId) => {
  if (transfer.unit === "algo") {
    return <div>{transfer.amount + " Algos"}</div>;
  } else if (transfer.unit === "asset") {
    let text =
      "Asset id: " + transfer.asset_id + ", amount: " + transfer.amount;
    return (
      <CopyToClipboard text={text} onCopy={onCopyAssetId}>
        <div className="copyable">
          {text}
          <span class="copy">
            {assetIdIsCopied ? "copied!" : <MdContentCopy />}
          </span>
        </div>
      </CopyToClipboard>
    );
  } else {
    throw new Error("Invalid transfer type: " + transfer.unit);
  }
};
