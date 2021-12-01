export const NumberInput = ({ value, onChange }) => {
  return (
    <input
      className="input input--amount"
      placeholder={"0.0"}
      value={value}
      onChange={(event) => {
        const input = event.target.value;
        if (/^\d*\.?\d*$/.test(input)) {
          onChange(input);
        }
      }}
    />
  );
};

export default NumberInput;
