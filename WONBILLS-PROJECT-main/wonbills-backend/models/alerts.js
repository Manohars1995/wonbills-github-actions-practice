const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
    {
        alert_text: {
            type: String,
            required: true,
            maxlength: 300,
        },

        reference_table: {
            type: String,
            maxlength: 50,
        },

        vendor_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // createdAt & updatedAt
    }
);

const Alert = mongoose.model("Alert", alertSchema);
module.exports = Alert;
