import { useState, useEffect } from "react";
import { validate } from "./input-validators";

const EmailInput = ({
  value = "",
  validators = [],
  onChangeVal,
  disabled = false,
  label = "",
  id = ''
}) => {
  const [touched, setTouched] = useState(false);

  const isValid = validate(value, validators);

  useEffect(() => {
    const valid = validate(value, validators);
    onChangeVal(value, valid);
  }, [value]);

  const handleChange = (e) => {
    const newVal = e.target.value;
    const valid = validate(newVal, validators);
    onChangeVal(newVal, valid);
  };

  return (
    <div className="w-full h-20 ">
      <label htmlFor={id} className="block text-sm font-medium pl-2 mb-1 text-black/70">
        {label}
      </label>
      <input
        autoFocus
        id="email"
        type="email"
        value={value}
        disabled={disabled}
        placeholder="Enter email address"
        onBlur={() => setTouched(true)}
        onChange={handleChange}
        className={`w-full px-2 py-2 rounded-xl h-[2.4rem] border-2 border-gray-500 outline-none transition ${touched && !validate(value, validators)
          ? "border-red-400"
          : "border-gray-300 focus:border-blue-500"
          }`}
      />

      {touched && !validate(value, validators) && (
        <p className="text-xs text-red-500 mt-1 ml-1">
          Enter a valid email address
        </p>
      )}
    </div>
  );
};

export default EmailInput;
