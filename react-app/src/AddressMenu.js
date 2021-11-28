import React from "react";

const AddressMenu = ({ statusMsg, myAddress, wallet }) => {
  return (
    <React.Fragment>
      <a
        className="btn btn--transparent"
        href={"https://algoexplorer.io/address/" + myAddress}
        target="_blank"
      >
        {"AlgoExplorer"}
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
