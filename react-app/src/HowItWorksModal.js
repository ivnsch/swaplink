import Modal from "./Modal";

const HowItWorksModal = ({ setShowModal }) => {
  return (
    <Modal title={"How it works"} onCloseClick={() => setShowModal(false)}>
      <p>
        With SwapLink, 2 peers can swap Algorand assets (Algos, ASAs and NFTs)
        directly and without slippage.
      </p>
      <p>
        SwapLink uses layer 1 atomic swaps - an Algorand capability that allows
        to swap safely without smart contracts. Both parties can verify both
        transfers when signing with their wallet.
      </p>
      <p>
        The complete swap is encoded in a link - SwapLink doesn't lock tokens or
        store any data - and submitted directly to the network by the receiving
        party.
      </p>
      <p>
        Note that this means that nothing is executed when the link is
        generated: The swap, fees deduction, balance and opt-in checks for both
        parties find place when the receiver submits the transactions.
      </p>
    </Modal>
  );
};

export default HowItWorksModal;
