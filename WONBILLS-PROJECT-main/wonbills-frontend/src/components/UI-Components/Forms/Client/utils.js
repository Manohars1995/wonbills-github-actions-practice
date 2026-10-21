import * as XLSX from "xlsx";
import { showToast } from "../../../UI-Elements/Toast";

export const importData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            if (!workbook.SheetNames.length) {
                showToast.error("Excel file is empty or has no sheets.");
                return;
            }

            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const sheetJson = XLSX.utils.sheet_to_json(worksheet);

            if (!sheetJson.length) {
                showToast.error("Excel sheet is empty.");
                return;
            }

            // required columns
            const requiredColumns = [
                "CLIENT NAME", "TRADING NAME", "REGISTRATION NUMBER", "EMAIL",
                "WORK NUMBER", "WORK NUMBER DIALCODE",
                "MOBILE NUMBER", "MOBILE NUMBER DIALCODE",
                "GST REFERENCE", "NOTES",
                "OFFICE ADDRESS FLAT NO", "OFFICE ADDRESS STREET NAME", "OFFICE ADDRESS ZIP CODE",
                "OFFICE ADDRESS CITY", "OFFICE ADDRESS PROVINCE", "OFFICE ADDRESS COUNTRY",
                "BILLING ADDRESS FLAT NO", "BILLING ADDRESS STREET NAME", "BILLING ADDRESS ZIP CODE",
                "BILLING ADDRESS CITY", "BILLING ADDRESS PROVINCE", "BILLING ADDRESS COUNTRY"
            ];

            // Get headers from the sheet
            const sheetHeaders = Object.keys(sheetJson[0] || {});

            // Check if required columns exist
            const missingColumns = requiredColumns.filter(col => !sheetHeaders.includes(col));

            if (missingColumns.length > 0) {
                showToast.error(`Missing required columns.`);
                event.target.value = "";
                return;
            }

            // Proceed with data formatting if validation passes
            const formattedData = sheetJson.map((row) => ({
                client_name: row["CLIENT NAME"] || "",
                trading_name: row["TRADING NAME"] || "",
                registration_number: row["REGISTRATION NUMBER"] || "",
                email: row["EMAIL"] || "",
                work_number: {
                    number: row["WORK NUMBER"] || "",
                    countryCode: row["WORK NUMBER DIALCODE"]?.split(" ")[0] || "",
                    dialCode: row["WORK NUMBER DIALCODE"]?.split(" ")[1] || "",
                },
                mobile_number: {
                    number: row["MOBILE NUMBER"] || "",
                    countryCode: row["MOBILE NUMBER DIALCODE"]?.split(" ")[0] || "",
                    dialCode: row["MOBILE NUMBER DIALCODE"]?.split(" ")[1] || "",
                },
                gst_reference: row["GST REFERENCE"] || "",
                date_of_birth: "",
                notes: row["NOTES"] || "",
                office_address: {
                    phone_number: {
                        number: row["WORK NUMBER"] || "",
                        countryCode: row["WORK NUMBER DIALCODE"]?.split(" ")[0] || "",
                        dialCode: row["WORK NUMBER DIALCODE"]?.split(" ")[1] || "",
                    },
                    flat_no: row["OFFICE ADDRESS FLAT NO"] || "",
                    street_name: row["OFFICE ADDRESS STREET NAME"] || "",
                    zip_code: row["OFFICE ADDRESS ZIP CODE"] || "",
                    city: row["OFFICE ADDRESS CITY"] || "",
                    province: row["OFFICE ADDRESS PROVINCE"] || "",
                    country: row["OFFICE ADDRESS COUNTRY"] || "",
                },
                billing_address: {
                    phone_number: {
                        number: row["MOBILE NUMBER"] || "",
                        countryCode: row["MOBILE NUMBER DIALCODE"]?.split(" ")[0] || "",
                        dialCode: row["MOBILE NUMBER DIALCODE"]?.split(" ")[1] || "",
                    },
                    flat_no: row["BILLING ADDRESS FLAT NO"] || "",
                    street_name: row["BILLING ADDRESS STREET NAME"] || "",
                    zip_code: row["BILLING ADDRESS ZIP CODE"] || "",
                    city: row["BILLING ADDRESS CITY"] || "",
                    province: row["BILLING ADDRESS PROVINCE"] || "",
                    country: row["BILLING ADDRESS COUNTRY"] || "",
                },
            }));

            uploadData(formattedData);
            event.target.value = "";
        };

        reader.readAsArrayBuffer(file);
    } catch (error) {
        console.error("Error processing file:", error);
        showToast.error("An error occurred while processing the file.");
    }
};

export const initialClientData = {
    _id: { value: '', isValid: true },
    custom_id: { value: '', isValid: true },
    client_name: { value: '', isValid: false },
    trading_name: { value: '', isValid: false },
    registration_number: { value: '', isValid: false },
    work_number: { value: '', isValid: false },
    mobile_number: { value: '', isValid: false },
    email: { value: '', isValid: false },
    gst_reference: { value: '', isValid: false },
    date_of_birth: { value: '', isValid: false },
    notes: { value: '', isValid: false },
    profile_picture: { value: '', isValid: true },
    'office_address': {
        flat_no: { value: '', isValid: false },
        street_name: { value: '', isValid: false },
        city: { value: '', isValid: false },
        zip_code: { value: '', isValid: false },
        country: { value: '', isValid: false },
        state: { value: '', isValid: false },
        phone: { value: '', isValid: false },
    },
    'billing_address': {
        flat_no: { value: '', isValid: false },
        street_name: { value: '', isValid: false },
        city: { value: '', isValid: false },
        zip_code: { value: '', isValid: false },
        country: { value: '', isValid: false },
        state: { value: '', isValid: false },
        phone: { value: '', isValid: false },
    },
    status: { value: true, isValid: true },
    same_as_ofc: { value: false, isValid: true },
}

export const updateNestedField = (obj, path, updater) => {
    const keys = Array.isArray(path) ? path : path.split(".");

    if (keys.length === 1) {
        return {
            ...obj,
            [keys[0]]: updater(obj[keys[0]])
        };
    }

    const [first, ...rest] = keys;

    return {
        ...obj,
        [first]: updateNestedField(obj[first], rest, updater)
    };
};


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

export const initialSortData = [{
    column: '',
    order: "asc" | "desc"
}]

export const columns = [
    { field: "custom_id", headerName: "Client ID", sort: true },
    { field: "client_name", headerName: "Client Name", sort: true },
    { field: "trading_name", headerName: "Trading Name", sort: true },
    { field: "work_number", headerName: "Work Number", sort: true },
    { field: "gst_reference", headerName: "GST Reference", sort: true },
];


export const mapClientApiToFormState = (apiData = {}) => {
    const safe = (v, valid = false) => ({
        value: v ?? "",
        isValid: true,
    });

    return {
        _id: safe(apiData._id, true),

        custom_id: safe(apiData.custom_id, true),

        client_name: safe(apiData.client_name),
        trading_name: safe(apiData.trading_name),
        registration_number: safe(apiData.registration_number),

        work_number: safe(apiData.work_number),
        mobile_number: safe(apiData.mobile_number),
        email: safe(apiData.email),

        gst_reference: safe(apiData.gst_reference),

        date_of_birth: safe(
            apiData.date_of_birth
                ? apiData.date_of_birth.split("T")[0]
                : ""
        ),

        notes: safe(apiData.notes),

        profile_picture: safe(apiData.profile_picture, true),

        office_address: {
            flat_no: safe(apiData.office_address?.flat_no),
            street_name: safe(apiData.office_address?.street_name),
            city: safe(apiData.office_address?.city),
            zip_code: safe(apiData.office_address?.zip_code),
            country: safe(apiData.office_address?.country),
            state: safe(apiData.office_address?.state),
            phone: safe(apiData.office_address?.phone),
        },

        billing_address: {
            flat_no: safe(apiData.billing_address?.flat_no),
            street_name: safe(apiData.billing_address?.street_name),
            city: safe(apiData.billing_address?.city),
            zip_code: safe(apiData.billing_address?.zip_code),
            country: safe(apiData.billing_address?.country),
            state: safe(apiData.billing_address?.state),
            phone: safe(apiData.billing_address?.phone),
        },

        status: {
            value: Boolean(apiData.status),
            isValid: true,
        },

        same_as_ofc: {
            value: Boolean(apiData.same_as_address),
            isValid: true,
        },
    };
};


export const normalizePhone = (value = "") =>
  value.toString().replace(/[^\d+]/g, "");