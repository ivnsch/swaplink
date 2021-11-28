import Modal from "./Modal";

const HowItWorksModal = ({ setShowModal }) => {
  return (
    <Modal title={"How it works"} onCloseClick={() => setShowModal(false)}>
      <p>
        SwapLink uses layer 1 atomic swaps - an Algorand capability that allows
        to swap safely without smart contracts.
      </p>

      <p>You can swap any Algorand tokens: Algos, ASAs and NFTs.</p>

      <p>
        The complete swap is encoded in a link - SwapLink doesn't lock your
        tokens or store any data - and submitted directly to the network by the
        receiving party.
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
