const mongoose = require("mongoose");

const subscriptionPaymentSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
      maxlength: 150,
      index: true // for lookups & verification
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 1 // prevent invalid zero/negative amounts
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true
    }
  },
  {
    timestamps: true
  }
);

const SubscriptionPayment = mongoose.model("SubscriptionPayment", subscriptionPaymentSchema);
module.exports = SubscriptionPayment
