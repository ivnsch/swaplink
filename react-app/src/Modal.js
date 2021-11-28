import * as ReactDOM from "react-dom";
import React from "react";
import StatusMsgView from "./StatusMsgView";

const Modal = ({
  title,
  children,
  statusMsgUpdater,
  statusMsg,
  onCloseClick,
}) => {
  const onModalClick = (event) => {
    if (event.target === document.querySelector(".modal")) {
      onCloseClick();
    }
  };

  return ReactDOM.createPortal(
    <div className="modal" onClick={onModalClick}>
      <div className="modal-content modal-content-size">
        <div className="modal-topbar">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={() => onCloseClick()}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.75732 7.75732L16.2426 16.2426"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.75739 16.2426L16.2427 7.75732"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {statusMsg && statusMsgUpdater && (
            <StatusMsgView
              statusMsgUpdater={statusMsgUpdater}
              statusMsg={statusMsg}
            />
          )}

          {children}
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default Modal;
