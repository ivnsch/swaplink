const SelectUnit = ({ statusMsg, assetId, setAssetId, onUnitSelected }) => {
  return (
    <div>
      <button onClick={() => onUnitSelected("algo")}>{"Algos"}</button>
      <div>
        {"Asset: "}
        <input
          placeholder="Asset id"
          className="inline"
          size="16"
          value={assetId}
          onChange={(event) => {
            setAssetId(event.target.value);
          }}
        />
        <button
          onClick={async () => {
            if (!assetId) {
              statusMsg.error("Please enter an asset id");
            } else {
              onUnitSelected("asset");
            }
          }}
        >
          {"Ok"}
        </button>
      </div>
    </div>
  );
};

export default SelectUnit;
