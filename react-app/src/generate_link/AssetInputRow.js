const AssetInputRow = ({
  amount,
  setAmount,
  unit,
  myBalance,
  assetBalance,
  unitLabel,
  onUnitClick,
}) => {
  let balanceText = generateBalanceText(unit, myBalance, assetBalance);
  return (
    <div className="input-row">
      {assetAmountView(amount, setAmount)}
      <button onClick={() => onUnitClick()}>
        {<div>{unitLabel === "" ? "Select asset" : unitLabel}</div>}
      </button>
      {balanceText && <div>{balanceText}</div>}
    </div>
  );
};

const generateBalanceText = (unit, myBalance, assetBalance) => {
  if (unit === "algo") {
    if (myBalance === "") {
      return "";
    } else {
      return "Balance: " + myBalance;
    }
  } else if (unit === "asset") {
    if (assetBalance === "") {
      return "";
    } else {
      return "Balance: " + assetBalance;
    }
  } else {
    throw Error("Invalid unit: " + unit);
  }
};

const assetAmountView = (amount, setAmount) => {
  return (
    <input
      placeholder={"Amount"}
      className="inline"
      size="16"
      value={amount}
      onChange={(event) => {
        setAmount(event.target.value);
      }}
    />
  );
};

export default AssetInputRow;
