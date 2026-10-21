const mongoose = require("mongoose");

const CompanyAddressSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      trim: true,
      uppercase: true,
    },
    state: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    currentPlan: {
      type: String,
      default: null,
    },
    postcode: {
      type: String,
      trim: true,
    },
    street: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const CompanyDetailsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },

    registration_number: {
      type: String,
      trim: true,
      default: null,
    },

    tax_number: {
      type: String,
      trim: true,
      default: null,
    },

    type: {
      type: String,
      enum: [
        "llp",
        "ngo",
        "other",
        "individual",
        "partnership",
        "proprietorship",
        "public_limited",
        "private_limited",
        "trust_society",
        "not_yet_registered",
        "educational_institutes",
      ],
      default: null,
    },

    category: {
      type: String,
      trim: true,
      default: null,
    },

    subcategory: {
      type: String,
      trim: true,
      default: null,
    },

    address: CompanyAddressSchema,
  },
  { _id: false },
);

const UserSchema = new mongoose.Schema(
  {
    // ----------------------------------------
    // BASIC IDENTIFICATION
    // ----------------------------------------
    custom_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    first_name: {
      type: String,
      trim: true,
    },

    last_name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    user_type: {
      type: String,
      enum: ["user", "superAdmin", "admin"],
      default: "user",
    },

    // ----------------------------------------
    // CONTACT DETAILS
    // ----------------------------------------
    contact_number: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // ----------------------------------------
    // MEDIA
    // ----------------------------------------
    company_logo: { type: String, default: null },
    profile_picture: { type: String, default: null },
    signature: { type: String, default: null },

    // ----------------------------------------
    // PREFERENCES
    // ----------------------------------------
    alerts: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },
    subscription_cancelled_at_cycle_end: { type: Boolean, default: false },
    razorpaySubscriptionId: { type: String, default: null },

    currency_preference: {
      type: String,
      default: "INR",
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    selected_invoice: {
      type: Number,
      default: 1,
    },

    agreed_to_terms: {
      type: Boolean,
      default: true,
    },

    // ----------------------------------------
    // ONBOARDING / INTRO
    // ----------------------------------------
    // true  -> new user, hasn't seen the intro/onboarding slides yet
    // false -> user has already viewed the intro, skip straight to home
    intro: {
      type: Boolean,
      default: true,
    },

    // ----------------------------------------
    // BUSINESS DETAILS
    // ----------------------------------------
    company_details: { type: CompanyDetailsSchema, default: null },
    dashboard_json: mongoose.Schema.Types.Mixed,
    bank_details: {
      type: new mongoose.Schema(
        {
          account_number: String,
          account_holder_name: String,
          ifsc_code: String,
        },
        { _id: false },
      ),
      default: null,
    },

    status: {
      type: Boolean,
      default: true,
    },

    // ----------------------------------------
    // RAZORPAY / PAYMENTS
    // ----------------------------------------
    razorpay_account_id: String,
    razorpay_stakeholder_id: String,
    fund_account_id: String,
    razorpay_product_id: String,
    pan_card: {
      type: String,
      uppercase: true,
      match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    },

    razorpay_account_status: {
      type: String,
      enum: [
        "activated",
        "needs_clarification",
        "under_review",
        "rejected",
        "failed",
      ],
      default: "failed",
    },

    // ----------------------------------------
    // MFA / LOGIN SECURITY
    // ----------------------------------------
    is_mfa_enabled: {
      type: Boolean,
      default: false,
    },

    login_count: {
      type: Number,
      default: 0,
    },

    mfa_type: {
      type: String,
      enum: ["otp", "passkey", "none"],
      default: "none",
    },

    passkey: String,

    country: String,

    national_id: {
      type: String,
      default: null,
    },

    // ----------------------------------------
    // SUBSCRIPTION (FINAL & CORRECT)
    // ----------------------------------------
    subscription_details: {
      provider: String,
      subscription_id: String,
      order_id: String,
      payment_id: String,
      auto_renew: Boolean,
    },

    free_trial: {
      type: Boolean,
      default: true,
    },

    trial_expiry: {
      type: Date,
      default: null,
    },

    is_subscribed: {
      type: Boolean,
      default: false,
    },

    subscription_expiry: {
      type: Date,
      default: null,
    },

    current_plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },

    plan_interval: {
      type: String,
      enum: ["monthly", "yearly"],
      default: null,
    },

    plan_started_at: {
      type: Date,
      default: null,
    },

    subscription_status: {
      type: String,
      enum: ["trial", "active", "expired", "free"],
      default: "free",
    },
  },
  {
    timestamps: true,
  },
);

// ----------------------------------------
// INDEXES
// ----------------------------------------
// UserSchema.index({ email: 1 }, { unique: true, sparse: true });
// UserSchema.index({ contact_number: 1 }, { unique: true, sparse: true });
UserSchema.index({ trial_expiry: 1 });
UserSchema.index({ subscription_expiry: 1 });

const User = mongoose.model("User", UserSchema);
module.exports = User;