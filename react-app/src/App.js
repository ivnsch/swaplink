import "./App.css";
import { GenerateLink } from "./generate_link/GenerateLink";
import { SubmitLink } from "./submit_link/SubmitLink";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Modal from "./Modal";
import React, { useState } from "react";
import { connectWallet } from "./MyAlgo";
import ProgressBar from "./ProgressBar";
import CopyPasteText from "./CopyPasteText";

/* global __COMMIT_HASH__ */

const isIE = /*@cc_on!@*/ false || !!document.documentMode;

const wasmPromise = import("wasm");

const App = () => {
  const [myAddress, setMyAddress] = useState("");
  const [myAddressDisplay, setMyAddressDisplay] = useState("");
  const [myBalance, setMyBalance] = useState("");
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [apiKey, setApiKey] = useState("");

  class StatusMsgUpdater {
    success(msg) {
      msg = msg + "";
      console.log(msg);
      setStatusMsg({ msg: msg, type: "success" });
    }
    error(msg) {
      msg = msg + "";
      console.error(msg);
      setStatusMsg({ msg: msg, type: "error" });
    }
    clear() {
      setStatusMsg(null);
    }
  }
  const [statusMsgUpdater, _] = useState(new StatusMsgUpdater());

  const connectButtonView = () => {
    if (myAddress === "") {
      return (
        <button
          className="connect-button"
          onClick={async (event) => {
            try {
              const { bridge_balance } = await wasmPromise;

              let address = await connectWallet();
              setMyAddress(address);

              const short_chars = 3;
              const leading = address.substring(0, short_chars);
              const trailing = address.substring(address.length - short_chars);
              const shortAddress = leading + "..." + trailing;
              setMyAddressDisplay(shortAddress);

              const balance = await bridge_balance({
                address: address,
              });
              setMyBalance(balance.balance);
            } catch (e) {
              statusMsgUpdater.error(e);
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

  const yourAddressView = () => {
    return (
      myAddress !== "" && (
        <div>
          <div>{"Your address:"}</div>
          <CopyPasteText text={myAddressDisplay} copyText={myAddress} />
          {myBalance && (
            <div id="my-balance">
              {myBalance} {"algo"}
            </div>
          )}
        </div>
      )
    );
  };

  const statusMsgView = () => {
    if (statusMsg) {
      let shortMsg = statusMsg.msg;
      let maxMsgLength = 200;
      if (shortMsg.length > maxMsgLength) {
        shortMsg = shortMsg.substring(0, maxMsgLength) + "...";
      }

      if (statusMsg.type === "success") {
        return <div className="success">{statusMsg.msg}</div>;
      } else if (statusMsg.type === "error") {
        return (
          <div className="error">
            <CopyPasteText text={shortMsg} copyText={statusMsg.msg} />
          </div>
        );
      } else {
        throw Error("Invalid status msg type: " + statusMsg.type);
      }
    } else {
      return null;
    }
  };

  if (isIE) {
    return (
      <div style={{ marginLeft: 20, marginRight: 20, marginTop: 20 }}>
        {"Internet Explorer is not supported."}
      </div>
    );
  } else {
    return (
      <div>
        <div className="container">
          {showProgress && <ProgressBar />}
          <div className="warning">
            {
              "This site is under development. It operates on TestNet. Use only for testing purposes."
            }
          </div>
          <div>{connectButtonView()}</div>
          {yourAddressView()}
          <div id="wrapper">
            {statusMsgView()}

            <Router>
              <Route exact path="/">
                <GenerateLink
                  myAddress={myAddress}
                  statusMsg={statusMsgUpdater}
                  showProgress={(show) => setShowProgress(show)}
                  myBalance={myBalance}
                />
              </Route>

              <Route exact path="/submit/:link">
                <SubmitLink
                  myAddress={myAddress}
                  statusMsg={statusMsgUpdater}
                  showProgress={(show) => setShowProgress(show)}
                  setMyBalance={setMyBalance}
                />
              </Route>
            </Router>
          </div>
          <div className="footer">
            <a
              href={
                "https://github.com/ivanschuetz/swaplink/tree/" +
                __COMMIT_HASH__
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              {"Github"}
            </a>
            <a
              onClick={() => {
                setShowLegalModal(!showLegalModal);
              }}
              rel="noopener noreferrer"
            >
              {"Disclaimer"}
            </a>
          </div>
          {showLegalModal && (
            <Modal
              title={"Disclaimer"}
              onCloseClick={() => setShowLegalModal(false)}
            >
              <p>YOLO 🏳️</p>
            </Modal>
          )}
        </div>
      </div>
    );
  }
};

export default App;
