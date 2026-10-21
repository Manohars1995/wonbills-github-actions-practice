const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        custom_id: { type: String, default: null },
        vendor_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        invoice_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Invoice",
            required: true,
            index: true,
        },

        payment_due_date: { type: Date, default: null },
        notes: { type: String, default: null },

        client_name: { type: String, default: null },

        payment_state: {
            type: String,
            enum: ["received", "requested", "scheduled", "saved", "canceled"],
            default: "requested",
        },
        schedule_date: { type: Date, default: null },

        status: {
            type: String,
            enum: ["active", "inactive", "closed"],
            default: "active",
        },

        invoice_amount: { type: Number, default: 0 },

        mode_of_payment: {
            type: String,
            enum: ["cash", "online_payment", "cheque"],
            default: "cash",
        },

        payment_reference_number: { type: String, default: null },
        cheque_number: { type: Number, default: null },

        commission_by_customer: {
            type: Boolean,
            default: false,
        },

        transfer_id: { type: String, default: null },
        payment_link_id: { type: String, default: null },
        payment_number: { type: Number, default: null },
    },
    { timestamps: true }
);


const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
