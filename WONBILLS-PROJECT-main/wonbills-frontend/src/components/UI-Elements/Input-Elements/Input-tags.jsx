import React, { useState, useMemo } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import Select from "react-select";
import { validate } from "./input-validators";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

/* -------------------------------------------------------
   InputTag Component
------------------------------------------------------- */
export const InputTag = ({
  id,
  type = "text",
  label,
  value = "",
  validators = [],
  styles = "",
  readonly = false,
  max,
  min = 0,
  onChangeVal = () => { },
  loading = false,
  placeholder = ''
}) => {
  const [touched, setTouched] = useState(false);

  const isValid = useMemo(() => validate(value, validators), [value, validators]);

  const handleChange = (e) => {
    if (readonly || loading) return;

    const newVal = e.target.value;
    const valid = validate(newVal, validators);
    onChangeVal(newVal, valid);
  };

  return (
    <div className="h-20">
      <label htmlFor={id} className="block text-sm font-medium pl-2 mb-1 text-black/70">
        {label}
      </label>

      <div className={`
          w-full h-[2.4rem] border-2 rounded-xl flex items-center  relative
          ${!isValid && touched ? "border-red-500" : "border-gray-500"}
        `}>
        <input
          id={id}
          type={type}
          value={value}
          min={min}
          maxLength={max}
          readOnly={readonly}
          onChange={handleChange}
          placeholder={placeholder}
          onBlur={() => !readonly && setTouched(true)}
          className={`
            flex-1 min-w-0 bg-transparent rounded-xl outline-none border-none h-full px-2
            ${styles}
          `}
        />

        {loading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
            <span className="block h-4 w-4 rounded-full border-2 border-blue-600 border-b-transparent animate-spin " />
          </div>
        )}



      </div>

      {!isValid && touched && (
        <p className="text-red-500 text-xs mt-1 ml-1">Invalid {label}</p>
      )}
    </div>
  );
};

/* -------------------------------------------------------
   Select Styles
------------------------------------------------------- */

const customStyles = {
  container: (provided) => ({
    ...provided,
    width: "100%",
    height: "fit-content"
  }),
  control: (provided) => ({
    ...provided,
    minHeight: "2.4rem",
    borderRadius: "0.8rem",
    borderWidth: "2px",
    borderColor: "##00000099",
    boxShadow: "none",
    overflow: "hidden",
    "&:hover": {
      borderColor: "#000000B3"
    }
  }),
  valueContainer: (provided) => ({
    ...provided,
    display: "flex",
    flexWrap: "nowrap", // keep on one line
    overflowX: "auto", // scroll when overflow
    maxWidth: "100%",
    paddingRight: "0.5rem",
    scrollbarWidth: "none", // Firefox
    msOverflowStyle: "none" // IE
  }),
  multiValue: (provided) => ({
    ...provided,
    flexShrink: 0, // prevent shrinking
    maxWidth: "max-content", // allow tags to size naturally
    whiteSpace: "nowrap", // don’t wrap tag content
    marginRight: "0.25rem"
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    whiteSpace: "nowrap", // prevent label wrap
    overflow: "visible", // ensure full text shows
    textOverflow: "clip"
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 50,
    borderRadius: "0.8rem",
    padding: "0.1rem 0.3rem",
    position: "absolute",
    overflow: "visible",
    maxHeight: "none",
    borderWidth: "2px",
    borderColor: "#ccc",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: "12rem",
    overflowY: "auto",
    scrollbarWidth: "thin"
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#ddd" : "#fff",
    color: state.isSelected ? "#000" : "#333",
    "&:hover": {
      backgroundColor: "#eee"
    },
    borderRadius: "0.8rem",
    zIndex: 9999
  })
};

/* -------------------------------------------------------
   ReactSelect Component
------------------------------------------------------- */
export const ReactSelect = ({
  id,
  label,
  value = null,
  options = [],
  validators = [],
  onChange,
  loading = false,
  readonly = false
}) => {
  const [touched, setTouched] = useState(false);

  const currentValue = useMemo(
    () => options.find((opt) => opt.value === value?.value) || null,
    [options, value]
  );

  const isValid = useMemo(
    () => validate(value?.value || "", validators),
    [value, validators]
  );

  const handleChange = (newValue) => {
    const val = newValue?.value || "";
    const valid = validate(val, validators);
    onChange(val, valid);
  };

  return (
    <div className={`w-full ${label ? "h-20" : ""} space-y-1`}>
      {label && (
        <label className="block text-sm font-medium pl-2 text-black/80">{label}</label>
      )}

      <Select
        id={id}
        isDisabled={readonly}
        isLoading={loading}
        value={currentValue}
        options={options}
        onChange={handleChange}
        onBlur={() => setTouched(true)}
        styles={customStyles}
        menuPortalTarget={document.body}
        menuPosition="fixed"
        className={`text-sm ${!isValid && touched ? "border border-red-500 rounded-xl" : ""
          }`}
      />

      {!isValid && touched && (
        <p className="text-red-500 text-xs mt-1 ml-1">Invalid {label}</p>
      )}
    </div>
  );
};

/* -------------------------------------------------------
   BtnTag Component
------------------------------------------------------- */
export const BtnTag = ({
  BtnText,
  children,
  type = "button",
  styles = "",
  loading = false,
  disabled = false,
  onClick
}) => (
  <button
    disabled={loading || disabled}
    type={type}
    onClick={onClick}
    className={`h-9 min-w-20 px-6 rounded-xl border ${loading || disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } font-semibold inline-flex justify-center items-center ${styles}`}
  >
    {loading ? (
      <div className="animate-spin w-5 h-5 border-2 border-t-blue-500 border-gray-300 rounded-full"></div>
    ) : (
      <>
        {children && <span className="mr-1">{children}</span>}
        <span>{BtnText}</span>
      </>
    )}
  </button>
);

/* -------------------------------------------------------
   TextareaTag Component
------------------------------------------------------- */
export const TextareaTag = ({
  id,
  label,
  value = "",
  validators = [],
  styles = "",
  Constyles = "",
  readonly = false,
  max,
  onChangeVal,
  placeholder = ""
}) => {
  const [touched, setTouched] = useState(false);

  const isValid = useMemo(
    () => validate(value, validators),
    [value, validators]
  );

  const handleChange = (e) => {
    const newVal = e.target.value;
    onChangeVal(newVal, validate(newVal, validators));
  };

  return (
    <div className={`min-h-20 ${Constyles}`}>
      <label htmlFor={id} className="block text-sm font-medium pl-2 mb-1">
        {label}
      </label>

      <textarea
        id={id}
        value={value}
        maxLength={max}
        readOnly={readonly}
        onChange={handleChange}
        placeholder={placeholder}
        onBlur={() => setTouched(true)}
        className={`bg-(--background-default) w-full min-h-25 px-2 py-2 border-2 rounded-xl focus:outline-none ${!isValid && touched ? "border-red-500" : "border-gray-500"
          } ${styles}`}
      />

      {!isValid && touched && (
        <p className="text-red-500 text-xs mt-1 ml-1">Invalid {label}</p>
      )}
    </div>
  );
};

/* -------------------------------------------------------
   MultiReactSelect Component
------------------------------------------------------- */
export const MultiReactSelect = ({
  id,
  label,
  value = [],
  options = [],
  validators = [],
  onChange,
  loading = false,
  isReadOnly = false
}) => {
  const [touched, setTouched] = useState(false);

  //  Ensure value is always an array of option objects
  const safeValue = Array.isArray(value) ? value : [];

  const isValid = useMemo(() => {
    const vals = safeValue.map(v => v.value);
    return validate(vals.join(","), validators);
  }, [safeValue, validators]);

  const handleChange = (newValue) => {
    const normalized = Array.isArray(newValue) ? newValue : [];
    const selectedValues = normalized.map(v => v.value);
    const valid = validate(selectedValues.join(","), validators);

    // DO NOT change contract
    onChange(selectedValues, valid);
  };

  return (
    <div className="w-full h-20 space-y-1" key={id}>
      {label && (
        <label className="block text-sm font-medium pl-2">
          {label}
        </label>
      )}

      <Select
        isMulti
        isLoading={loading}

        /* REQUIRED FOR CORRECT BEHAVIOR */
        value={safeValue}
        options={options}
        hideSelectedOptions={true}     // selected items disappear from menu
        closeMenuOnSelect={false}      // multi-select UX
        isClearable={false}            // optional but recommended

        formatOptionLabel={(option, { context }) => {
          if (context === "value") {
            // Selected item: show ONLY ID
            return <span className="font-semibold">{option.value}</span>;
          }

          //  M\enu item: show full rich UI
          return option.label;
        }}


        getOptionValue={(opt) => opt.value}
        getOptionLabel={(opt) =>
          typeof opt.label === "string" ? opt.label : opt.value
        }

        onChange={handleChange}
        onBlur={() => setTouched(true)}
        styles={customStyles}
        className={`text-sm ${!isValid && touched ? "border border-red-500 rounded-md" : ""
          }`}
        isDisabled={isReadOnly}
      />

      {!isValid && touched && (
        <p className="text-red-500 text-xs mt-1 ml-1">
          Invalid {label}
        </p>
      )}
    </div>
  );
};


export const PhoneInputTag = ({
  id,
  label,
  value = "",
  validators = [],
  readonly = false,
  onChangeVal,
}) => {
  const [touched, setTouched] = useState(false);

  const isValid = useMemo(
    () => validate(value, validators),
    [value, validators]
  );

  const handleChange = (val) => {
    const valid = validate(val, validators);
    onChangeVal(val, valid);
  };

  return (
    <div className="h-20">
      {/* Label */}
      <label
        htmlFor={id}
        className="block text-sm font-medium pl-2 mb-1 text-black/70"
      >
        {label}
      </label>

      {/* Outer wrapper with border + radius */}
      <div
        className={`
    w-full h-[2.4rem] border-2 rounded-xl flex items-center px-0 
    ${!isValid && touched ? "border-red-500" : "border-gray-500"}
  `}
      >
        <PhoneInput
          defaultCountry="in"
          value={value}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          disabled={readonly}
          className="flex-1"
          inputClassName="
      w-full h-full px-0
      outline-none border-none bg-transparent  text-base! 
      PhoneInputInput
    "

          countrySelectorStyleProps={{
            className: `
         flex items-center px-1 
        bg-transparent border-none outline-none
        PhoneInputCountrySelect
      `,
          }}

          dropdownStyleProps={{
            className: `
        bg-white rounded-xl shadow-lg 
      `,
          }}
        />
      </div>




      {/* Validation Message */}
      {!isValid && touched && (
        <p className="text-red-500 text-xs mt-1 ml-1">
          Invalid {label}
        </p>
      )}
    </div>
  );
}


export const PasswordInputTag = ({
  id,
  label,
  value = "",
  validators = [],
  styles = "",
  readonly = false,
  max,
  onChangeVal,
}) => {
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Memoized validation
  const isValid = useMemo(
    () => validate(value, validators),
    [value, validators]
  );

  const handleChange = (e) => {
    const newVal = e.target.value;
    const valid = validate(newVal, validators);
    onChangeVal(newVal, valid);
  };

  return (
    <div className="h-20">
      {/* Label */}
      <label
        htmlFor={id}
        className="block text-sm font-medium pl-2 mb-1 text-black/70"
      >
        {label}
      </label>

      {/* Outer border wrapper */}
      <div
        className={`
          w-full h-[2.4rem] border-2 rounded-xl flex items-center px-2 relative
          ${!isValid && touched ? "border-red-500" : "border-gray-500"}
        `}
      >
        {/* Input field */}
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          maxLength={max}
          readOnly={readonly}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          className={`
            flex-1 bg-transparent outline-none border-none h-full
            ${styles}
          `}
        />

        {/* Toggle visibility icon */}
        <div
          className="cursor-pointer absolute right-2 text-black"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
        </div>
      </div>

      {/* Validation Message */}
      {!isValid && touched && (
        <p className="text-red-500 text-xs mt-1 ml-1">
          Invalid {label}
        </p>
      )}
    </div>
  );
};


export const CheckBoxTag = ({
  id,
  label,
  checked = false,
  validators = [],
  disabled = false,
  onChangeVal,
  loading = false,
  styles = ""
}) => {
  const [touched, setTouched] = useState(false);

  const isValid = useMemo(
    () => validate(checked, validators),
    [checked, validators]
  );

  const handleChange = (e) => {
    const newVal = e.target.checked;
    const valid = validate(newVal, validators);
    onChangeVal?.(newVal, valid);
  };

  return (
    <div className="flex flex-col justify-center h-20  ">
      <label
        htmlFor={id}
        className="flex items-center gap-5 h-10 px-5 cursor-pointer text-sm font-medium text-black/70 bg-gray-100 rounded-xl shadow-md"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled || loading}
          onChange={handleChange}
          onBlur={() => !disabled && setTouched(true)}
          className={`
            h-4 w-4  border accent-blue-600
            ${!isValid && touched ? "border-red-500" : "border-gray-400"}
            accent-blue-600
            ${styles}
          `}
        />

        <span >{label}</span>

        {loading && (
          <span className="ml-1 h-3 w-3 border-2 border-blue-600 border-b-transparent rounded-full animate-spin" />
        )}
      </label>

      {!isValid && touched && (
        <span className="text-xs text-red-500 pl-6">
          Invalid selection
        </span>
      )}
    </div>
  );
};