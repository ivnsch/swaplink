import * as ReactDOM from "react-dom";
import React from "react";

const Modal = ({ title, children, onCloseClick }) => {
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
          <div style={{ clear: "left" }} />
          {children}
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default Modal;
