const safe = (v, valid = false) => ({
    value: v ?? "",
    isValid: true,
});

export const safeBank = (value) => ({
    value: value ?? "",
    isValid:
        value !== null &&
        value !== undefined &&
        String(value).trim().length > 0
});


export const mapProfileApiToFormState = (apiData = {}) => {
    return {
        custom_id: safe(apiData.custom_id),
        first_name: safe(apiData.first_name),
        last_name: safe(apiData.last_name),
        contact_number: safe(apiData.contact_number),
        email: safe(apiData.email),

        national_id: safeBank(apiData.work_number),
        profile_picture: safe(apiData.profile_picture)
    };
};

export const mapBusinessProfileApiToFormState = (apiData = {}) => {
    return {
        name: safe(apiData.name),
        registration_number: safe(apiData.registration_number),
        tax_number: safe(apiData.tax_number),
        type: safe(apiData.type),
        category: safe(apiData.category),
        subcategory: safe(apiData.subcategory),
        address: {
            country: safe(apiData.address.country),
            state: safe(apiData.address.state),
            city: safe(apiData.address.city),
            postcode: safe(apiData.address.postcode),
        },
        company_logo: safe(apiData.company_logo),
        signature: safe(apiData.signature),
    };
};

export const mapKycApiToFormState = (apiData = {}) => {
    return {
        account_holder_name: safeBank(apiData.account_holder_name),
        account_number: safeBank(apiData.account_number),
        ifsc_code: safeBank(apiData.ifsc_code),
        razorpay_account_status: safe(apiData.razorpay_account_status)
    };
};

export const updateNestedField = (obj, path, updater) => {
    const keys = Array.isArray(path) ? path : path.split(".");
    const current = obj ?? {};

    if (keys.length === 1) {
        return {
            ...current,
            [keys[0]]: updater(current[keys[0]])
        };
    }

    const [first, ...rest] = keys;

    return {
        ...current,
        [first]: updateNestedField(current[first], rest, updater)
    };
};



export const KYC_STATUS_CONFIG = {
  activated: {
    label: "Activated",
    className: "text-green-700 bg-green-100 border-green-300",
  },
  under_review: {
    label: "Under Review",
    className: "text-blue-700 bg-blue-100 border-blue-300",
  },
  needs_clarification: {
    label: "Needs Clarification",
    className: "text-yellow-800 bg-yellow-100 border-yellow-300",
  },
  rejected: {
    label: "Rejected",
    className: "text-red-700 bg-red-100 border-red-300",
  },
  failed: {
    label: "Failed",
    className: "text-gray-700 bg-gray-100 border-gray-300",
  },
};
