import React from "react";

export const PureStakeHelp = () => {
  return (
    <div>
      <p>
        <a target="_blank" href="https://www.purestake.com/">
          Purestake
        </a>{" "}
        provides a service that allows swaplink to submit transactions to the
        algorand blockchain without requiring a connection to an algorand node.
      </p>
      <p>
        Algorand has provided a detailed, step-by-step tutorial on how to sign
        up for purestake and how to obtain an API key here:{" "}
        <a
          target="_blank"
          href="https://developer.algorand.org/tutorials/getting-started-purestake-api-service/"
        >
          Getting Started with the PureStake API Service
        </a>
      </p>
    </div>
  );
};
