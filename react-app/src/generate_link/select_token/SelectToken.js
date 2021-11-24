import { search, featchAccountMsgPack } from "./controller";
import React, { useState, useEffect } from "react";

let delayTimer;

const SelectToken = ({ statusMsg, showProgress, myAddress, onSelectToken }) => {
  const [assetId, setAssetId] = useState("");
  const [tokens, setTokens] = useState([]);
  const [accountMsgPack, setAccountMsgPack] = useState(null);

  useEffect(async () => {
    if (myAddress) {
      let account = await featchAccountMsgPack(
        statusMsg,
        showProgress,
        myAddress
      );
      setAccountMsgPack(account);
    }
  }, [myAddress]);

  const searchToken = async (text) => {
    console.log("calling search, account: %o", accountMsgPack);
    const tokens = await search(statusMsg, showProgress, text, accountMsgPack);
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
    if (text.length > 2) {
      searchTokenDelayed(text);
    } else if (text.length == 0) {
      searchToken("");
    }
  };

  useEffect(() => {
    if (accountMsgPack) {
      console.log("accountMsgPack, account: %o", accountMsgPack);
      searchToken("");
    }
  }, [accountMsgPack]);

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
          </div>
        );
      })}
    </div>
  );
};

export default SelectToken;
