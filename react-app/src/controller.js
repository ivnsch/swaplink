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
