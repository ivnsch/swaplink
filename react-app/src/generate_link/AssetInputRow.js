const AssetInputRow = ({ assetId, amount, setAmount, unit, onUnitClick }) => {
  return (
    <div className="input-row">
      {assetAmountView(amount, setAmount)}
      <button onClick={() => onUnitClick()}>
        {<div>{unitLabel(unit, assetId)}</div>}
      </button>
    </div>
  );
};

const unitLabel = (unit, assetId) => {
  if (unit === "algo") {
    return "algo";
  } else if (unit === "asset") {
    // TODO review
    if (!assetId) {
      return "Select asset";
    } else {
      return assetId + " (id)";
    }
  } else {
    throw Error("Illegal state: no unit");
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
