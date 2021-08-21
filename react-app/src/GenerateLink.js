import React, { useState, useEffect } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { MdContentCopy } from "react-icons/md";
import { connectWallet, sign } from "./MyAlgo";
import Modal from "./Modal";

const wasmPromise = import("wasm");

export const GenerateLink = () => {
  const [myAddress, setMyAddress] = useState("");
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

  const [errorMsg, setErrorMsg] = useState("");

  const [showLinkModal, setShowLinkModal] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { init_log } = await wasmPromise;
      await init_log();
    };
    init();
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

  const errorMsgElement = () => {
    if (errorMsg) {
      return <div className="error">{errorMsg}</div>;
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

  const connectButtonElement = () => {
    if (myAddress === "") {
      return (
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
      );
    } else {
      return (
        <button
          className="connect-button"
          onClick={() => {
            setMyAddress("");
          }}
        >
          {"Disconnect"}
        </button>
      );
    }
  };

  return (
    <div>
      <div className="form">
        <div className="warning">
          {
            "This site is under development. It operates on TestNet. Use only for testing purposes."
          }
        </div>
        <div>{"Generate a link to swap Algos, ASAs or NFTs with a peer"}</div>
        {connectButtonElement()}
        {yourAddressElement()}
        {errorMsgElement()}
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
              myAddress === "" ||
              peerAddress === "" ||
              sendAmount === "" ||
              receiveAmount === ""
                ? true
                : false
            }
            onClick={async () => {
              const { generate_unsigned_swap_transactions, generate_link } =
                await wasmPromise;
              setErrorMsg("");

              try {
                let unsignedSwapTransactions =
                  await generate_unsigned_swap_transactions(myAddress, {
                    peer: peerAddress,

                    send_amount: sendAmount,
                    send_asset_id: sendAssetId,
                    send_unit: sendUnit,

                    receive_amount: receiveAmount,
                    receive_asset_id: receiveAssetId,
                    receive_unit: receiveUnit,

                    my_fee: myFee,
                    peer_fee: peerFee,
                  });

                let rawSwapRequest = {
                  signed_my_tx_msg_pack: await sign(
                    unsignedSwapTransactions.my_tx_my_algo_format
                  ),
                  unsigned_peer_tx_msg_pack:
                    unsignedSwapTransactions.peer_tx_msg_pack, // passthrough
                };

                let link = await generate_link(rawSwapRequest);
                setSwapLink(link);
                setSwapLinkTruncated(
                  link.replace(/(.*)\/(.*).(?=....)/, "$1/...")
                );
                setShowLinkModal(true);
              } catch (e) {
                setErrorMsg(e + "");
              }
            }}
          >
            {"Generate link"}
          </button>
          {showLinkModal && (
            <Modal title={"Done!"} onCloseClick={() => setShowLinkModal(false)}>
              {swapLinkElement()}
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};
