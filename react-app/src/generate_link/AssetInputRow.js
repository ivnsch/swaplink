const AssetInputRow = ({
  amount,
  setAmount,
  unit,
  assetBalance,
  unitLabel,
  onUnitClick,
}) => {
  return (
    <div className="input-row">
      {assetAmountView(amount, setAmount)}
      <button onClick={() => onUnitClick()}>
        {<div>{unitLabel === "" ? "Select asset" : unitLabel}</div>}
      </button>
      {unit !== "algo" && assetBalance && (
        <div>{"Balance: " + assetBalance}</div>
      )}
    </div>
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
