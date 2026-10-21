// Validator type strings
export const VALIDATOR_TYPE_REQUIRE = "REQUIRE";
export const VALIDATOR_TYPE_MINLENGTH = "MINLENGTH";
export const VALIDATOR_TYPE_MAXLENGTH = "MAXLENGTH";
export const VALIDATOR_TYPE_MIN = "MIN";
export const VALIDATOR_TYPE_MAX = "MAX";
export const VALIDATOR_TYPE_EMAIL = "EMAIL";
export const VALIDATOR_TYPE_IFSC = "IFSC";

// Validator factory functions
export const VALIDATOR_REQUIRE = () => ({ type: VALIDATOR_TYPE_REQUIRE });
export const VALIDATOR_MINLENGTH = (val) => ({ type: VALIDATOR_TYPE_MINLENGTH, val });
export const VALIDATOR_MAXLENGTH = (val) => ({ type: VALIDATOR_TYPE_MAXLENGTH, val });
export const VALIDATOR_MIN = (val) => ({ type: VALIDATOR_TYPE_MIN, val });
export const VALIDATOR_MAX = (val) => ({ type: VALIDATOR_TYPE_MAX, val });
export const VALIDATOR_EMAIL = () => ({ type: VALIDATOR_TYPE_EMAIL });
export const VALIDATOR_IFSC = () => ({ type: VALIDATOR_TYPE_IFSC });

// Validation function
export const validate = (value, validators) => {
  let isValid = true;

  for (const validator of validators) {
    switch (validator.type) {
      case VALIDATOR_TYPE_REQUIRE:
        isValid =
          isValid &&
          typeof value === "string" &&
          value.trim().length > 0;
        break;

      case VALIDATOR_TYPE_MINLENGTH:
        isValid =
          isValid &&
          typeof value === "string" &&
          value.trim().length >= validator.val;
        break;

      case VALIDATOR_TYPE_MAXLENGTH:
        isValid =
          isValid &&
          typeof value === "string" &&
          value.trim().length <= validator.val;
        break;

      case VALIDATOR_TYPE_MIN:
        isValid = isValid && !isNaN(+value) && +value >= validator.val;
        break;

      case VALIDATOR_TYPE_MAX:
        isValid = isValid && !isNaN(+value) && +value <= validator.val;
        break;

      case VALIDATOR_TYPE_EMAIL:
        isValid =
          isValid &&
          typeof value === "string" &&
          /^\S+@\S+\.\S+$/.test(value);
        break;

      case VALIDATOR_TYPE_IFSC:
        isValid =
          isValid &&
          typeof value === "string" &&
          /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.trim());
        break;

      default:
        break;
    }
  }

  return isValid;
};
