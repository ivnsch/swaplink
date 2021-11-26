import { search, fetchHoldingsMsgPack } from "./controller";
import React, { useState, useEffect } from "react";

let delayTimer;

const SelectToken = ({ statusMsg, showProgress, myAddress, onSelectToken }) => {
  const [assetId, setAssetId] = useState("");
  const [tokens, setTokens] = useState([]);
  const [holdingsMsgPack, setHoldingsMsgPack] = useState(null);

  useEffect(async () => {
    if (myAddress) {
      let holdings = await fetchHoldingsMsgPack(
        statusMsg,
        showProgress,
        myAddress
      );
      setHoldingsMsgPack(holdings);
    }
  }, [myAddress]);

  const searchToken = async (text) => {
    console.log("calling search, account: %o", holdingsMsgPack);
    const tokens = await search(statusMsg, showProgress, text, holdingsMsgPack);
    setTokens(tokens);
  };

  const searchTokenDelayed = async (text) => {
    clearTimeout(delayTimer);
    delayTimer = setTimeout(async function () {
      searchToken(text);
    }, 300);
  };

  const onSearchInput = (text) => {
    setAssetId(text);
    if (text.length == 0) {
      searchToken("");
    } else {
      searchTokenDelayed(text);
    }
  };

  useEffect(() => {
    if (holdingsMsgPack) {
      console.log("holdingsMsgPack, account: %o", holdingsMsgPack);
      searchToken("");
    }
  }, [holdingsMsgPack]);

  return (
    <div>
      <input
        placeholder="Asset id"
        className="inline"
        size="16"
        value={assetId}
        onChange={(event) => {
          onSearchInput(event.target.value);
        }}
      />
      {tokens.length == 0 && <div>{"No results"}</div>}
      {tokens.map((token) => {
        return (
          <div key={token.id}>
            <button onClick={() => onSelectToken(token)}>
              {token.main_label}
            </button>
            <div>{token.secondary_label}</div>
            <div>{token.balance}</div>
          </div>
        );
      })}
    </div>
  );
};

export default SelectToken;
