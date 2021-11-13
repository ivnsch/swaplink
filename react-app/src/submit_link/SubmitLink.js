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
        <div>
          <div className="submit-swap-label">{"From:"}</div>
          <CopyPasteText text={swapViewData.peer} />
          <div className="submit-swap-label">{"You send:"}</div>
          {tranferView(swapViewData.send)}
          <div className="submit-swap-label">{"You receive:"}</div>
          {tranferView(swapViewData.receive)}
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

const tranferView = (transfer) => {
  if (transfer.unit === "algo") {
    return <div>{transfer.amount + " Algos"}</div>;
  } else if (transfer.unit === "asset") {
    let text =
      "Asset id: " + transfer.asset_id + ", amount: " + transfer.amount;
    return <CopyPasteText text={text} />;
  } else {
    throw new Error("Invalid transfer type: " + transfer.unit);
  }
};
