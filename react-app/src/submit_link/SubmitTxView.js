import ExternalLinkIcon from "../svg/ExternalLinkIcon";

const SubmitTxView = ({ txId }) => {
  return (
    <div className="link-data-container">
      <div className="submit-msg">{"Transaction id:"}</div>

      <a
        className="btn btn--swap-complete btn--truncated"
        href={"https://testnet.algoexplorer.io/tx/" + txId}
        target="_blank"
        rel="noreferrer"
      >
        {txId}
        <ExternalLinkIcon />
      </a>
    </div>
  );
};

export default SubmitTxView;
