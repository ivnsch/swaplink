import React from "react";
import ExternalLinkIcon from "./svg/ExternalLinkIcon";

const AddressMenu = ({ statusMsg, myAddress, wallet }) => {
  return (
    <React.Fragment>
      <a
        className="btn btn--transparent"
        href={"https://testnet.algoexplorer.io/address/" + myAddress}
        target="_blank"
        rel="noreferrer"
      >
        {"AlgoExplorer"}
        <ExternalLinkIcon />
      </a>
      <button
        className="btn btn--transparent btn--warning"
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
    </React.Fragment>
  );
};

export default AddressMenu;
