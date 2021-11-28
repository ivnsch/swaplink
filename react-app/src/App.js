import "./App.scss";
import { GenerateLink } from "./generate_link/GenerateLink";
import { SubmitLink } from "./submit_link/SubmitLink";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Modal from "./Modal";
import React, { useState, useEffect, useMemo } from "react";
import ProgressBar from "./ProgressBar";
import StatusMsgView from "./StatusMsgView";
import { fetchBalance } from "./controller";
import AddressMenu from "./AddressMenu";
import StatusMsgUpdater from "./StatusMsgUpdater";
import { useWalletConnect } from "./WalletConnect";
/* global __COMMIT_HASH__ */

const isIE = /*@cc_on!@*/ false || !!document.documentMode;

const App = () => {
  const [myAddress, setMyAddress] = useState("");
  const [showAddressMenu, setShowAddressMenu] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [myBalance, setMyBalance] = useState("");
  const [statusMsgUpdater, _] = useState(new StatusMsgUpdater(setStatusMsg));
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

  useEffect(async () => {
    async function initBalance() {
      if (myAddress) {
        let balance = await fetchBalance(statusMsg, myAddress);
        console.log("Balance: " + balance);
        setMyBalance(balance);
      }
    }
    initBalance();
  }, [myAddress]);

  useEffect(() => {
    if (wallet) {
      wallet.onPageLoad();
    }
  }, [wallet]);

  const connectButtonView = () => {
    if (wallet) {
      if (myAddress === "") {
        return connectButton(statusMsgUpdater, wallet);
      }
    } else {
      return null;
    }
  };

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
            <button
              className="own-address"
              onClick={() => setShowAddressMenu(!showAddressMenu)}
            >
              {myAddressDisplay}
            </button>

            {showAddressMenu && myAddress && wallet && (
              <div className="dropdown__content">
                <button className="btn btn--transparent">copy address</button>

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
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
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

              <h1 className="logo__title">
                <span>Swap</span>
                <span>Link</span>
              </h1>
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
                  showProgress={(show) => setShowProgress(show)}
                  myBalance={myBalance}
                  wallet={wallet}
                />
              </Route>

              <Route exact path="/submit/:link">
                <SubmitLink
                  myAddress={myAddress}
                  statusMsg={statusMsgUpdater}
                  showProgress={(show) => setShowProgress(show)}
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
              rel="noopener noreferrer"
              className="footer__item"
            >
              <svg
                width="16"
                height="16"
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
              <button
                className="footer__item"
                onClick={() => {
                  setShowMenu(!showMenu);
                }}
              >
                <svg
                  width="16"
                  height="16"
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

              {showMenu && (
                <div className="footer__menu__list">
                  <ul>
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
              )}
            </div>
          </footer>
          {showHowItWorksModal && (
            <Modal
              title={"How it works"}
              onCloseClick={() => setShowHowItWorksModal(false)}
            >
              <p>
                SwapLink uses layer 1 atomic swaps - an Algorand capability that
                allows to swap safely without smart contracts.
              </p>

              <p>You can swap any Algorand tokens: Algos, ASAs and NFTs.</p>

              <p>
                The complete swap is encoded in a link - SwapLink doesn't lock
                your tokens or store any data - and submitted directly to the
                network by the receiving party.
              </p>
              <p>
                Note that this means that nothing is executed when the link is
                generated: The swap, fees deduction, balance and opt-in checks
                for both parties find place when the receiver submits the
                transactions.
              </p>
            </Modal>
          )}
          {showLegalModal && (
            <Modal
              title={"Disclaimer"}
              onCloseClick={() => setShowLegalModal(false)}
            >
              <p>
                The capitalised terms used in this disclaimer shall have the
                following meanings: “Provider” means the provider of the
                Software; “User” means a person o an entity authorised to access
                and use the Software; “Software” means the software products
                offered by the Provider.
              </p>

              <ol>
                <li>
                  To the extent permitted by the applicable law and the
                  applicable licenses, the Provider hereby expressly disclaims
                  all warranties, express or implied, for the Software. Unless
                  agreed otherwise between the User and the Provider in writing,
                  the Provider offers the Software on an “AS IS” BASIS, WITHOUT
                  WARRANTIES OR CONDITIONS OF ANY KIND, either express or
                  implied, including, without limitation, any warranties or
                  condi-tions of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or
                  FITNESS FOR A PARTICULAR PURPOSE. The entire risk arising out
                  of use or performance of the Soft-ware remains with the User.
                </li>
                <li>
                  In no event shall the Provider be liable for any damages
                  whatsoever (including, without limitation, damages for loss of
                  business profits, business interruption, loss of business
                  in-formation, or any other pecuniary loss) arising out of the
                  use of or inability to use the Software, even if the Provider
                  has been advised of the possibility of such damages.
                </li>
                <li>
                  The Provider shall not be liable for any use of the Software
                  that has not been permitted under the applicable licenses,
                  laws, and regulations, including, without limitation, the use
                  of the Software for committing cyber offences.{" "}
                </li>
                <li>The Software may be subject to the licensing rights.</li>
                <li>
                  The User is solely responsible for determining the
                  appropriateness of the Software and assumes any risks
                  associated with User’s exercise of permissions under the
                  applicable licenses.
                </li>
                <li>
                  The User acknowledges that the Provider may use third-party
                  suppliers to provide software, hardware, storage, networking,
                  and other technological services pertaining to the Software.
                  The acts and omissions of third-party suppliers may be outside
                  of the Provider’s reasonable control. To the maximum extent
                  permitted by law, the Provider excludes any liability for any
                  loss or damage resulting from the acts and omissions of such
                  third-party suppliers.{" "}
                </li>
                <li>
                  The Provider may make improvements and/or changes in the
                  Software at any time without notice.
                </li>
                <li>
                  Third-party software or services are not covered by this
                  disclaimer. The User shall en-sure User’s compliance with any
                  terms set forth by the respective third parties at its own
                  risk, cost and expense.
                </li>
                <li>
                  If any provision or part of a provision of this disclaimer
                  shall be, or be found by any court of competent jurisdiction
                  or public authority to be, invalid or unenforceable, such
                  invalidity or unenforceability shall not affect the other
                  provisions or parts of such provi-sions of this disclaimer,
                  all of which shall remain in full force and effect.
                </li>
                <li>
                  The User hereby agrees to indemnify, defend, save, and hold
                  harmless the Provider, its members, officers, directors, and
                  other agents from and against all claims, liabilities, causes
                  of action, damages, judgments, attorneys’ fees, court costs,
                  and expenses which arise out of or are related to the
                  Software, violation of the rights of a third party, or failure
                  to perform as required.
                </li>
                <li>
                  All rights reserved. All trademarks mentioned herein belong to
                  their respective owners.
                </li>
                <li>
                  This disclaimer does not substitute professional or legal
                  advice. The provider of this disclaimer expressly disclaims
                  all liability in respect to (i) actions taken or not taken by
                  the User on the basis of this disclaimer and (ii) the
                  relationship between the provider of this disclaimer and the
                  Provider. Under no circumstances will the provider of the
                  disclaimer be held liable for any direct, indirect, special,
                  incidental, or consequential damages resulting from this
                  disclaimer or the provision, use, misuse, or inability to use
                  the Software. The User acknowledges that the Software and this
                  disclaimer are used at User’s own risk and the Provider is
                  solely responsible for the Software.
                </li>
              </ol>
            </Modal>
          )}

          {showTerms && (
            <Modal
              title={"Connect a Wallet"}
              onCloseClick={() => setShowTerms(false)}
            >
              <p>
                By connecting a wallet, you acknowledge that you have read and
                understand the Swaplink Disclaimer.
              </p>

              <div className="modal-ctas">
                <button className="btn btn--secondary">cancel</button>
                <button className="btn btn--primary">continue</button>
              </div>
            </Modal>
          )}
        </div>
      </div>
    );
  }
};

const connectButton = (statusMsg, wallet) => {
  return (
    <button
      className="btn btn--connect-wallet"
      onClick={async () => {
        try {
          await wallet.connect();
        } catch (e) {
          statusMsg.error(e);
        }
      }}
    >
      {"Connect wallet"}
    </button>
  );
};

const disconnectButton = (statusMsg, wallet) => {
  return (
    <button
      className="connect-button"
      onClick={async () => {
        try {
          await wallet.disconnect();
        } catch (e) {
          statusMsg.error(e);
        }
      }}
    >
      {"Disconnect"}
    </button>
  );
};

export default App;
