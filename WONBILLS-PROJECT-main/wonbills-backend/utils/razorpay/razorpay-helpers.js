const axios = require("axios");
const Razorpay = require("razorpay");
const User = require("../../models/users");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

const normalizeRazorpayStatus = (status) => {
  switch (status) {
    case "activated":
    case "needs_clarification":
    case "under_review":
    case "rejected":
      return status;
    default:
      return "failed";
  }
};

const normalizePhone = (phone) => {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, "");

  // Remove country code if present (India +91)
  if (digits.length > 11 && digits.startsWith("91")) {
    return digits.slice(-10);
  }

  if (digits.length >= 8 && digits.length <= 11) {
    return digits;
  }

  return null;
};

const validateStreet = (street) => {
  if (street == null) {
    throw new Error("Street address is required for Razorpay KYC");
  }

  const normalized = String(street).trim();

  if (!normalized) {
    throw new Error("Street address is required for Razorpay KYC");
  }

  if (normalized.length < 10 || normalized.length > 255) {
    throw new Error(
      "Street address must be between 10 and 255 characters for Razorpay KYC",
    );
  }

  return normalized;
};

const clean = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([_, v]) => v !== undefined && v !== null && v !== "",
    ),
  );

// FUNCTION TO DISABLE PAYMENT LINK THAT IS SENT TO THE CLIENT
const disablePaymentLink = async (paymentLinkId) => {
  try {
    return await razorpay.paymentLink.cancel(paymentLinkId);
  } catch (error) {
    console.error(
      "Razorpay cancel failed:",
      error?.error?.description || error?.message || error,
    );

    //  DO NOT THROW
    return null;
  }
};

// FUNCTION TO CREATE ORDER IN RAZORPAY TO TRANSFER THE AMOUNT, AFTER PAYMENT IS SUCCESSFUL
const createOrdertoTransferAmount = async (
  linkedAccountId,
  amount,
  AmountToTransfer,
  currency,
  PurchaseOrderID,
  paymentId,
) => {
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: currency,
      transfers: [
        {
          account: linkedAccountId,
          amount: Math.round(AmountToTransfer * 100),
          currency: currency,
          notes: {
            purchaseID: PurchaseOrderID,
            paymentID: paymentId,
            app: "WON_BILLS",
          },
          on_hold: 0,
        },
      ],
    });

    return order; // paymentLink object is returned
  } catch (error) {
    console.error("Error creating payment link:", error);
    throw new Error("Failed to create payment link");
  }
};

// Map business type → stakeholder relationship (Razorpay rule)
const mapRelationship = (type) => {
  switch ((type || "").toLowerCase()) {
    case "proprietorship":
      return { business_owner: true };
    case "partnership":
    case "llp":
      return { partner: true };
    case "private_limited":
    case "public_limited":
      return { director: true };
    case "trust":
    case "society":
      return { trustee: true };
    default:
      return { business_owner: true }; // fallback
  }
};

// ------------------------------------------------------ RAZORPAY ACCOUNT CREATION--------------------------------------------------------------

const createLinkedAccount = async (
  userID,
  email,
  phoneNo,
  name,
  legalBusinessName,
  companyDetails,
  safeCountryCode,
  custom_id,
) => {
  // Also safe
  const address = JSON.parse(JSON.stringify(companyDetails.address));

  const street = validateStreet(address.street);

  const accountPayload = {
    email: email.trim(),
    phone: phoneNo ? phoneNo.replace(/\D/g, "") : "",
    type: "route",

    // custom_id is guaranteed < 20 chars
    reference_id: custom_id,

    legal_business_name: legalBusinessName,
    business_type: companyDetails.type,
    contact_name: name,

    profile: {
      category: companyDetails.category,
      subcategory: companyDetails.subcategory,
      addresses: {
        registered: {
          street1: street,
          street2: street,
          city: address.city,
          state: address.state,
          postal_code: address.postcode,
          country: safeCountryCode,
        },
      },
    },

    legal_info: clean({
      pan: companyDetails.pan_number || "",
      gst: companyDetails.gst_number || "",
    }),

    notes: { app: "WON_BILLS" },
  };

  try {
    const response = await axios.post(
      "https://api.razorpay.com/v2/accounts",
      accountPayload,
      {
        auth: {
          username: process.env.RAZORPAY_KEY,
          password: process.env.RAZORPAY_SECRET,
        },
      },
    );

    return response.data.id;
  } catch (error) {
    console.error("ACCOUNT ERROR:", error.response?.data);
    throw new Error(
      "Razorpay account creation failed: " +
      (error.response?.data?.error?.description || error.message),
    );
  }
};

const createStakeholder = async (
  accountId,
  email,
  phoneNo,
  name,
  companyDetails,
  safeCountryCode,
) => {
  const address = JSON.parse(JSON.stringify(companyDetails.address));

  const primaryPhone = normalizePhone(phoneNo);
  if (!primaryPhone) {
    throw new Error(
      "Invalid phone number. Must be between 8 and 11 digits without country code.",
    );
  }

  const street = validateStreet(address.street);

  const stakeholderPayload = {
    name: name?.trim() || "NA",
    email: email.trim(),

    phone: {
      primary: primaryPhone,
    },

    relationship: mapRelationship(companyDetails.type),

    addresses: {
      residential: {
        street,
        city: address.city,
        state: address.state,
        postal_code: address.postcode,
        country: safeCountryCode,
      },
    },
  };

  try {
    const response = await axios.post(
      `https://api.razorpay.com/v2/accounts/${accountId}/stakeholders`,
      stakeholderPayload,
      {
        auth: {
          username: process.env.RAZORPAY_KEY,
          password: process.env.RAZORPAY_SECRET,
        },
      },
    );

    return response.data.id;
  } catch (error) {
    console.error("STAKEHOLDER ERROR:", error.response?.data);
    throw new Error(
      "Razorpay Stakeholder creation failed: " +
      (error.response?.data?.error?.description || error.message),
    );
  }
};

const configureProduct = async (accountId) => {
  //  include product_name and tnc_accepted.
  const productPayload = {
    product_name: "route",
    tnc_accepted: true,
  };

  try {
    const rzpProductResponse = await axios.post(
      `https://api.razorpay.com/v2/accounts/${accountId}/products`,
      productPayload,
      {
        auth: {
          username: process.env.RAZORPAY_KEY,
          password: process.env.RAZORPAY_SECRET,
        },
      },
    );
    return rzpProductResponse.data.id;
  } catch (error) {
    throw new Error(
      "Razorpay Product creation failed: " +
      (JSON.stringify(error.response?.data) || error.message),
    );
  }
};

// UPDATING PRODUCT WITH BANK ACCOUNT DETAILS TO MAKE THE LINKED ACCOUNT ACTIVE
// const EditProductBankAccountDetails = async (
//   rzpAccountID,
//   rzpProductID,
//   bankDetails,
// ) => {
//   try {
//     const payload = {
//       settlements: {
//         account_number: bankDetails.account_number,
//         ifsc_code: bankDetails.ifsc_code,
//         beneficiary_name: bankDetails.account_holder_name,
//       },
//     };
//     console.log("EditProductBankAccountDetails payload:", payload);

//     const productUpdate = await razorpay.products.edit(
//       rzpAccountID,
//       rzpProductID,
//       payload,
//     );

//     const activationStatus = normalizeRazorpayStatus(
//       productUpdate?.activation_status,
//     );

//     // FUND ACCOUNT ID — SINGLE SOURCE OF TRUTH
//     const fundAccountId =
//       productUpdate?.active_configuration?.settlements?.fund_account_id || null;
// console.log("EditProductBankAccountDetails result:", {
//       activationStatus,
//       fundAccountId,
//       productUpdate,
//     });
//     return {
//       success: activationStatus !== "failed",
//       activation_status: activationStatus,
//       fund_account_id: fundAccountId,
//       data: productUpdate,
//     };
//   } catch (error) {
//     console.log("EditProductBankAccountDetails error:", error);
//     console.error(
//       "Razorpay product update failed:",
//       error?.response?.data || error.message,
//     );

//     return {
//       success: false,
//       activation_status: "failed",
//       fund_account_id: null,
//       error: error?.response?.data || error.message,
//     };
//   }
// };
const EditProductBankAccountDetails = async (
  rzpAccountID,
  rzpProductID,
  bankDetails,
) => {
  try {
    const payload = {
      settlements: {
        account_number: bankDetails.account_number,
        ifsc_code: bankDetails.ifsc_code,
        beneficiary_name: bankDetails.account_holder_name,
      },
    };
    console.log("EditProductBankAccountDetails payload:", payload);

    const productUpdate = await razorpay.products.edit(
      rzpAccountID,
      rzpProductID,
      payload,
    );

    const activationStatus = normalizeRazorpayStatus(
      productUpdate?.activation_status,
    );

    const fundAccountId =
      productUpdate?.active_configuration?.settlements?.fund_account_id || null;

    console.log("EditProductBankAccountDetails result:", {
      activationStatus,
      fundAccountId,
      productUpdate,
    });

    return {
      success: activationStatus !== "failed",
      razorpay_account_status: activationStatus, // ✅ renamed to match DB field
      fund_account_id: fundAccountId,
      accountId: productUpdate?.account_id,
      rzpProductID: productUpdate?.id,
      data: productUpdate,
    };
  } catch (error) {
    console.log("EditProductBankAccountDetails error:", error);
    console.error(
      "Razorpay product update failed:",
      error?.response?.data || error.message,
    );

    return {
      success: false,
      razorpay_account_status: "failed", // ✅ consistent naming
      fund_account_id: null,
      error: error?.response?.data || error.message,
    };
  }
};

const createRazorpayAcc = async (
  userID,
  email,
  firstName,
  lastName,
  phoneNo,
  companyDetails,
  bankDetails,
  custom_id,
) => {
  try {
    if (!userID || !email || !custom_id) {
      throw new Error("Missing required fields");
    }

    if (!bankDetails?.account_holder_name) {
      throw new Error("Bank account holder name is required");
    }

    if (!companyDetails?.type) {
      throw new Error("Business type is required");
    }

    const fullName =
      [firstName, lastName].filter(Boolean).join(" ").trim() || "NA";

    const safeCountryCode = (companyDetails.address?.country || "IN")
      .trim()
      .substring(0, 2)
      .toUpperCase();

    const legalBusinessName = bankDetails.account_holder_name;

    const accountId = await createLinkedAccount(
      userID,
      email,
      phoneNo,
      fullName,
      legalBusinessName,
      companyDetails,
      safeCountryCode,
      custom_id,
    );

    const stakeholderId = await createStakeholder(
      accountId,
      email,
      phoneNo,
      fullName,
      companyDetails,
      safeCountryCode,
    );

    const rzpProductID = await configureProduct(accountId);

    const bankUpdate = await EditProductBankAccountDetails(
      accountId,
      rzpProductID,
      bankDetails,
    );

    return {
      success: bankUpdate.activation_status !== "failed",
      accountId,
      stakeholderId,
      rzpProductID,
      fund_account_id: bankUpdate.fund_account_id,
      razorpay_account_status: bankUpdate.activation_status,
    };
  } catch (error) {
    console.error("createRazorpayAcc error:", error);
    throw error;
  }
};

module.exports = {
  razorpay,
  disablePaymentLink,
  createOrdertoTransferAmount,
  mapRelationship,
  createRazorpayAcc,
  EditProductBankAccountDetails,
};
