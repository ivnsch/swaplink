import NumberInput from "./NumberInput";

const AssetInputRow = ({
  label,
  tokenInputs,
  setTokenInputs,
  onTokenClick,
}) => {
  return (
    <div className="swap-field">
      <label className="swap-field__label label">{label}</label>
      {assetAmountView(tokenInputs, setTokenInputs)}

      <div className="swap-field__btns">
        {tokenInputs?.token &&
          generateMaxView(tokenInputs.token, () => {
            setTokenInputs((t) => {
              return {
                ...t,
                amount: t.token.balance,
              };
            });
          })}

        <button
          className="btn btn--change-token"
          onClick={() => onTokenClick()}
        >
          {<div>{tokenInputs?.token?.main_label ?? "Select asset"}</div>}
        </button>
      </div>
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
    <NumberInput
      value={value}
      onChange={(input) =>
        setToken({
          ...tokenInputs,
          amount: input,
        })
      }
    />
  );
};

export default AssetInputRow;
