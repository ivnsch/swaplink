import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { init, submitTxs } from "./controller";
import Modal from "../Modal";
import { PureStakeHelp } from "../PureStakeHelp";

export const SubmitLink = (props) => {
  let { link } = useParams();

  const [swapRequest, setSwapRequest] = useState(null);
  const [swapViewData, setSwapViewData] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [showPurestakeHelpModal, setShowPurestakeHelpModal] = useState(false);

  useEffect(() => {
    init(link, apiKey, props.statusMsg, setSwapRequest, setSwapViewData);
  }, [link]);

  const swapViewDataView = () => {
    if (swapViewData) {
      return (
        <div>
          <div className="submit-swap-label">{"From:"}</div>
          <div>{swapViewData.peer}</div>
          <div className="submit-swap-label">{"You send:"}</div>
          {tranferView(swapViewData.send)}
          <div className="submit-swap-label">{"You receive:"}</div>
          {tranferView(swapViewData.receive)}
          <div className="submit-swap-label">{"Your fee:"}</div>
          <div>{swapViewData.my_fee}</div>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div>
      <div className="container">
        <div className="submit-swap-title">{"You got a swap request!"}</div>
        <div>
          {"Purestake api key "}
          <a href="#" onClick={() => setShowPurestakeHelpModal(true)}>
            ?
          </a>
        </div>
        <input
          type="password"
          placeholder="api key"
          className="address-input"
          size="64"
          value={apiKey}
          onChange={(event) => {
            setApiKey(event.target.value);
          }}
        />
        {swapViewDataView(swapViewData)}
        <button
          className="submit-sign-and-submit-button"
          onClick={async () => {
            await submitTxs(
              apiKey,
              swapRequest,
              props.statusMsg,
              props.showProgress
            );
          }}
        >
          {"Sign and submit"}
        </button>
        {showPurestakeHelpModal && (
          <Modal
            title={"Purestake API key help"}
            onCloseClick={() => setShowPurestakeHelpModal(false)}
          >
            <PureStakeHelp />
          </Modal>
        )}
      </div>
    </div>
  );
};

const tranferView = (transfer) => {
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
