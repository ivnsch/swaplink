import { onAlgoClick, onAssetSubmit } from "./controller";
import React, { useState } from "react";

const SelectUnit = ({
  statusMsg,
  address,
  assetId: parentAssetId,
  setAssetId: setParentAssetId,
  setAssetBalance,
  setAssetUnitLabel,
  onUnitSelected,
}) => {
  const [assetId, setAssetId] = useState(parentAssetId);

  return (
    <div>
      <button onClick={() => onAlgoClick(onUnitSelected, setAssetUnitLabel)}>
        {"Algos"}
      </button>
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
            onAssetSubmit(
              statusMsg,
              address,
              assetId,
              setParentAssetId,
              setAssetBalance,
              onUnitSelected,
              setAssetUnitLabel
            );
          }}
        >
          {"Ok"}
        </button>
      </div>
    </div>
  );
};

export default SelectUnit;
