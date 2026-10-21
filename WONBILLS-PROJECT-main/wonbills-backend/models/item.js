const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
    {
        custom_id: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        item_name: { type: String, required: true },
        category: { type: String, default: null },
        description: { type: String, default: null },

        valid_from: { type: Date, default: null },
        valid_until: { type: Date, default: null },

        serial_number: { type: String, default: null },

        value: { type: Number, default: 0 },
        total_stock: { type: Number, default: 0 },
        in_stock: { type: Number, default: 0 },

        discount: { type: Number, default: 0 },
        taxation: { type: Number, default: 0 },
        discount_amount: { type: Number, default: 0 },
        tax_amount: { type: Number, default: 0 },

        price: { type: Number, default: 0 },

        notes: { type: String, default: null },

        image: { type: Object, default: null },

        status: {
            type: Boolean,
            default: true,
        },

        item_number: { type: Number, default: null },
        vendor_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    },
    { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);
module.exports = Item;
