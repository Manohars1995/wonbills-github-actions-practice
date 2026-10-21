const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    custom_id: { type: String, default: null },
    invoice_name: { type: String, required: true },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },

    due_date: { type: Date, default: null },
    valid_from: { type: Date, default: null },
    valid_until: { type: Date, default: null },

    quantity: { type: Number, default: 0 },

    include_taxation: {
      type: Boolean,
      default: true,
    },

    net_amount: { type: Number, default: 0 },
    taxation: { type: Number, default: 0 },
    total_tax_amount: { type: Number, default: 0 },
    gross_amount: { type: Number, default: 0 },

    invoice_state: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "initiated", "closed"],
      default: "active",
    },

    payment_status: {
      type: String,
      enum: ["pending", "declined", "requested", "received"],
      default: "pending",
    },

    invoice_notes: { type: String, default: null },

    items: {
      type: [
        {
          item_code: String,
          name: String,
          category: String,
          quantity: Number,
          unit_price: Number,
          tax: Number,
          discount: Number,
          final_price: Number,
          total: Number,
          in_stock: mongoose.Schema.Types.Mixed,
          item_id: mongoose.Schema.Types.ObjectId,
          isProduct: Boolean
        }
      ],
      default: []
    },


  },
  { timestamps: false }
);

const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice
