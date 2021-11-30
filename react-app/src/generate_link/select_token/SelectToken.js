import { search, fetchHoldingsMsgPack } from "./controller";
import React, { useState, useEffect, useCallback } from "react";

let delayTimer;

const SelectToken = ({ statusMsg, showProgress, myAddress, onSelectToken }) => {
  const [assetId, setAssetId] = useState("");
  const [tokens, setTokens] = useState([]);
  const [holdingsMsgPack, setHoldingsMsgPack] = useState(null);

  useEffect(() => {
    async function updateHoldings() {
      if (myAddress) {
        let holdings = await fetchHoldingsMsgPack(
          statusMsg,
          showProgress,
          myAddress
        );
        setHoldingsMsgPack(holdings);
      }
    }
    updateHoldings();
  }, [statusMsg, showProgress, myAddress]);

  const searchToken = useCallback(
    async (text) => {
      const tokens = await search(
        statusMsg,
        showProgress,
        text,
        holdingsMsgPack
      );
      setTokens(tokens);
    },
    [statusMsg, showProgress, holdingsMsgPack]
  );

  const searchTokenDelayed = async (text) => {
    clearTimeout(delayTimer);
    delayTimer = setTimeout(async function () {
      searchToken(text);
    }, 300);
  };

  const onSearchInput = async (text) => {
    setAssetId(text);
    if (text.length === 0) {
      clearTimeout(delayTimer);
      searchToken("");
    } else {
      searchTokenDelayed(text);
    }
  };

  useEffect(() => {
    async function initSearch() {
      searchToken("");
    }
    initSearch();
  }, [searchToken, statusMsg, showProgress, holdingsMsgPack]);

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
      {tokens.length === 0 && (
        <div className="asset-no-result">{"No results"}</div>
      )}
      {tokens.map((token) => {
        return (
          <div key={token.id} className="token-list">
            <div>
              <button
                className="token-list__btn"
                onClick={() => onSelectToken(token)}
              >
                <img
                  style={{ display: "block" }}
                  className="token-list__img"
                  src={token.image_url}
                  onError={(event) => {
                    event.target.style.display = "none";
                  }}
                />

                <div>
                  <div className="token-list__main">{token.main_label}</div>

                  <div className="token-list__secondary">
                    {token.secondary_label}
                  </div>
                </div>
                <div className="token-list__balance">
                  {!token.balance ? (
                    <div className="lds-ring">
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  ) : (
                    token.balance
                  )}
                </div>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SelectToken;
