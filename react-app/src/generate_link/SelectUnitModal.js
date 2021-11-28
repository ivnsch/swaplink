import Modal from "../Modal";
import StatusMsgUpdater from "../StatusMsgUpdater";
import React, { useState } from "react";
import SelectUnit from "./select_unit/SelectUnit";

export const SelectUnitModal = ({
  showProgress,
  token,
  setToken,
  updateTokenWithSelectedUnit,
  setShowModal,
}) => {
  const [statusMsg, setStatusMsg] = useState(null);
  const [statusMsgUpdater, _] = useState(new StatusMsgUpdater(setStatusMsg));

  return (
    <Modal
      title={"Unit"}
      statusMsgUpdater={statusMsgUpdater}
      statusMsg={statusMsg}
      onCloseClick={() => setShowModal(false)}
    >
      <SelectUnit
        statusMsg={statusMsgUpdater}
        initialAssetId={token?.assetId}
        showProgress={showProgress}
        onSelectUnit={async (unit) => {
          setShowModal(false);
          await updateTokenWithSelectedUnit(setToken, unit);
        }}
      />
    </Modal>
  );
};
