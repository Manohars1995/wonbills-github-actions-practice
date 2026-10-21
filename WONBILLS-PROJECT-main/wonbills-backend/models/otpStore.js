const mongoose = require("mongoose");


const OtpStoreSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true }, // email or phone
    type: { type: String, enum: ["phone", "email"], required: true },

    otp_obj: {
      otp: Number,
      expiry: Number,
      active: Boolean,
      attempts: { type: Number, default: 0 }
    },

    verified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// compound unique index
OtpStoreSchema.index({ identifier: 1, type: 1 }, { unique: true });


module.exports = mongoose.model("OtpStore", OtpStoreSchema);
