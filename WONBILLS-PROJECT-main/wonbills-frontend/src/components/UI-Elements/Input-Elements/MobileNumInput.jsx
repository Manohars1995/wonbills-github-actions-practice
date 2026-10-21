import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { FaCheck } from "react-icons/fa6";
import { validate } from "./input-validators";

const MobileNumberInput = ({
    value,
    validators = [],
    onChangeVal,
    label = '',
    id = ''
}) => {
    const [touched, setTouched] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleChange = (e) => {
        const newVal = e.target.value;
        const valid = validate(newVal, validators);
        onChangeVal(newVal, valid);
    };

    return (

        <div className="w-full h-20">
            <label
                htmlFor={id}
                className="block text-sm font-medium pl-2 mb-1 text-black/70"
            >
                {label}
            </label>

            {/* Input Wrapper */}
            <div
                className="
                        relative flex h-[2.4rem] rounded-xl
                        border-2 border-gray-500
                        transition
                        focus-within:border-black
                        focus-within:ring-0 focus-within:ring-black
                        "
            >
                {/* Country Selector */}
                <button
                    type="button"
                    className="
                        flex items-center gap-1
                        pl-2 pr-1 py-1
                        rounded-l-xl bg-white
                        text-sm font-semibold text-[#8a817c]
                        cursor-pointer
                    "
                    onClick={() => setShowDropdown((p) => !p)}
                >
                    IN
                    <span
                        className={`transition-transform duration-300 ${showDropdown ? "rotate-180" : "rotate-0"
                            }`}
                    >
                        <IoIosArrowDown />
                    </span>
                    <span>+91</span>
                </button>

                {/* Phone Input */}
                <input
                    autoFocus
                    type="tel"
                    name="mobile"
                    autoComplete="tel"
                    maxLength={10}
                    value={value}
                    onChange={handleChange}
                    onFocus={() => setShowDropdown(false)}
                    onBlur={() => setTouched(true)}
                    className="
                        flex-1 px-2 py-1
                        text-sm font-semibold tracking-widest text-black
                        rounded-r-xl
                        outline-none ring-0 shadow-none
                        focus:outline-none focus:ring-0 focus:shadow-none
                    "
                />

                {/* Dropdown */}
                <div
                    className={`absolute top-[45px] left-0 z-10 w-full
            rounded-xl border-2 border-[#ccc] bg-white
            shadow-md p-1 text-sm transition
            ${showDropdown
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-95 pointer-events-none"
                        }
          `}
                >
                    <div
                        className="
              flex items-center justify-between
              px-4 py-2 rounded-lg
              bg-blue-100 text-black font-semibold
              cursor-pointer
            "
                        onMouseDown={() => setShowDropdown(false)}
                    >
                        <span>India (भारत) +91</span>
                        <span className="text-blue-700 text-lg">
                            <FaCheck />
                        </span>
                    </div>
                </div>
            </div>

            {/* Error */}
            {touched && !validate(value, validators) && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                    Invalid mobile number
                </p>
            )}
        </div>
    );
};

export default MobileNumberInput;
