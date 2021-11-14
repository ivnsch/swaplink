// TODO refactor: shouldn't have if else everywhere for algo/asset

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
      {balanceText && (
        <div>
          <span>{balanceText}</span>
          {generateMaxView(unit, myBalance, assetBalance, () => {
            if (unit === "algo") {
              setAmount(myBalance);
            } else if (unit === "asset") {
              setAmount(assetBalance);
            } else {
              throw Error("Invalid unit: " + unit);
            }
          })}
        </div>
      )}
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

const generateMaxView = (unit, myBalance, assetBalance, onClick) => {
  if (unit === "algo") {
    return generateMaxViewForBalance(myBalance, onClick);
  } else if (unit === "asset") {
    return generateMaxViewForBalance(assetBalance, onClick);
  } else {
    throw Error("Invalid unit: " + unit);
  }
};

const generateMaxViewForBalance = (balance, onClick) => {
  return (
    balance !== "" &&
    balance !== "0" && <button onClick={onClick}>{"max"}</button>
  );
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
