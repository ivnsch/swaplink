const AssetInputRow = ({ label, token, setToken, onTokenClick }) => {
  return (
    <div className="swap-field">
      <div>
        <label className="label">{label}</label>
        {assetAmountView(token, setToken)}
      </div>

      {token &&
        generateMaxView(token, () => {
          setToken((t) => {
            return {
              ...t,
              amount: t.balance,
            };
          });
        })}

      <button className="btn btn--change-token" onClick={() => onTokenClick()}>
        {<div>{token?.main_label ?? "Select asset"}</div>}
      </button>
    </div>
  );
};

const generateMaxView = (token, onClick) => {
  return (
    token.balance !== "" &&
    token.balance !== "0" && (
      <button className="btn btn--max" onClick={onClick}>
        {"max"}
      </button>
    )
  );
};

const assetAmountView = (token, setToken) => {
  return (
    <input
      className="input input--amount"
      placeholder={"0.0"}
      value={token?.amount}
      onChange={(event) => {
        setToken({
          ...token,
          amount: event.target.value,
        });
      }}
    />
  );
};

export default AssetInputRow;
