import { useEffect, useRef } from "react";

const OtpInput = ({ otpLength = 6, identifier = '', onOtpChange = () => { } }) => {
  const otpRefs = useRef([]);

  useEffect(() => {
    otpRefs.current.forEach((input) => {
      if (input) input.value = "";
    });
  }, []);

  const handleOtpChange = (e, index) => {
    const value = e.target.value;

    if (!/^\d?$/.test(value)) {
      e.target.value = "";
      return;
    }

    if (value && index < otpLength - 1) {
      otpRefs.current[index + 1]?.focus();
    }

    const otpValue = otpRefs.current
      .map((input) => input?.value || "")
      .join("");

    const isValid = otpValue.length === otpLength;

    if (typeof onOtpChange === "function") {
      onOtpChange(otpValue, isValid);
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="bg-white flex flex-col items-center justify-center p-2 my-1 gap-5 rounded-[15px]">
      <span className="text-[1.1em] text-black font-bold">Enter OTP</span>

      <div className="w-full flex gap-2 justify-center">
        {Array.from({ length: otpLength }).map((_, index) => (
          <input
            key={index}
            autoFocus={index === 0}
            ref={(el) => (otpRefs.current[index] = el)}
            maxLength={1}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="bg-[#e4e4e4] w-[30px] h-[30px] text-center rounded-[7px] text-gray-800 font-semibold focus:bg-indigo-100 outline-none"
            onChange={(e) => handleOtpChange(e, index)}
            onKeyDown={(e) => handleOtpKeyDown(e, index)}
          />
        ))}
      </div>

      <p className="text-[0.7em] text-black text-center">
        {` We have sent a verification code to your ${identifier}`}
      </p>
    </div>
  );
};

export default OtpInput;
