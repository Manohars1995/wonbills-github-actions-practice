import { FiBox, FiTool, FiCreditCard } from "react-icons/fi";

export const categoryOptions = [
    {
        value: "product",
        label: (
            <div className="flex items-center gap-x-2 text-blue-600">
                <span className="p-1 rounded-full bg-gray-200 text-lg ">
                    <FiBox />
                </span>
                <span>Product</span>
            </div>
        ),
    },
    {
        value: "expense",
        label: (
            <div className="flex items-center gap-x-2 text-red-600">
                <span className="p-1 rounded-full bg-gray-200 text-lg ">
                    <FiCreditCard />
                </span>
                <span>Expense</span>
            </div>
        ),
    },
    {
        value: "service",
        label: (
            <div className="flex items-center gap-x-2 text-green-600">
                <span className="p-1 rounded-full bg-gray-200 text-lg ">
                    <FiTool size={16} />
                </span>
                <span>Service</span>
            </div>
        ),
    },
];

export const initialItemData = {
    _id: { value: '', isValid: false },
    custom_id: { value: '', isValid: false },
    item_name: { value: '', isValid: false },
    category: { value: '', isValid: false },
    serial_no: { value: '', isValid: false },
    total_stock: { value: 0, isValid: true },
    in_stock: { value: 0, isValid: true },
    value: { value: 0, isValid: true },
    taxation: { value: 0, isValid: true },
    discount: { value: 0, isValid: true },
    price: { value: 0, isValid: true },
    valid_from: { value: '', isValid: false },
    valid_until: { value: '', isValid: false },
    description: { value: '', isValid: false },
    notes: { value: '', isValid: false },
    image: { value: '', isValid: false },
    tax_amount: { value: 0, isValid: true },
    discount_amount: { value: 0, isValid: true },
    status: { value: true, isValid: true },
}

export const columns = [
    { field: "custom_id", headerName: "ID", sort: true },
    { field: "item_name", headerName: "Name", sort: true },
    { field: "category", headerName: "Category", sort: true },
    { field: "taxation", headerName: "Tax", sort: true },
    { field: "total_stock", headerName: "Total Stock", sort: true },
    { field: "in_stock", headerName: "In Stock", sort: true },
    { field: "price", headerName: "Price", sort: true },
];

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

export const mapItemApiToFormState = (apiData = {}) => {
    const safe = (v, valid = false) => ({
        value: v ?? "",
        isValid: valid || v !== undefined,
    });

    return {
        _id: safe(apiData._id, true),

        custom_id: safe(apiData.custom_id, true),

        item_name: safe(apiData.item_name),

        category: safe(apiData.category),

        serial_no: safe(apiData.serial_number),

        total_stock: {
            value: apiData.total_stock === null ? "" : apiData.total_stock,
            isValid: true,
        },

        in_stock: {
            value: apiData.in_stock === null ? "" : apiData.in_stock,
            isValid: true,
        },

        value: safe(apiData.value),

        taxation: safe(apiData.taxation),

        discount: safe(apiData.discount),

        price: safe(apiData.price, true),

        valid_from: safe(
            apiData.valid_from
                ? apiData.valid_from.split("T")[0]
                : ""
        ),

        valid_until: safe(
            apiData.valid_until
                ? apiData.valid_until.split("T")[0]
                : ""
        ),

        description: safe(apiData.description),

        notes: safe(apiData.notes),

        image: safe(apiData.image, true),

        tax_amount: safe(apiData.tax_amount, true),

        discount_amount: safe(apiData.discount_amount, true),

        status: {
            value: Boolean(apiData.status),
            isValid: true,
        },
    };
};

// Pricing helper
export const parseFloatSafe = (num) => {
    const parsed = parseFloat(num);
    return Number.isFinite(parsed) ? parsed : 0;
};

export const calculateItemPricing = ({ value, discount, taxation }) => {
    const originalPrice = parseFloatSafe(value);
    const discountPct = parseFloatSafe(discount);
    const taxPct = parseFloatSafe(taxation);

    const taxAmount = +(originalPrice * (taxPct / 100)).toFixed(2);
    const totalWithTax = +(originalPrice + taxAmount).toFixed(2);

    const discountAmount = +(totalWithTax * (discountPct / 100)).toFixed(2);
    const finalPrice = +(totalWithTax - discountAmount).toFixed(2);

    return {
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        price: finalPrice
    };
};


// Normalize Excel headers → snake_case
export const normalizeKeys = (obj = {}) =>
    Object.keys(obj).reduce((acc, key) => {
        acc[key.toLowerCase().replace(/\s+/g, "_")] = obj[key];
        return acc;
    }, {});

// Convert Excel date or ISO string → YYYY-MM-DD
export const convertExcelDate = (excelDate) => {
    if (!excelDate) return null;

    if (!isNaN(excelDate)) {
        const date = new Date((excelDate - 25569) * 86400000);
        return date.toISOString().split("T")[0];
    }

    if (typeof excelDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(excelDate)) {
        return excelDate;
    }

    return null;
};

export const readFileAsBinary = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsBinaryString(file);
    });

export const resetFileInput = (event) => {
    if (event?.target) event.target.value = "";
};
