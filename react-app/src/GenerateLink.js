import React, { useState, useEffect } from "react";
import MyAlgo from "@randlabs/myalgo-connect";

const wasmPromise = import("wasm");
const myAlgoWallet = new MyAlgo();

export const GenerateLink = () => {
  const [myAddress, setMyAddress] = useState("");
  const [peerAddress, setPeerAddress] = useState("");

  const [sendUnit, setSendUnit] = useState("algo");
  const [sendAmount, setSendAmount] = useState("");
  const [sendAssetId, setSendAssetId] = useState("");

  const [receiveUnit, setReceiveUnit] = useState("asset");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [receiveAssetId, setReceiveAssetId] = useState("");

  const [myFee, setMyFee] = useState("");
  const [peerFee, setPeerFee] = useState("");

  const [swapLink, setSwapLink] = useState("");

  const [errorMsg, setErroMsg] = useState("");

  useEffect(() => {
    const init = async () => {
      const { init_log } = await wasmPromise;
      await init_log();
    };
    init();
  }, []);

  const sendAssetIdElement = () => {
    if (sendUnit == "asset") {
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
      <div />;
    } else {
      return null;
    }
  };

  const receiveAssetIdElement = () => {
    if (receiveUnit == "asset") {
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
      <div />;
    } else {
      return null;
    }
  };

  const errorMsgElement = () => {
    if (errorMsg) {
      return <div className="error"> {errorMsg}</div>;
    } else {
      return null;
    }
  };

  const swapLinkElement = () => {
    if (swapLink) {
      return (
        <div>
          <div className="submit-msg">
            {
              "Send this link to your peer! Upon opening, they can confirm and submit the swap."
            }
          </div>
          <div className="submit-msg">{"⚠️ It expires in ~1 hour"}</div>
          <div className="swap-link">{swapLink} </div>
        </div>
      );
    } else {
      return null;
    }
  };

  const yourAddressElement = () => {
    if (myAddress != "") {
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
            let addresses = await connectWallet();
            setMyAddress(addresses[0]);
          }}
          >
          {"Connect My Algo wallet"}
        </button>
      );
    } else {
      return <button
              className="connect-button"
              onClick={() => {
                setMyAddress("");
              }}
              >
              {"Disconnect"}
            </button>
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
          <div>{"Peer's fee"}</div>
          <input
            placeholder="Fee"
            size="16"
            value={peerFee}
            onChange={(event) => {
              setPeerFee(event.target.value);
            }}
          />
          <button
            className="submit-button"
            onClick={async () => {
              const { generate_unsigned_swap_transactions, generate_link } =
                await wasmPromise;
              setErroMsg("");

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

                let rawSwapRequest = await signMyTx(unsignedSwapTransactions);
                let linkRes = await generate_link(rawSwapRequest);
                setSwapLink(linkRes);
              } catch (e) {
                setErroMsg(e + "");
              }
            }}
          >
            {"Generate link"}
          </button>
          {swapLinkElement()}
        </div>
      </div>
      <div className="footer">
        <a
          href="https://github.com/ivanschuetz/swaplink"
          target="_blank"
          rel="noopener noreferrer"
        >
          {"Github"}
        </a>
      </div>
    </div>
  );
};

const connectWallet = async () => {
  const accounts = await myAlgoWallet.connect();
  const addresses = accounts.map((account) => account.address);
  return addresses;
};

const signMyTx = async (unsigned_transactions) => {
  let my_tx = unsigned_transactions.my_tx_my_algo_format;
  let peer_tx = unsigned_transactions.peer_tx_msg_pack;

  let signedTxn = await myAlgoWallet.signTransaction(my_tx);

  return {
    signed_my_tx_msg_pack: Array.from(signedTxn.blob), // Uint8Array -> array (otherwise parsing to Vec<u8> in Rust doesn't work)
    unsigned_peer_tx_msg_pack: peer_tx, // passthrough
  };
};
