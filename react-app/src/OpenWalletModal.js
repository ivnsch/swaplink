import Modal from "./Modal";

const OpenWalletModal = ({ setShowModal }) => {
  return (
    <Modal
      title={"TODO - different modal"}
      onCloseClick={() => setShowModal(false)}
    >
      <div>{"Please confirm the swap in your wallet"}</div>
    </Modal>
  );
};

export default OpenWalletModal;
