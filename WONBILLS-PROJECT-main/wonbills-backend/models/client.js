const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
    {
        custom_id: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        vendor_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        client_name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            default: null,
            lowercase: true,
            trim: true,
        },

        work_number: { type: Object, default: null },
        mobile_number: { type: Object, default: null },

        billing_address: { type: Object, default: null },
        office_address: { type: Object, default: null },

        trading_name: { type: String, default: null },
        registration_number: { type: String, default: null },
        gst_reference: { type: String, default: null },

        date_of_birth: { type: Date, default: null },
        profile_picture: { type: Object, default: null },

        state: { type: String, default: null },
        country: { type: String, default: null },

        notes: { type: String, default: null },

        same_as_address: {
            type: Boolean,
            default: false,
        },

        status: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Client = mongoose.model("Client", clientSchema);
module.exports = Client
