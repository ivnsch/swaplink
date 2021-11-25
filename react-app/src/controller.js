const wasmPromise = import("wasm");

export const fetchBalance = async (statusMsg, myAddress) => {
  try {
    const { bridge_balance } = await wasmPromise;
    const res = await bridge_balance({
      address: myAddress,
    });
    return res.balance;
  } catch (e) {
    statusMsg.error(e);
  }
};

export const toFriendlyError = (msg) => {
  return tryOverspendError(msg);
};

export const tryOverspendError = (msg) => {
  const regex = /account\s*(.*?),/;
  const match = msg.match(regex);
  if (match && match.length == 2) {
    let address = match[1];
    return (
      "Address " + address + " doesn't have enough funds to complete the swap."
    );
  } else {
    return null;
  }
};
