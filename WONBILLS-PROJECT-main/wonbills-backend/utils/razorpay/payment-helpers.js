const User = require("../../models/users");
const Client = require("../../models/client");
const Payment = require("../../models/payment");
const Invoice = require("../../models/invoice");
const { PaymentReceivedEmailOffline } = require("../EmailUtils");
const { generateInvoicePDF1 } = require("../../pdfTemplates/pdfTemp1");
const mongoose = require("mongoose");

const getVendorAndClientDetails = async (vendorId, paymentId, session) => {
  /* ---------------- VENDOR ---------------- */
  const vendor = await User.findById(vendorId).session(session).lean();
  if (!vendor) throw new Error("Vendor not found");

  /* ---------------- PAYMENT ---------------- */
  const payment = await Payment.findOne({
    _id: paymentId,
    vendor_id: vendorId,
  })
    .session(session)
    .lean();

  if (!payment) throw new Error("Payment not found");

  /* ---------------- INVOICE ---------------- */
  const invoice = await Invoice.findOne({
    _id: payment.invoice_id,
    vendor_id: vendorId,
  })
    .session(session)
    .lean();

  if (!invoice) throw new Error("Invoice not found");

  /* ---------------- CLIENT ---------------- */
  const client = await Client.findById(invoice.client).session(session).lean();
  if (!client) throw new Error("Client not found");

  return {
    /* ---------- Vendor ---------- */
    vendor_email: vendor.email,
    vendor_contact: vendor.contact_number,
    razorpay_account_id: vendor.razorpay_account_id,
    company_details: vendor.company_details,
    currency_preference: vendor.currency_preference,

    /* ---------- Client ---------- */
    client_id: client._id,
    client_name: client.client_name,
    client_email: client.email,
    client_contact: client.mobile_number,
    address: client.billing_address,

    /* ---------- Payment ---------- */
    payment_id: payment._id,
    payment_due_date: payment.payment_due_date,
    custom_payment_id: payment.custom_id,

    /* ---------- Invoice ---------- */
    invoice_id: invoice._id,
    custom_invoice_id: invoice.custom_id,
    invoice_items: invoice.items,
  };
};

const fetchClientAndVendorDetails = async (purchaseOrderId) => {
  try {
    // Normalize ID
    const payment = await Payment.findById(purchaseOrderId)
      .populate({
        path: "invoice_id", // Should match field type (ObjectId referencing Invoice)
        model: "Invoice",
        populate: [
          {
            path: "client", // Client ObjectId
            model: "Client",
            select: "email client_name billing_address work_number",
          },
          {
            path: "vendor_id", // Vendor ObjectId
            model: "User",
            select:
              "company_details email currency_preference contact_number alerts",
          },
        ],
      })
      .lean();

    if (!payment || !payment.invoice_id) return null;

    const invoice = payment.invoice_id;
    const client = invoice.client;
    const vendor = invoice.vendor_id;

    return {
      client_id: client?._id || null,
      client_email: client?.email || null,
      client_name: client?.client_name || null,
      address: client?.billing_address || null,
      client_contact: client?.work_number || null,

      vendor_company_details: vendor?.company_details || null,
      vendor_email: vendor?.email || null,
      currency_preference: vendor?.currency_preference || "INR",
      vendor_contact_number: vendor?.contact_number || null,
      alert_status: vendor?.alerts || null,

      invoice_id: invoice._id || null,
      invoice_items: invoice.items || [],
    };
  } catch (error) {
    console.error("Error fetching client & vendor details:", error);
    return null;
  }
};

// prepare data structure for pdf attachment
const prepareInvoiceData = (payment, details) => {
  const {
    client_name,
    client_email,
    invoice_id,
    days_remaining,
    custom_invoice_id,
  } = payment;

  const { currency_preference = "INR", invoice_items, address } = details;

  const dateOnly = new Date().toISOString().split("T")[0];
  const totalAmount = invoice_items.reduce(
    (sum, item) => sum + parseFloat(item.quantity) * parseFloat(item.price),
    0,
  );
  const currencySymbol = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency_preference,
  }).format(totalAmount);

  return {
    invoicePdfData: {
      customerName: {
        name: client_name || "",
        address: address?.street_name || "",
        city: address?.city || "",
        email: client_email || "",
        phone: details.client_contact?.number || "",
      },
      invoice: {
        ID: custom_invoice_id || "",
        date: dateOnly || "",
      },
      items: invoice_items.map((item) => ({
        reference: item.custom_item_id,
        name: item.product_name,
        unitPrice: parseFloat(item.value),
        tax: parseFloat(item.taxation),
        discount: parseFloat(item.discount),
        finalPrice: parseFloat(item.price),
        quantity: parseInt(item.quantity, 10),
        total: parseFloat(item.quantity * item.price),
      })),
      grandTotal: currencySymbol || "",
      currencyType: currency_preference || "",
    },
    noOfDaysText:
      days_remaining === 0
        ? `This is a friendly reminder that your payment is due today.`
        : days_remaining === 1
          ? `This is a friendly reminder that your payment is due tomorrow.`
          : `This is a friendly reminder that your payment is due in ${days_remaining} days.`,
  };
};

const prepareInvoiceData2 = (clientDetails) => {
  if (!clientDetails) return null;

  const {
    client_name,
    client_email,
    address,
    client_contact,
    invoice_id,
    invoice_items,
    currency_preference,
  } = clientDetails;

  const dateOnly = new Date().toISOString().split("T")[0];
  const totalAmount = invoice_items.reduce(
    (sum, item) => sum + parseFloat(item.quantity) * parseFloat(item.price),
    0,
  );

  const currencySymbol = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency_preference || "INR",
  }).format(totalAmount);

  return {
    customerName: {
      name: client_name || "",
      address: address?.street_name || "",
      city: address?.city || "",
      email: client_email || "",
      phone: client_contact?.number || "",
    },
    invoice: {
      ID: invoice_id || "",
      date: dateOnly || "",
    },
    items:
      invoice_items.map((item) => ({
        reference: item?.product_id,
        name: item?.product_name,
        unitPrice: parseFloat(item?.value),
        tax: parseFloat(item?.taxation),
        discount: parseFloat(item?.discount),
        finalPrice: parseFloat(item?.price),
        quantity: parseInt(item?.quantity, 10),
        total: parseFloat(item?.quantity * item?.price),
      })) || [],
    grandTotal: currencySymbol,
    currencyType: currency_preference || "₹",
  };
};

const updateClientOffline = async (PurchaseOrderID, amount) => {
  try {
    const clientDetails = await fetchClientAndVendorDetails(PurchaseOrderID);
    if (!clientDetails) {
      console.error("No data found for the given PurchaseOrderID");
      return;
    }

    const {
      client_email,
      client_name,
      vendor_company_details,
      vendor_email,
      invoice_id,
      currency_preference,
      vendor_contact_number,
      alert_status,
    } = clientDetails;

    if (!alert_status) {
      return;
    }

    const invoiceData = prepareInvoiceData2(clientDetails);
    if (!invoiceData) {
      console.error("Error preparing invoice data.");
      return;
    }

    const outputPath = await generateInvoicePDF1(invoiceData);

    // SEND EMAIL TO THE CLIENT
    await PaymentReceivedEmailOffline(
      client_email,
      client_name,
      PurchaseOrderID,
      amount,
      vendor_company_details,
      invoice_id,
      vendor_contact_number,
      vendor_email,
      currency_preference,
      outputPath,
    );
  } catch (error) {
    console.error("Error updating client:", error);
  }
};

module.exports = {
  getVendorAndClientDetails,
  fetchClientAndVendorDetails,
  prepareInvoiceData,
  prepareInvoiceData2,
  updateClientOffline,
};
