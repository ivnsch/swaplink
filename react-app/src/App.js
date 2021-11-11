import "./App.css";
import { GenerateLink } from "./generate_link/GenerateLink";
import { SubmitLink } from "./submit_link/SubmitLink";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Modal from "./Modal";
import React, { useState } from "react";
import { connectWallet } from "./MyAlgo";
import ProgressBar from "./ProgressBar";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { MdContentCopy } from "react-icons/md";

const isIE = /*@cc_on!@*/ false || !!document.documentMode;

const App = () => {
  const [myAddress, setMyAddress] = useState("");
  const [myAddressDisplay, setMyAddressDisplay] = useState("");
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [addressIsCopied, setAddressIsCopied] = useState(false);

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
              let address = await connectWallet();
              setMyAddress(address);

              const short_chars = 3;
              const leading = address.substring(0, short_chars);
              const trailing = address.substring(address.length - short_chars);
              const shortAddress = leading + "..." + trailing;
              setMyAddressDisplay(shortAddress);
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

  const onCopyAddress = () => {
    setAddressIsCopied(true);
    setTimeout(() => {
      setAddressIsCopied(false);
    }, 1000);
  };

  const yourAddressView = () => {
    if (myAddress !== "") {
      return (
        <div>
          <div>{"Your address:"}</div>
          <CopyToClipboard text={myAddress} onCopy={onCopyAddress}>
            <div className="copyable">
              {myAddressDisplay}
              <span class="copy">
                {addressIsCopied ? "copied!" : <MdContentCopy />}
              </span>
            </div>
          </CopyToClipboard>
        </div>
      );
    } else {
      return null;
    }
  };

  const statusMsgView = () => {
    if (statusMsg) {
      var className = "";
      if (statusMsg.type === "success") {
        className = "success";
      } else if (statusMsg.type === "error") {
        className = "error";
      } else {
        throw Error("Invalid status msg type: " + statusMsg.type);
      }
      return <div className={className}>{statusMsg.msg}</div>;
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
                />
              </Route>

              <Route exact path="/submit/:link">
                <SubmitLink
                  myAddress={myAddress}
                  statusMsg={statusMsgUpdater}
                  showProgress={(show) => setShowProgress(show)}
                />
              </Route>
            </Router>
          </div>
          <div className="footer">
            <a
              href="https://github.com/ivanschuetz/swaplink"
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
