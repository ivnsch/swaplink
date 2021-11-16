import { updateFeeTotal } from "./controller";
import Modal from "../Modal";
import StatusMsgUpdater from "../StatusMsgUpdater";
import React, { useState } from "react";
import FeeInput from "./FeeInput";

export const FeesModal = ({
  myFee,
  setMyFee,
  peerFee,
  setPeerFee,
  feeTotal,
  setFeeTotal,
  hideFeeTotal,
  setHideFeeTotal,
  setShowFeesModal,
}) => {
  const [statusMsg, setStatusMsg] = useState(null);
  const [statusMsgUpdater, _] = useState(new StatusMsgUpdater(setStatusMsg));

  return (
    <Modal
      title={"Fees"}
      statusMsg={statusMsg}
      onCloseClick={() => setShowFeesModal(false)}
    >
      <FeeInput
        title={"Your fee"}
        fee={myFee}
        setFee={setMyFee}
        onChange={(input) => {
          updateFeeTotal(
            statusMsgUpdater,
            input,
            peerFee,
            setFeeTotal,
            setHideFeeTotal
          );
        }}
      />
      <FeeInput
        title={"Peer's fee"}
        fee={peerFee}
        setFee={setPeerFee}
        onChange={(input) =>
          updateFeeTotal(
            statusMsgUpdater,
            myFee,
            input,
            setFeeTotal,
            setHideFeeTotal
          )
        }
      />
      {!hideFeeTotal && (
        <div>
          <span style={{ marginRight: 5 }}>{"Total:"}</span>
          <span>{feeTotal}</span>
          <span>{" Algo"}</span>
        </div>
      )}
    </Modal>
  );
};
