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
    if (holdingsMsgPack) {
      console.log("calling search, account: %o", holdingsMsgPack);
      const tokens = await search(
        statusMsg,
        showProgress,
        text,
        holdingsMsgPack
      );
      setTokens(tokens);
    } else {
      // TODO sync with fetch holdings so this can't happen
      console.error("TODO No holdings - input discarded: " + text);
    }
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
        className="input input--address"
        value={assetId}
        onChange={(event) => {
          onSearchInput(event.target.value);
        }}
      />
      {tokens.length == 0 && <div>{"No results"}</div>}
      {tokens.map((token) => {
        return (
          <div className="token-list">
            <div key={token.id}>
              <button
                className="token-list__btn"
                onClick={() => onSelectToken(token)}
              >
                {token.asset_type === "algo" && (
                  <img
                    className="token-list__img"
                    src="https://www.pngall.com/wp-content/uploads/10/Algorand-Crypto-Logo-PNG-Pic.png"
                    alt=""
                  />
                )}

                <div>
                  <div className="token-list__main">{token.main_label}</div>

                  <div className="token-list__secondary">
                    {token.secondary_label}
                  </div>
                </div>
                <div className="token-list__balance">{token.balance}</div>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SelectToken;
