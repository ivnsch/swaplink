import CopyPasteText from "../CopyPasteText";

const SwapLinkView = ({ swapLink, swapLinkTruncated }) => {
  return (
    <div className="link-data-container">
      <div className="submit-msg">
        {
          "Send this link to your peer. Upon opening, they can confirm and submit the swap."
        }
      </div>

      <div className="swap-link">
        <CopyPasteText text={swapLinkTruncated} copyText={swapLink} />
      </div>

      <div className="submit-msg-warning">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 6V9.33333"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.00004 14.2733H3.96004C1.6467 14.2733 0.680037 12.6199 1.80004 10.5999L3.88004 6.85327L5.84004 3.33327C7.0267 1.19327 8.97337 1.19327 10.16 3.33327L12.12 6.85994L14.2 10.6066C15.32 12.6266 14.3467 14.2799 12.04 14.2799H8.00004V14.2733Z"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.99634 11.3333H8.00233"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {" Link expires in 1 hour."}
      </div>
    </div>
  );
};

export default SwapLinkView;
