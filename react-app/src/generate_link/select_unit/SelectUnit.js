import { fetchAssetData } from "./controller";
import React, { useState } from "react";
import { assetUnit, algoUnit } from "../TokenFunctions";

const SelectUnit = ({
  statusMsg,
  initialAssetId,
  showProgress,
  onSelectUnit,
}) => {
  const [assetId, setAssetId] = useState(initialAssetId);

  return (
    <div>
      <button onClick={() => onSelectUnit({ name: algoUnit, label: "algo" })}>
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
            const assetData = await fetchAssetData(
              statusMsg,
              assetId,
              showProgress
            );
            if (assetData) {
              onSelectUnit({
                name: assetUnit,
                label: assetData.unitLabel,
                assetData: assetData,
              });
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
