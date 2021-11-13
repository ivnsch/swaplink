const FeeInput = ({ title, fee, setFee, onChange }) => {
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
