import WalletConnect from "@walletconnect/client";
import QRCodeModal from "algorand-walletconnect-qrcode-modal";
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";
import { useState, useEffect } from "react";

export function useWalletConnect(statusMsg, setMyAddress) {
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    try {
      setWallet(createWallet(statusMsg, setMyAddress));
    } catch (e) {
      statusMsg.error(e);
    }
  }, [statusMsg, setMyAddress]);

  return wallet;
}

const createWallet = (statusMsg, setMyAddress) => {
  const onAddressUpdate = (address) => {
    setMyAddress(address);
  };

  const onDisconnect = () => {
    setMyAddress("");
  };

  const connector = createConnector();

  const wallet = {
    isConnected: () => {
      console.log("connected: " + connector.connected);
      return connector.connected;
    },

    onPageLoad: () => {
      try {
        if (connector.connected) {
          onConnectorConnected(connector, onAddressUpdate, onDisconnect);
        }
      } catch (e) {
        statusMsg.error(e);
      }
    },

    connect: async () => {
      try {
        if (!connector.connected) {
          await connector.createSession();
        }
        onConnectorConnected(connector, onAddressUpdate, onDisconnect);
      } catch (e) {
        statusMsg.error(e);
      }
    },

    disconnect: async () => {
      try {
        await connector.killSession();
        onDisconnect();
      } catch (e) {
        statusMsg.error(e);
      }
    },

    sign: async (toSign) => {
      return await sign(connector, toSign);
    },
  };

  return wallet;
};

const createConnector = () => {
  return new WalletConnect({
    bridge: "https://bridge.walletconnect.org",
    qrcodeModal: QRCodeModal,
  });
};

const onConnectorConnected = (connector, onAddressUpdate, onDisconnect) => {
  // if account is set in connector, use it, also register to events
  // the field is for when the page is loaded with an active session - currently no events seem to be triggered here
  if (connector.accounts.length == 1) {
    onAddressUpdate(connector.accounts[0]);
  } else if (connector.accounts.length > 1) {
    throw new Error(
      "Unexpected WalletConnect accounts length (connection): " +
        connector.accounts.length
    );
    return;
  }

  console.log("connector connected: " + JSON.stringify(connector));
  subscribeToEvents(connector, onAddressUpdate, onDisconnect);
};

const subscribeToEvents = (connector, onAddressUpdate, onDisconnect) => {
  connector.on("connect", (error, payload) => {
    if (error) {
      throw error;
    }
    const { accounts } = payload.params[0];
    if (accounts.length != 1) {
      throw new Error(
        "Unexpected WalletConnect accounts length (update): " + accounts.length
      );
      return;
    }
    onAddressUpdate(accounts[0]);
  });

  connector.on("session_update", (error, payload) => {
    if (error) {
      throw error;
    }

    const { accounts } = payload.params[0];
    console.log("Session update: " + JSON.stringify(accounts));
  });

  connector.on("disconnect", (error, payload) => {
    onDisconnect();
    if (error) {
      throw error;
    }
  });
};

const sign = async (connector, toSign) => {
  const requestParams = [toSign.txs];

  const request = formatJsonRpcRequest("algo_signTxn", requestParams);

  console.log("WalletConnect request: " + JSON.stringify(request));
  const result = await connector.sendCustomRequest(request);
  console.log("WalletConnect result: " + JSON.stringify(result));

  let signedTx = result[toSign.result_index];
  let decodedSignedTx = Array.from(
    new Uint8Array(Buffer.from(signedTx, "base64"))
  );
  console.log(
    "WalletConnect decodedSignedTx: " + JSON.stringify(decodedSignedTx)
  );

  return decodedSignedTx;
};
