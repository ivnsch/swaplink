import React, { useState, useEffect } from "react";
import Modal from "../Modal";
import { init, generateSwapTxs, updateFeeTotal } from "./controller";
import AssetInputRow from "./AssetInputRow";
import FeeInput from "./FeeInput";
import SwapLinkView from "./SwapLinkView";
import SelectUnit from "./SelectUnit";

export const GenerateLink = (props) => {
  const [peerAddress, setPeerAddress] = useState("");

  const [sendUnit, setSendUnit] = useState("algo");
  const [sendAmount, setSendAmount] = useState("");
  const [sendAssetId, setSendAssetId] = useState("");

  const [receiveUnit, setReceiveUnit] = useState("asset");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [receiveAssetId, setReceiveAssetId] = useState("");

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
    init(props.statusMsg, setMyFee, setPeerFee, setFeeTotal);
  }, []);

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
              assetId={sendAssetId}
              amount={sendAmount}
              setAmount={setSendAmount}
              unit={sendUnit}
              onUnitClick={() => setShowSendUnitModal(true)}
            />

            <button
              onClick={() => {
                setSendUnit(receiveUnit);
                setSendAssetId(receiveAssetId);
                setSendAmount(receiveAmount);

                setReceiveUnit(sendUnit);
                setReceiveAssetId(sendAssetId);
                setReceiveAmount(sendAmount);
              }}
            >
              {"Invert"}
            </button>

            <div>{"You receive"}</div>
            <AssetInputRow
              assetId={receiveAssetId}
              amount={receiveAmount}
              setAmount={setReceiveAmount}
              unit={receiveUnit}
              onUnitClick={() => setShowReceiveUnitModal(true)}
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
              sendAmount === "" ||
              receiveAmount === ""
                ? true
                : false
            }
            onClick={async () => {
              let swapPars = {
                my_address: props.myAddress,
                peer_address: peerAddress,

                send_amount: sendAmount,
                send_asset_id: sendAssetId,
                send_unit: sendUnit,

                receive_amount: receiveAmount,
                receive_asset_id: receiveAssetId,
                receive_unit: receiveUnit,

                my_fee: myFee,
                peer_fee: peerFee,
              };

              await generateSwapTxs(
                swapPars,
                props.statusMsg,
                props.showProgress,
                setSwapLink,
                setSwapLinkTruncated,
                setShowLinkModal
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
            <Modal title={"Fees"} onCloseClick={() => setShowFeesModal(false)}>
              <FeeInput
                title={"Your fee"}
                fee={myFee}
                setFee={setMyFee}
                onChange={(input) => {
                  updateFeeTotal(
                    props.statusMsg,
                    input,
                    peerFee,
                    setFeeTotal,
                    setHideFeeTotal
                  );
                }}
              />
              <FeeInput
                title={"Peer's fee"}
                fee={peerFee}
                setFee={setPeerFee}
                onChange={(input) =>
                  updateFeeTotal(
                    props.statusMsg,
                    myFee,
                    input,
                    setFeeTotal,
                    setHideFeeTotal
                  )
                }
              />
              {!hideFeeTotal && (
                <div>
                  <span style={{ marginRight: 5 }}>{"Total:"}</span>
                  <span>{feeTotal}</span>
                  <span>{" Algo"}</span>
                </div>
              )}
            </Modal>
          )}
          {showSendUnitModal && (
            <Modal
              title={"Unit"}
              onCloseClick={() => setShowSendUnitModal(false)}
            >
              <SelectUnit
                statusMsg={props.statusMsg}
                assetId={sendAssetId}
                setAssetId={setSendAssetId}
                onUnitSelected={(unit) => {
                  setSendUnit(unit);
                  setShowSendUnitModal(false);
                }}
              />
            </Modal>
          )}
          {showReceiveUnitModal && (
            <Modal
              title={"Unit"}
              onCloseClick={() => setShowReceiveUnitModal(false)}
            >
              <SelectUnit
                statusMsg={props.statusMsg}
                assetId={receiveAssetId}
                setAssetId={setReceiveAssetId}
                onUnitSelected={(unit) => {
                  setReceiveUnit(unit);
                  setShowReceiveUnitModal(false);
                }}
              />
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};
