import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { init, submitTxs } from "./controller";
import CopyPasteText from "../CopyPasteText";

export const SubmitLink = (props) => {
  let { link } = useParams();

  const [swapRequest, setSwapRequest] = useState(null);
  const [swapViewData, setSwapViewData] = useState(null);

  useEffect(() => {
    init(
      link,
      props.statusMsg,
      setSwapRequest,
      setSwapViewData,
      props.showProgress
    );
  }, []);

  const swapViewDataView = () => {
    return (
      swapViewData && (
        <div className="swap-received-container">
          <div className="swap-from">
            <div className="submit-swap-label">{"From"}</div>
            <CopyPasteText text={swapViewData.peer} />
          </div>
          <div className="swap-inline">
            <div className="submit-swap-label">{"You send"}</div>
            {tranferView(swapViewData.send)}
          </div>
          <div className="swap-inline border-bottom">
            <div className="submit-swap-label">{"You receive"}</div>
            {tranferView(swapViewData.receive)}
          </div>
          <div className="swap-inline">
            <div className="submit-swap-label">{"Your fee"}</div>
            <div>{swapViewData.my_fee}</div>
          </div>

          <button
            className="btn btn--finalise-exchange"
            disabled={!swapViewData}
            onClick={async () => {
              await submitTxs(
                swapRequest,
                props.statusMsg,
                props.showProgress,
                props.setMyBalance,
                props.myAddress,
                props.wallet
              );
            }}
          >
            {"Sign and submit"}
          </button>
        </div>
      )
    );
  };

  return (
    <div>
      <div className="container">
        <div className="submit-swap-title">{"You got a swap request!"}</div>
        {swapViewDataView(swapViewData)}
      </div>
    </div>
  );
};

const tranferView = (transfer) => {
  if (transfer.unit === "algo") {
    return (
      <div className="calculated-amount">
        <span className="amount">{transfer.amount}</span>

        <span className="currency">
          <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2.82183 16L5.13576 11.9929L7.44969 8L9.74952 3.99295L10.1305 3.35802L10.2998 3.99295L11.0052 6.63139L10.2151 8L7.90119 11.9929L5.60137 16H8.3668L10.6807 11.9929L11.88 9.91887L12.4444 11.9929L13.5167 16H16L14.9276 11.9929L13.8553 8L13.5732 6.97002L15.2945 3.99295H12.783L12.6984 3.69665L11.8236 0.42328L11.7107 0H9.29802L9.24158 0.0846561L6.98409 3.99295L4.67015 8L2.37033 11.9929L0.0563965 16H2.82183Z"
              fill="#F8F9FF"
            />
          </svg>
          Algo
        </span>
      </div>
    );
  } else if (transfer.unit === "asset") {
    let text =
      "Asset id: " + transfer.asset_id + ", amount: " + transfer.amount;
    return <CopyPasteText text={text} />;
  } else {
    throw new Error("Invalid transfer type: " + transfer.unit);
  }
};
