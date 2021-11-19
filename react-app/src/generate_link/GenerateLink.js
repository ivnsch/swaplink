import React, { useState, useEffect } from "react";
import Modal from "../Modal";
import { init, generateSwapTxs } from "./controller";
import AssetInputRow from "./AssetInputRow";
import FeeInput from "./FeeInput";
import SwapLinkView from "./SwapLinkView";

export const GenerateLink = (props) => {
  const [peerAddress, setPeerAddress] = useState("");

  const [sendUnit, setSendUnit] = useState("algo");
  const [sendAmount, setSendAmount] = useState("");
  const [sendAssetId, setSendAssetId] = useState("");

  const [receiveUnit, setReceiveUnit] = useState("asset");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [receiveAssetId, setReceiveAssetId] = useState("");

  const [myFee, setMyFee] = useState("0.001");
  const [peerFee, setPeerFee] = useState("0.001");

  const [swapLink, setSwapLink] = useState("");
  const [swapLinkTruncated, setSwapLinkTruncated] = useState("");

  const [showLinkModal, setShowLinkModal] = useState(false);

  useEffect(() => {
    init(props.statusMsg);
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

          <div>{"You send"}</div>
          <AssetInputRow
            assetId={sendAssetId}
            setAssetId={setSendAssetId}
            amount={sendAmount}
            setAmount={setSendAmount}
            unit={sendUnit}
            setUnit={setSendUnit}
          />

          <div>{"You receive"}</div>
          <AssetInputRow
            assetId={receiveAssetId}
            setAssetId={setReceiveAssetId}
            amount={receiveAmount}
            setAmount={setReceiveAmount}
            unit={receiveUnit}
            setUnit={setReceiveUnit}
          />

          <FeeInput title={"Your fee"} fee={myFee} setFee={setMyFee} />
          <FeeInput title={"Peer's fee"} fee={peerFee} setFee={setPeerFee} />

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
        </div>
      </div>
    </div>
  );
};
