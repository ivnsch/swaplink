export const algoUnit = "algo";
export const assetUnit = "asset";

export const tokenIsAlgo = (token) => {
  return unitIsAlgo(token.unit);
};

export const tokenIsAsset = (token) => {
  return unitIsAsset(token.unit);
};

export const unitIsAlgo = (unit) => {
  return unit.name === algoUnit;
};

export const unitIsAsset = (unit) => {
  return unit.name === assetUnit;
};
