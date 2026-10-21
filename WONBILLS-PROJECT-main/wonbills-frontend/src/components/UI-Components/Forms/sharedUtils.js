export const extractFormValues = (formState, excludeFields = []) => {
    const extract = (obj, parentPath = "") => {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            const path = parentPath ? `${parentPath}.${key}` : key;

            // Skip excluded fields (supports nested paths)
            if (excludeFields.includes(path)) return acc;

            // Leaf node → { value, isValid }
            if (
                value &&
                typeof value === "object" &&
                "value" in value &&
                "isValid" in value
            ) {
                acc[key] = value.value ?? "";
                return acc;
            }

            // Nested object (office_address, billing_address)
            if (value && typeof value === "object") {
                acc[key] = extract(value, path);
                return acc;
            }

            return acc;
        }, {});
    };

    return extract(formState);
};

export const isFormValid = (formState, optionalFields = []) => {
    const invalidFields = [];

    const walk = (obj, parentPath = "") => {
        Object.entries(obj).forEach(([key, value]) => {
            const path = parentPath ? `${parentPath}.${key}` : key;

            // Skip optional fields (supports nested paths)
            if (optionalFields.includes(path)) return;

            // Leaf field: { value, isValid }
            if (
                value &&
                typeof value === "object" &&
                "isValid" in value
            ) {
                if (value.isValid !== true) {
                    invalidFields.push(path);
                }
                return;
            }

            // Nested object (office_address, billing_address)
            if (value && typeof value === "object") {
                walk(value, path);
            }
        });
    };

    walk(formState);

    return {
        isValid: invalidFields.length === 0,
        invalidFields
    };
};