import * as ReactDOM from "react-dom";
import React from "react";
import walletIcon from "./images/walletIcon.svg";

const OpenWalletModal = ({ setShowModal }) => {
  return ReactDOM.createPortal(
    <div className="modal open-wallet-modal">
      <div className="open-wallet-modal-content modal-content-size">
        <div className="open-wallet-modal-topbar">
          <h2 className="open-wallet-modal-header">
            <img src={walletIcon} alt="" />
            <span>WalletConnect</span>
          </h2>
          <button
            className="open-wallet-modal-close"
            onClick={() => setShowModal(false)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M7.75732 7.75732L16.2426 16.2426" />
              <path d="M7.75739 16.2426L16.2427 7.75732" />
            </svg>
          </button>
        </div>
        <div className="open-wallet-modal-body">
          <div className="open-wallet-modal-msg">
            {"Please sign with your wallet."}
          </div>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default OpenWalletModal;
