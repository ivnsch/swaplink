import * as ReactDOM from "react-dom";
import React from "react";
import StatusMsgView from "./StatusMsgView";

const Modal = ({ title, children, statusMsg, onCloseClick }) => {
  const onModalClick = (event) => {
    if (event.target === document.querySelector(".modal")) {
      onCloseClick();
    }
  };

  return ReactDOM.createPortal(
    <div className="modal" onClick={onModalClick}>
      <div className="modal-content modal-content-size">
        <div className="modal-topbar">
          <p className="modal-topbar-title">{title}</p>
          <p className="modal-topbar-x" onClick={() => onCloseClick()}>
            {"Close"}
          </p>
        </div>
        <div className="modal-body">
          {statusMsg && <StatusMsgView statusMsg={statusMsg} />}
          <div style={{ clear: "left" }} />
          {children}
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default Modal;
