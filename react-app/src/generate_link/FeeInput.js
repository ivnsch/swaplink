import StatusMsgUpdater from "../StatusMsgUpdater";
import React, { useState } from "react";

const FeeInput = ({ title, fee, setFee, onChange }) => {
  const [statusMsg, setStatusMsg] = useState(null);
  const [statusMsgUpdater, _] = useState(new StatusMsgUpdater(setStatusMsg));

  return (
    <div>
      <div>{title}</div>
      <input
        placeholder="Fee"
        size="16"
        value={fee}
        onChange={(event) => {
          let input = event.target.value;
          setFee(input);
          onChange(input);
        }}
      />
      <span>{" Algo"}</span>
    </div>
  );
};

export default FeeInput;
