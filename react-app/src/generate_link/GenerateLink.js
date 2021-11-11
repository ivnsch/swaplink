import React, { useState, useEffect } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { MdContentCopy } from "react-icons/md";
import Modal from "../Modal";
import { init, generateSwapTxs } from "./controller";
import { PureStakeHelp } from "../PureStakeHelp";

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
  const [swapLinkIsCopied, setSwapLinkIsCopied] = useState(false);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showPurestakeHelpModal, setShowPurestakeHelpModal] = useState(false);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    init(props.statusMsg);
  }, []);

  const sendAssetIdElement = () => {
    if (sendUnit === "asset") {
      return (
        <input
          placeholder="Asset id"
          className="inline"
          size="16"
          value={sendAssetId}
          onChange={(event) => {
            setSendAssetId(event.target.value);
          }}
        />
      );
    } else {
      return null;
    }
  };

  const receiveAssetIdElement = () => {
    if (receiveUnit === "asset") {
      return (
        <input
          placeholder="Asset id"
          className="inline"
          size="16"
          value={receiveAssetId}
          onChange={(event) => {
            setReceiveAssetId(event.target.value);
          }}
        />
      );
    } else {
      return null;
    }
  };

  const swapLinkElement = () => {
    if (swapLink) {
      return (
        <div className="link-data-container">
          <div className="submit-msg">
            {
              "Send this link to your peer. Upon opening, they can confirm and submit the swap."
            }
          </div>
          <div className="submit-msg-warning">{"⚠️ It expires in ~1 hour"}</div>
          <CopyToClipboard text={swapLink} onCopy={onCopyText}>
            <div className="swap-link">
              {swapLinkTruncated}
              <span class="copy">
                {swapLinkIsCopied ? "copied!" : <MdContentCopy />}
              </span>
            </div>
          </CopyToClipboard>
        </div>
      );
    } else {
      return null;
    }
  };

  const onCopyText = () => {
    setSwapLinkIsCopied(true);
    setTimeout(() => {
      setSwapLinkIsCopied(false);
    }, 1000);
  };

  return (
    <div>
      <div className="container">
        <div style={{ marginTop: 20, marginBottom: 40 }}>
          {"Generate a link to swap Algos, ASAs or NFTs with a peer"}
        </div>
        <div>
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

          <div className="input-row">
            {sendAssetIdElement()}
            <input
              placeholder={"Amount"}
              className="inline"
              size="16"
              value={sendAmount}
              onChange={(event) => {
                setSendAmount(event.target.value);
              }}
            />
            <select
              value={sendUnit}
              onChange={(event) => setSendUnit(event.target.value)}
            >
              <option value="algo">Algo</option>
              <option value="asset">Asset</option>
            </select>
          </div>

          <div>{"You receive"}</div>
          <div className="input-row">
            {receiveAssetIdElement()}
            <input
              placeholder={"Amount"}
              className="inline"
              size="16"
              value={receiveAmount}
              onChange={(event) => {
                setReceiveAmount(event.target.value);
              }}
            />
            <select
              value={receiveUnit}
              onChange={(event) => setReceiveUnit(event.target.value)}
            >
              <option value="algo">Algo</option>
              <option value="asset">Asset</option>
            </select>
          </div>

          <div>{"Your fee"}</div>
          <input
            placeholder="Fee"
            size="16"
            value={myFee}
            onChange={(event) => {
              setMyFee(event.target.value);
            }}
          />
          <span>{" Algo"}</span>
          <div>{"Peer's fee"}</div>
          <input
            placeholder="Fee"
            size="16"
            value={peerFee}
            onChange={(event) => {
              setPeerFee(event.target.value);
            }}
          />
          <span>{" Algo"}</span>
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
                api_key: apiKey,

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
              {swapLinkElement()}
            </Modal>
          )}
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
    </div>
  );
};
