const FeeInput = ({ title, fee, setFee }) => {
  return (
    <div>
      <div>{title}</div>
      <input
        placeholder="Fee"
        size="16"
        value={fee}
        onChange={(event) => {
          setFee(event.target.value);
        }}
      />
      <span>{" Algo"}</span>
    </div>
  );
};

export default FeeInput;
