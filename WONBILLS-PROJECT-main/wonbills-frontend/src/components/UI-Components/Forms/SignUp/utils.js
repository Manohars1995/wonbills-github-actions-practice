
export const initialState = {
    first_name: { value: "", isValid: false },
    last_name: { value: "", isValid: false },
    phone: { value: "", isValid: false },
    email: { value: "", isValid: false },
    company_name: { value: "", isValid: false },
    company_reg_number: { value: "", isValid: false },
    company_tax_number: { value: "", isValid: false },
    company_type: { value: "", isValid: false },
    company_category: { value: "", isValid: false },
    company_subcategory: { value: "", isValid: false },
    country: { value: "", isValid: false },
    state: { value: "", isValid: false },
    city: { value: "", isValid: false },
    street: { value: "", isValid: false },
    postcode: { value: "", isValid: false },
    agreed_to_terms: { value: "", isValid: false }
}


export const BTN_CONTINUE =
    "bg-gray-900 text-white border-gray-900 \
   hover:bg-black \
   disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500";

export const BTN_SUBMIT =
    "bg-green-600 text-white border-green-600 \
   hover:bg-green-700 \
   disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500";


export const isFormValid = (formState, optionalFields = []) => {
    return Object.entries(formState).every(([key, field]) => {
        if (optionalFields.includes(key)) return true;
        return field?.isValid === true;
    });
};

export const extractFormValues = (formState, excludeFields = []) => {
    return Object.entries(formState).reduce((acc, [key, field]) => {
        if (excludeFields.includes(key)) return acc;
        acc[key] = field?.value ?? "";
        return acc;
    }, {});
};

export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
};
