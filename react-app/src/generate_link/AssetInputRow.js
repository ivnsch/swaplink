const AssetInputRow = ({
  label,
  tokenInputs,
  setTokenInputs,
  onTokenClick,
}) => {
  return (
    <div className="swap-field">
      <div>
        <label className="label">{label}</label>
        {assetAmountView(tokenInputs, setTokenInputs)}
      </div>

      {tokenInputs?.token &&
        generateMaxView(tokenInputs.token, () => {
          setTokenInputs((t) => {
            return {
              ...t,
              amount: t.token.balance,
            };
          });
        })}

      <button className="btn btn--change-token" onClick={() => onTokenClick()}>
        {<div>{tokenInputs?.token?.main_label ?? "Select asset"}</div>}
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

const assetAmountView = (tokenInputs, setToken) => {
  // if the amount is 0, use the placeholder - so user doesn't have to delete it
  let value = tokenInputs?.amount === "0" ? "" : tokenInputs?.amount ?? "";

  return (
    <input
      className="input input--amount"
      placeholder={"0.0"}
      value={value}
      onChange={(event) => {
        setToken({
          ...tokenInputs,
          amount: event.target.value,
        });
      }}
    />
  );
};

export default AssetInputRow;
