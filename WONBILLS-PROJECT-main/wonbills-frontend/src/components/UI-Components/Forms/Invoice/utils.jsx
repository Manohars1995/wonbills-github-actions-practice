import { FiBox, FiCreditCard, FiTool } from "react-icons/fi";

export const itemStructure = [
  {
    price: '', total: '', value: '', category: '', discount: '', in_stock: '', quantity: '',
    taxation: '', item_id: '', tax_amount: '', valid_from: '', valid_until: '',
    total_stock: '', item_name: '', serial_no: '', discount_amount: ''
  }
]

export const initialInvoiceState = {
  _id: { value: "", isValid: false },
  custom_id: { value: "", isValid: false },
  invoice_name: { value: "", isValid: false },
  client: { value: "", isValid: false },
  due_date: { value: "", isValid: false },
  valid_from: { value: "", isValid: false },
  valid_until: { value: "", isValid: false },
  items: { value: [], isValid: false },
  net_amount: { value: 0, isValid: false },
  gross_amount: { value: 0, isValid: false },
  total_tax_amount: { value: 0, isValid: false },
  quantity: { value: 0, isValid: false },
  status: { value: 'active', isValid: true },
}


export const columns = [
  { field: "custom_id", headerName: "Invoice ID", sort: true },
  { field: "invoice_name", headerName: "Invoice Name", sort: true },
  { field: "client_custom_id", headerName: "Client", sort: true },
  { field: "quantity", headerName: "Quantity", sort: true },
  { field: "gross_amount", headerName: "Gross Amount", sort: true },
];

export const mapApiItemsToInvoiceItems = (apiItems = []) => {
  if (!Array.isArray(apiItems)) return [];

  return apiItems.map((item) => {
    const isProduct = item.category === "product";

    const unitPrice = Number(item.value) || 0;
    const taxPercent = Number(item.taxation) || 0;
    const discountPercent = Number(item.discount) || 0;

    // Base final price for quantity = 1
    const taxAmount = (unitPrice * taxPercent) / 100;
    const priceWithTax = unitPrice + taxAmount;
    const discountAmount = (priceWithTax * discountPercent) / 100;
    const finalPrice = Number((priceWithTax - discountAmount).toFixed(2));

    return {
      id: item.custom_id,                 // stable identifier
      name: item.item_name,

      category: item.category,

      in_stock: isProduct
        ? Number(item.in_stock) || 0
        : "-",                             // non-products

      unit_price: unitPrice,
      tax: taxPercent,
      discount: discountPercent,

      quantity: 0,                        // default invoice quantity
      final_price: finalPrice,
      total: 0,

      // Optional: keep raw reference if needed later
      _meta: {
        item_id: item._id,
        isProduct,
      },
    };
  });
};

export const getCategoryUI = (category) => {
  switch (category) {
    case "product":
      return {
        Icon: FiBox,
        className: "text-blue-600"
      };
    case "expense":
      return {
        Icon: FiCreditCard,
        className: "text-red-600"
      };
    case "service":
      return {
        Icon: FiTool,
        className: "text-green-600"
      };
    default:
      return {
        Icon: null,
        className: "text-gray-600"
      };
  }
};


export const calculateTotals = (items) => {
  const gross = items.reduce((sum, i) => sum + (i.final_price * i.quantity), 0);
  const net = items.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0);
  const tax = gross - net;
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  return {
    gross: Number(gross.toFixed(2)),
    net: Number(net.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    qty: totalQty
  };
};


export const mapInvoiceApiToFormState = (apiData = {}) => {
  const safe = (v, valid = false) => ({
    value: v ?? "",
    isValid: valid || v !== undefined,
  });

  // 🔑 Normalize items from the DB to match the Frontend UI format
  const mappedItems = (apiData.items || []).map(item => ({
    ...item,
    id: item.item_code, // Sync DB 'item_code' to UI 'id'
    _meta: {
      item_id: item.item_id,
      isProduct: item.isProduct
    }
  }));

  return {
    _id: safe(apiData._id, true),
    custom_id: safe(apiData.custom_id, true),
    invoice_name: safe(apiData.invoice_name),
    client: safe(typeof apiData.client === "object" ? apiData.client._id : apiData.client),
    due_date: safe(apiData.due_date ? apiData.due_date.split("T")[0] : ""),
    valid_from: safe(apiData.valid_from ? apiData.valid_from.split("T")[0] : ""),
    valid_until: safe(apiData.valid_until ? apiData.valid_until.split("T")[0] : ""),
    items: {
      value: mappedItems, // Use the mapped items here
      isValid: mappedItems.length > 0,
    },
    net_amount: safe(apiData.net_amount ?? 0, true),
    gross_amount: safe(apiData.gross_amount ?? 0, true),
    total_tax_amount: safe(apiData.total_tax_amount ?? 0, true),
    quantity: safe(apiData.quantity ?? 0, true),
    status: {
      value: typeof apiData.status === "string" ? apiData.status : Boolean(apiData.status),
      isValid: true,
    },
  };
};