const AssetInputRow = ({
  assetId,
  setAssetId,
  amount,
  setAmount,
  unit,
  setUnit,
}) => {
  return (
    <div className="input-row">
      {assetIdView(unit, assetId, setAssetId)}
      {assetAmountView(amount, setAmount)}
      {assetUnitView(unit, setUnit)}
    </div>
  );
};

const assetIdView = (unit, assetId, setAssetId) => {
  return (
    unit === "asset" && (
      <input
        placeholder="Asset id"
        className="inline"
        size="16"
        value={assetId}
        onChange={(event) => {
          setAssetId(event.target.value);
        }}
      />
    )
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

const assetUnitView = (unit, setUnit) => {
  return (
    <select value={unit} onChange={(event) => setUnit(event.target.value)}>
      <option value="algo">Algo</option>
      <option value="asset">Asset</option>
    </select>
  );
};

export default AssetInputRow;
