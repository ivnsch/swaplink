import React, { useState, useEffect } from "react";
import Modal from "../Modal";
import {
  init,
  generateSwapTxs,
  algoToken,
  initDefaultToken,
} from "./controller";
import AssetInputRow from "./AssetInputRow";
import SwapLinkView from "./SwapLinkView";
import { FeesModal } from "./FeesModal";
import { SelectTokenModal } from "./select_token/SelectTokenModal";

export const GenerateLink = (props) => {
  const [peerAddress, setPeerAddress] = useState("");

  const [sendToken, setSendToken] = useState(null);
  const [receiveToken, setReceiveToken] = useState(null);

  const [myFee, setMyFee] = useState("");
  const [peerFee, setPeerFee] = useState("");
  const [feeTotal, setFeeTotal] = useState("");
  const [hideFeeTotal, setHideFeeTotal] = useState(false);

  const [swapLink, setSwapLink] = useState("");
  const [swapLinkTruncated, setSwapLinkTruncated] = useState("");

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showFeesModal, setShowFeesModal] = useState(false);
  const [showSendUnitModal, setShowSendUnitModal] = useState(false);
  const [showReceiveUnitModal, setShowReceiveUnitModal] = useState(false);

  useEffect(() => {
    init(props.statusMsg, setMyFee, setPeerFee, setFeeTotal, setSendToken);
  }, []);

  useEffect(() => {
    initDefaultToken(props.statusMsg, setSendToken, props.myBalance);
  }, [props.myBalance]);

  return (
    <div>
      <div className="container">
        <div style={{ marginTop: 20, marginBottom: 40 }}>
          {"Generate a link to swap Algos, ASAs or NFTs with a peer"}
        </div>
        <div>
          <div>{"Peer"}</div>
          <input
            placeholder="Peer address"
            className="address-input"
            size="64"
            value={peerAddress}
            onChange={(event) => {
              setPeerAddress(event.target.value);
            }}
          />

          <div id="swap-container">
            <div>{"You send"}</div>
            <AssetInputRow
              token={sendToken}
              setToken={setSendToken}
              onTokenClick={() => setShowSendUnitModal(true)}
            />

            <button
              onClick={() => {
                setSendToken(receiveToken);
                setReceiveToken(sendToken);
              }}
            >
              {"Invert"}
            </button>

            <div>{"You receive"}</div>
            <AssetInputRow
              token={receiveToken}
              setToken={setReceiveToken}
              onTokenClick={() => {
                setShowReceiveUnitModal(true);
              }}
            />
          </div>

          <div id="fee-container">
            <span style={{ marginRight: 5 }}>{"Fee:"}</span>
            <span>
              <button
                onClick={async () => {
                  setShowFeesModal(true);
                }}
              >
                {feeTotal}
              </button>
            </span>
          </div>

          <button
            className="submit-button"
            disabled={
              props.myAddress === "" ||
              peerAddress === "" ||
              !sendToken ||
              !receiveToken
                ? true
                : false
            }
            onClick={async () => {
              await generateSwapTxs(
                sendToken,
                receiveToken,
                props.myAddress,
                peerAddress,
                myFee,
                peerFee,
                props.statusMsg,
                props.showProgress,
                setSwapLink,
                setSwapLinkTruncated,
                setShowLinkModal,
                props.wallet
              );
            }}
          >
            {"Generate link"}
          </button>

          {showLinkModal && (
            <Modal title={"Done!"} onCloseClick={() => setShowLinkModal(false)}>
              <SwapLinkView
                swapLinkTruncated={swapLinkTruncated}
                swapLink={swapLink}
              />
            </Modal>
          )}
          {showFeesModal && (
            <FeesModal
              myFee={myFee}
              setMyFee={setMyFee}
              peerFee={peerFee}
              setPeerFee={setPeerFee}
              feeTotal={feeTotal}
              setFeeTotal={setFeeTotal}
              hideFeeTotal={hideFeeTotal}
              setHideFeeTotal={setHideFeeTotal}
              setShowFeesModal={setShowFeesModal}
            />
          )}
          {showSendUnitModal && (
            <SelectTokenModal
              showProgress={props.showProgress}
              setToken={setSendToken}
              setShowModal={setShowSendUnitModal}
              myAddress={props.myAddress}
            />
          )}

          {showReceiveUnitModal && (
            <SelectTokenModal
              showProgress={props.showProgress}
              setToken={setReceiveToken}
              setShowModal={setShowReceiveUnitModal}
              myAddress={props.myAddress}
            />
          )}
        </div>
      </div>
    </div>
  );
};
