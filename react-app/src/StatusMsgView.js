import CopyPasteText from "./CopyPasteText";

export const StatusMsgView = ({ statusMsg }) => {
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
        <CopyPasteText text={shortMsg} copyText={statusMsg.copyMsg} />
      </div>
    );
  } else {
    throw Error("Invalid status msg type: " + statusMsg.type);
  }
};

export default StatusMsgView;
