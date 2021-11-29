import "./App.scss";
import { GenerateLink } from "./generate_link/GenerateLink";
import { SubmitLink } from "./submit_link/SubmitLink";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Modal from "./Modal";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import ProgressBar from "./ProgressBar";
import StatusMsgView from "./StatusMsgView";
import { fetchBalance } from "./controller";
import AddressMenu from "./AddressMenu";
import StatusMsgUpdater from "./StatusMsgUpdater";
import { useWalletConnect } from "./WalletConnect";
import { saveAcceptedTerms, needsToAcceptTerms } from "./termsStorage";
import DisclaimerModal from "./DisclaimerModal";
import HowItWorksModal from "./HowItWorksModal";
import CopyPasteText from "./CopyPasteText";
/* global __COMMIT_HASH__ */

const isIE = /*@cc_on!@*/ false || !!document.documentMode;

const App = () => {
  const [myAddress, setMyAddress] = useState("");
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [myBalance, setMyBalance] = useState("");
  const [statusMsgUpdater] = useState(new StatusMsgUpdater(setStatusMsg));
  const wallet = useWalletConnect(statusMsgUpdater, setMyAddress);

  const myAddressDisplay = useMemo(() => {
    if (myAddress) {
      const short_chars = 3;
      const leading = myAddress.substring(0, short_chars);
      const trailing = myAddress.substring(myAddress.length - short_chars);
      const shortAddress = leading + "..." + trailing;
      return shortAddress;
    }
  }, [myAddress]);

  useEffect(() => {
    async function initBalance() {
      if (myAddress) {
        let balance = await fetchBalance(statusMsg, myAddress);
        console.log("Balance: " + balance);
        setMyBalance(balance);
      }
    }
    initBalance();
  }, [statusMsg, myAddress]);

  useEffect(() => {
    if (wallet) {
      wallet.onPageLoad();
    }
  }, [wallet]);

  const connectButtonView = () => {
    if (wallet) {
      if (myAddress === "") {
        return connectButton(statusMsgUpdater, setShowTerms, wallet);
      }
    } else {
      return null;
    }
  };

  const showProgressCallback = useCallback((show) => {
    setShowProgress(show);
  }, []);

  const yourAddressView = () => {
    return (
      myAddress !== "" && (
        <div className="actions">
          {myBalance && (
            <div className="own-balance">
              {myBalance}

              <span className="currency">
                <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2.82183 16L5.13576 11.9929L7.44969 8L9.74952 3.99295L10.1305 3.35802L10.2998 3.99295L11.0052 6.63139L10.2151 8L7.90119 11.9929L5.60137 16H8.3668L10.6807 11.9929L11.88 9.91887L12.4444 11.9929L13.5167 16H16L14.9276 11.9929L13.8553 8L13.5732 6.97002L15.2945 3.99295H12.783L12.6984 3.69665L11.8236 0.42328L11.7107 0H9.29802L9.24158 0.0846561L6.98409 3.99295L4.67015 8L2.37033 11.9929L0.0563965 16H2.82183Z"
                    fill="#F8F9FF"
                  />
                </svg>
              </span>
            </div>
          )}

          <div className="dropdown">
            <button className="own-address">{myAddressDisplay}</button>

            {myAddress && wallet && (
              <div className="dropdown__content">
                <button className="btn btn--transparent">
                  <CopyPasteText
                    text={"copy address"}
                    copyText={myAddress}
                    hideIcon={true}
                  />
                </button>

                <AddressMenu
                  statusMsg={statusMsg}
                  myAddress={myAddress}
                  wallet={wallet}
                />
              </div>
            )}
          </div>
        </div>
      )
    );
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
          <div className="warning">{"TESTNET"}</div>

          <header className="header">
            <div className="logo" aria-label="swaplink logo">
              <svg
                className="logo-img"
                viewBox="0 0 17 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.61558 0.0477295V0.925628V8.82671H10.4437V11.1027C10.4112 11.688 10.2811 12.1107 9.53326 12.1107H0.299072L0.331587 6.87583V0.990658C0.331587 0.372877 0.62422 0.0477295 1.27451 0.0477295H3.61558Z"
                  fill="#B3B3B3"
                />
                <path
                  d="M13.435 15.3948L13.4675 12.8911V6.61578H6.6394V4.17717C6.67192 3.62442 6.99707 3.33179 7.58233 3.33179H16.7515V9.54211V14.3218C16.7515 14.9721 16.6214 15.3948 15.8411 15.3948H13.435Z"
                  fill="white"
                />
              </svg>

              <svg
                className="logo-text"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 176.43 37.69"
              >
                <g id="Layer_2" data-name="Layer 2">
                  <g id="Layer_1-2" data-name="Layer 1">
                    <path d="M10.38,29.2a11.5,11.5,0,0,0,7.5-2.29A7.28,7.28,0,0,0,20.72,21a6.4,6.4,0,0,0-2.84-5.72A17.73,17.73,0,0,0,12,12.67l-1.7-.52A18.18,18.18,0,0,1,6,10.38,2.8,2.8,0,0,1,4.78,7.89c0-2,1.93-3.63,5.4-3.63a19.81,19.81,0,0,1,8.64,2.25l.7-1.57A2.44,2.44,0,0,0,18.2,1.62,21.18,21.18,0,0,0,10.26,0,11.32,11.32,0,0,0,2.8,2.33,7.14,7.14,0,0,0,0,8a6.3,6.3,0,0,0,2.84,5.64,19.33,19.33,0,0,0,6,2.65l1.58.47C14.4,18,16,18.9,16,21.15s-1.89,3.79-5.48,3.79a17.77,17.77,0,0,1-4.9-.75,22.26,22.26,0,0,1-4.26-1.7L.5,24.37a2.43,2.43,0,0,0,1.44,3.09c.68.26,1.46.53,2.32.79a20.72,20.72,0,0,0,6.12.95" />
                    <path d="M45.06,24.51,41.2,10.06c-.36-1.3-1.35-2-3-2s-2.65.67-3,2L31.33,24.58,27,10a2.79,2.79,0,0,0-2.76-1.67H22.1l5.6,18.42a3.54,3.54,0,0,0,3.55,2.45,3.4,3.4,0,0,0,3.63-2.56L38.2,14.4l3.35,12.28a3.38,3.38,0,0,0,3.59,2.56,3.54,3.54,0,0,0,3.55-2.45L54.34,8.37h-2.2a2.8,2.8,0,0,0-2.77,1.69Z" />
                    <path d="M58.13,23.48c0-3.36,6.49-3.12,8.88-3.12V24a10.93,10.93,0,0,1-5.41,1.74c-2.17,0-3.47-.87-3.47-2.25m-.77-12.25.5,1.85a18.72,18.72,0,0,1,5.61-1C66,12.12,67,13.3,67,16.57v.56l-2.13,0c-6.95,0-11,2.44-11,6.55,0,6.48,9.35,6.76,13.1,4.3v1H69.2a2.5,2.5,0,0,0,2.38-2.44V16.61q0-4.75-2.28-6.85c-2.13-2-6.41-1.95-9.78-1.36C58.09,8.65,56.94,9.7,57.36,11.23Z" />
                    <path d="M84.46,25.29a18.65,18.65,0,0,1-4.62-.67V13a12.86,12.86,0,0,1,4.62-.9c3.51,0,5.72,2.68,5.72,6.62s-2.25,6.59-5.72,6.59m.27-17.2a14.67,14.67,0,0,0-8.24,2.21,2.63,2.63,0,0,0-1.19,2.45V37.69h2.16a2.49,2.49,0,0,0,2.38-2.44V28.53a22.74,22.74,0,0,0,4.89.67,9.49,9.49,0,0,0,7.15-2.92,10.61,10.61,0,0,0,2.8-7.61,10.62,10.62,0,0,0-2.8-7.62A9.38,9.38,0,0,0,84.73,8.09Z" />
                    <path d="M108.65,0h-2.28A2.48,2.48,0,0,0,104,2.43V26.36a2.54,2.54,0,0,0,2.57,2.57h17.16V27.06a2.49,2.49,0,0,0-2.38-2.44H108.65Z" />
                    <path d="M131.48,26.49V8.37h-2.16a2.48,2.48,0,0,0-2.38,2.43V28.93h2.16a2.5,2.5,0,0,0,2.38-2.44m-.2-21.4a3.09,3.09,0,0,0,0-4.22,3.07,3.07,0,0,0-4.14,0A2.86,2.86,0,0,0,126.35,3a3,3,0,0,0,.79,2.13A3.07,3.07,0,0,0,131.28,5.09Z" />
                    <path d="M139.73,9.64V8.37h-2.16a2.48,2.48,0,0,0-2.38,2.43V28.93h2.16a2.51,2.51,0,0,0,2.38-2.44V13.93a14.34,14.34,0,0,1,6.19-1.7c2.57,0,3.44,1.15,3.44,3.4v13.3h2.15a2.5,2.5,0,0,0,2.38-2.44V14.17c0-7.81-9.35-7-14.16-4.53" />
                    <path d="M176.43,28.93l-8.76-11.72,8.2-8.84h-4c-1.61,0-2.19.69-3.23,1.74L162,17.17V0h-2.15a2.48,2.48,0,0,0-2.38,2.43v26.5h2.15A2.5,2.5,0,0,0,162,26.49V23.28l2.61-2.76,5.36,7a3.78,3.78,0,0,0,3.1,1.4Z" />
                  </g>
                </g>
              </svg>
            </div>

            <div>
              <div>{connectButtonView()}</div>
              <div>{yourAddressView()}</div>
            </div>
          </header>

          <div id="wrapper">
            {statusMsg && (
              <StatusMsgView
                statusMsgUpdater={statusMsgUpdater}
                statusMsg={statusMsg}
              />
            )}
            <Router>
              <Route exact path="/">
                <GenerateLink
                  myAddress={myAddress}
                  statusMsg={statusMsgUpdater}
                  showProgress={showProgressCallback}
                  myBalance={myBalance}
                  wallet={wallet}
                />
              </Route>

              <Route exact path="/submit/:link">
                <SubmitLink
                  myAddress={myAddress}
                  statusMsg={statusMsgUpdater}
                  showProgress={showProgressCallback}
                  setMyBalance={setMyBalance}
                  wallet={wallet}
                />
              </Route>
            </Router>
          </div>
          <footer className="footer">
            <a
              href={
                "https://github.com/ivanschuetz/swaplink/tree/" +
                __COMMIT_HASH__
              }
              target="_blank"
              rel="noreferrer"
              className="footer__item"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.00003 0C3.5823 0 0 3.67233 0 8.20251C0 11.8267 2.29225 14.9013 5.47093 15.9859C5.87073 16.0618 6.01754 15.808 6.01754 15.5913C6.01754 15.3957 6.01008 14.7495 6.00669 14.0642C3.78101 14.5603 3.31138 13.0964 3.31138 13.0964C2.94747 12.1483 2.42313 11.8962 2.42313 11.8962C1.69732 11.3871 2.47784 11.3975 2.47784 11.3975C3.2812 11.4554 3.70421 12.2428 3.70421 12.2428C4.41773 13.4968 5.57571 13.1343 6.03223 12.9247C6.104 12.3945 6.31137 12.0327 6.54013 11.8279C4.76325 11.6204 2.89527 10.9171 2.89527 7.77413C2.89527 6.87865 3.20779 6.14688 3.71959 5.57247C3.63651 5.36584 3.3627 4.5316 3.79707 3.40175C3.79707 3.40175 4.46886 3.18129 5.99765 4.24256C6.63575 4.06076 7.32015 3.96967 8.00003 3.96658C8.67991 3.96967 9.36481 4.06076 10.0042 4.24256C11.5311 3.18129 12.202 3.40175 12.202 3.40175C12.6374 4.5316 12.3635 5.36584 12.2804 5.57247C12.7933 6.14688 13.1037 6.87858 13.1037 7.77413C13.1037 10.9245 11.2322 11.6183 9.45084 11.8213C9.73776 12.0759 9.99343 12.5751 9.99343 13.3403C9.99343 14.4378 9.98415 15.3211 9.98415 15.5913C9.98415 15.8096 10.1281 16.0654 10.5337 15.9848C13.7106 14.899 16 11.8254 16 8.20251C16 3.67233 12.4182 0 8.00003 0Z"
                  fill="white"
                />
              </svg>
            </a>

            <div className="footer__menu">
              <button className="footer__item">
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15.9999 7.99984C15.9999 12.4182 12.4182 15.9999 7.99984 15.9999C3.58151 15.9999 -0.000244141 12.4182 -0.000244141 7.99984C-0.000244141 3.58151 3.58151 -0.000244141 7.99984 -0.000244141C12.4182 -0.000244141 15.9999 3.58151 15.9999 7.99984ZM10.2626 4.12777C10.6803 4.54337 10.9743 5.06685 11.1119 5.63981C11.2977 6.40624 11.1933 7.21434 10.8187 7.90834C10.444 8.60233 9.82578 9.13307 9.08305 9.39825C8.91905 9.45665 8.80305 9.60225 8.80305 9.77585V10.4015C8.80305 10.6141 8.71859 10.8179 8.56826 10.9683C8.41793 11.1186 8.21404 11.2031 8.00144 11.2031C7.78884 11.2031 7.58494 11.1186 7.43461 10.9683C7.28428 10.8179 7.19983 10.6141 7.19983 10.4015V8.79024C7.20256 8.57987 7.28806 8.37905 7.43779 8.23126C7.58749 8.0835 7.78937 8.00065 7.9997 8.00063H7.99424C8.87825 8.00063 9.59665 7.28223 9.59665 6.40062C9.58709 5.98173 9.41391 5.58323 9.1142 5.29043C8.81449 4.99762 8.41205 4.83379 7.99305 4.834C7.57406 4.83421 7.17179 4.99844 6.87237 5.29154C6.57295 5.58464 6.40017 5.98332 6.39102 6.40222C6.38942 6.84302 6.03102 7.20062 5.58941 7.20062C5.39196 7.19941 5.20206 7.12464 5.05679 6.9909C4.91152 6.85717 4.82132 6.67409 4.8038 6.47742L4.7998 6.35982C4.81341 4.35659 6.65662 2.81098 8.74624 3.28618C9.3199 3.42081 9.84487 3.71218 10.2626 4.12777ZM8.79984 12.7999C8.79984 13.2417 8.44167 13.5999 7.99984 13.5999C7.558 13.5999 7.19983 13.2417 7.19983 12.7999C7.19983 12.358 7.558 11.9999 7.99984 11.9999C8.44167 11.9999 8.79984 12.358 8.79984 12.7999Z"
                    fill="white"
                  />
                </svg>
              </button>

              <div className="footer__menu__wrapper">
                <ul className="footer__menu__list">
                  <li>
                    <button
                      onClick={() => {
                        setShowHowItWorksModal(!showHowItWorksModal);
                      }}
                    >
                      How it works
                    </button>
                    <button
                      onClick={() => {
                        setShowLegalModal(!showLegalModal);
                      }}
                    >
                      disclaimer
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </footer>

          {showHowItWorksModal && (
            <HowItWorksModal setShowModal={setShowHowItWorksModal} />
          )}
          {showLegalModal && (
            <DisclaimerModal setShowModal={setShowLegalModal} />
          )}
          {showTerms && (
            <Modal
              title={"Connect a Wallet"}
              onCloseClick={() => setShowTerms(null)}
            >
              <p>
                By connecting a wallet, you acknowledge that you have read and
                understand the Swaplink Disclaimer.
              </p>

              <div className="modal-ctas">
                <button
                  className="btn btn--secondary"
                  onClick={() => setShowTerms(false)}
                >
                  cancel
                </button>
                <button
                  className="btn btn--primary"
                  onClick={async () => {
                    await saveAcceptedTerms();
                    await wallet.connect();
                  }}
                >
                  continue
                </button>
              </div>
            </Modal>
          )}
        </div>
      </div>
    );
  }
};

const connectButton = (statusMsg, showAcceptTermsModal, wallet) => {
  return (
    <button
      className="btn btn--connect-wallet"
      onClick={async () => {
        try {
          if (await needsToAcceptTerms()) {
            showAcceptTermsModal(true);
          } else {
            await wallet.connect();
          }
        } catch (e) {
          statusMsg.error(e);
        }
      }}
    >
      {"Connect wallet"}
    </button>
  );
};

export default App;
