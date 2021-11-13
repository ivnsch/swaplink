import CopyPasteText from "../CopyPasteText";

const SwapLinkView = ({ swapLink, swapLinkTruncated }) => {
  return (
    <div className="link-data-container">
      <div className="submit-msg">
        {
          "Send this link to your peer. Upon opening, they can confirm and submit the swap."
        }
      </div>
      <div className="submit-msg-warning">{"⚠️ It expires in ~1 hour"}</div>
      <div className="swap-link">
        <CopyPasteText text={swapLinkTruncated} copyText={swapLink} />
      </div>
    </div>
  );
};

export default SwapLinkView;
