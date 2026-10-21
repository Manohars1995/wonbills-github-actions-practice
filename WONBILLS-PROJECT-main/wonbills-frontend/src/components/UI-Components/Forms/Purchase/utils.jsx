import { FaMoneyBillWave } from "react-icons/fa";
import { HiOutlineDocumentText } from "react-icons/hi";
import { BsCreditCard2Front } from "react-icons/bs";

export const columns = [
    { field: "custom_id", headerName: "Purchase ID", sort: true },
    { field: "custom_invoice_id", headerName: "Invoice ID", sort: true },
    { field: "payment_due_date", headerName: "Due Date", sort: true, type: "date" },
    { field: "payment_state", headerName: "Purchase State", sort: false },
    { field: "mode_of_payment", headerName: "Mode Of Payment", sort: false },
];


export const initialPurchaseState = {
    _id: { value: "", isValid: false },
    custom_id: { value: "", isValid: false },
    invoice_id: { value: "", isValid: false },
    payment_due_date: { value: "", isValid: false },
    payment_state: { value: "requested", isValid: true },
    schedule_date: { value: "", isValid: false },
    status: { value: "active", isValid: true },
    notes: { value: "", isValid: false },
    invoice_amount: { value: "", isValid: false },
    mode_of_payment: { value: "online_payment", isValid: true },
    cheque_number: { value: "", isValid: false },
    commission_by_customer: { value: false, isValid: true },
    client_name: { value: '', isValid: false },
    payment_reference_number: { value: '', isValid: false },

}

export const paymentModeOptions = [
    {
        value: "cash",
        label: (
            <div className="flex items-center gap-2">
                <span className="text-green-600 bg-green-200 p-1.5 rounded-full">
                    <FaMoneyBillWave />
                </span>
                <span>Cash</span>
            </div>
        )
    },
    {
        value: "cheque",
        label: (
            <div className="flex items-center gap-2">
                <span className="text-blue-600 bg-blue-200 p-1.5 rounded-full">
                    <HiOutlineDocumentText />
                </span>
                <span>Cheque</span>
            </div>
        )
    },
    {
        value: "online_payment",
        label: (
            <div className="flex items-center gap-2">
                <span className="text-purple-600 bg-purple-200 p-1.5 rounded-full">
                    <BsCreditCard2Front />
                </span>
                <span>Online</span>
            </div>
        )
    }
];

export const mapInvoiceLiteListApiToFormState = (apiData = []) => {
    if (!Array.isArray(apiData)) return [];

    return apiData.map((invoice) =>
        mapInvoiceLiteApiToFormState(invoice)
    );
};


export const mapInvoiceLiteApiToFormState = (apiData = {}) => {
    const safe = (v) => v ?? "";

    return {
        _id: safe(apiData._id),
        custom_id: safe(apiData.custom_id),
        gross_amount: safe(apiData.gross_amount),
        client:
            typeof apiData.client === "object"
                ? apiData.client._id
                : apiData.client,
        client_name:
            typeof apiData.client === "object"
                ? apiData.client.client_name
                : "",
    };
};


export const formatNumToCurrency = (num) => {
    if (!num) return "0.00"; // Handle falsy values like null or undefined

    // Format number with grouping separators and two decimal points
    return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
};

export const isFormValid = (
    formState,
    optionalFields = [],
    conditionalRules = []
) => {
    const invalidFields = [];

    const isFieldRequiredByCondition = (path) => {
        for (const rule of conditionalRules) {
            if (rule.field === path) {
                const dependentValue =
                    formState?.[rule.dependsOn]?.value;

                if (rule.when(dependentValue)) {
                    return true; // required
                }
            }
        }
        return false;
    };

    const walk = (obj, parentPath = "") => {
        Object.entries(obj).forEach(([key, value]) => {
            const path = parentPath ? `${parentPath}.${key}` : key;

            const isOptional =
                optionalFields.includes(path) &&
                !isFieldRequiredByCondition(path);

            if (isOptional) return;

            // Leaf node
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


export const extractPayFormValues = (formState, excludeFields = []) => {
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

export const mapPaymentApiToFormState = (apiData = {}) => {
    const safe = (v, valid = false) => ({
        value: v ?? "",
        isValid: valid || v !== undefined,
    });

    return {
        _id: safe(apiData._id, true),

        // 🔒 Preserve custom_id exactly (e.g., PAY-12345678)
        custom_id: safe(apiData.custom_id, true),

        // Invoice reference (can be id or populated object)
        invoice_id: safe(
            typeof apiData.invoice_id === "object"
                ? apiData.invoice_id?._id
                : apiData.invoice_id
        ),

        custom_inv_id: safe(
            typeof apiData.invoice_id === "object"
                ? apiData.invoice_id?.custom_id
                : apiData.invoice_id
        ),

        payment_due_date: safe(
            apiData.payment_due_date
                ? apiData.payment_due_date.split("T")[0]
                : ""
        ),

        payment_state: {
            value: apiData.payment_state ?? "requested",
            isValid: true,
        },

        schedule_date: safe(
            apiData.schedule_date
                ? apiData.schedule_date.split("T")[0]
                : ""
        ),

        status: {
            value:
                typeof apiData.status === "string"
                    ? apiData.status
                    : "active",
            isValid: true,
        },

        notes: safe(apiData.notes),

        invoice_amount: safe(apiData.invoice_amount ?? ""),

        mode_of_payment: {
            //  normalize display value only, not IDs
            value: apiData.mode_of_payment ?? "online_payment",
            isValid: true,
        },

        cheque_number: safe(apiData.cheque_number),

        commission_by_customer: {
            value: Boolean(apiData.commission_by_customer),
            isValid: true,
        },

        client_name: safe(apiData.client_name),

        payment_reference_number: safe(apiData.payment_reference_number),
    };
};



