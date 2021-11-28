import CopyPasteText from "./CopyPasteText";

export const StatusMsgView = ({ statusMsgUpdater, statusMsg }) => {
  let shortMsg = statusMsg.displayMsg;
  let maxMsgLength = 200;
  if (shortMsg.length > maxMsgLength) {
    shortMsg = shortMsg.substring(0, maxMsgLength) + "...";
  }

  if (statusMsg.type === "success") {
    return <div className="success">{statusMsg.displayMsg}</div>;
  } else if (statusMsg.type === "error") {
    return (
      <div className="error">
        <CopyPasteText
          text={shortMsg}
          copyText={statusMsg.copyMsg}
          hideIcon={true}
        />

        <button
          className="error-close"
          onClick={() => statusMsgUpdater.clear()}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.757324 0.757324L9.24261 9.24261"
              stroke="#FF8E8E"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0.757395 9.24261L9.24268 0.757324"
              stroke="#FF8E8E"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    );
  } else {
    throw Error("Invalid status msg type: " + statusMsg.type);
  }
};

export default StatusMsgView;
