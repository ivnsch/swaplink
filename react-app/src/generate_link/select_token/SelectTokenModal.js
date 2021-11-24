import Modal from "../../Modal";
import StatusMsgUpdater from "../../StatusMsgUpdater";
import React, { useState } from "react";
import SelectToken from "./SelectToken";

export const SelectTokenModal = ({
  showProgress,
  setToken,
  setShowModal,
  myAddress,
}) => {
  const [statusMsg, setStatusMsg] = useState(null);
  const [statusMsgUpdater, _] = useState(new StatusMsgUpdater(setStatusMsg));

  return (
    <Modal
      title={"Token"}
      statusMsg={statusMsg}
      onCloseClick={() => setShowModal(false)}
    >
      <SelectToken
        statusMsg={statusMsgUpdater}
        showProgress={showProgress}
        myAddress={myAddress}
        onSelectToken={async (token) => {
          setShowModal(false);
          setToken(token);
        }}
      />
    </Modal>
  );
};
