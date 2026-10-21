const convertDate = (date) => {
  return new Date(date).toISOString().slice(0, 19).replace("T", " ");
};

const HttpResponse = (res, message, success, statusCode) => {
  return res.status(statusCode).json({
    success: success,
    message: message,
  });
};

const normalizePhone = (phone) => {
  if (!phone) return null;

  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("91") && digits.length > 10) {
    digits = digits.slice(2);
  }

  return digits.length === 10 ? digits : null;
};

const validateRazorpayKYCInput = ({ user, bankDetails }) => {
  if (!user) {
    throw new Error("User not found");
  }

  /* ---------- BASIC ---------- */
  if (!user.email) {
    throw new Error("Email is required for Razorpay KYC");
  }

  if (!user.custom_id || user.custom_id.length > 20) {
    throw new Error("Invalid custom_id for Razorpay reference");
  }

  /* ---------- NAME ---------- */
  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  if (!fullName) {
    throw new Error("User name is required for Razorpay KYC");
  }

  /* ---------- PHONE ---------- */
  const phone = normalizePhone(user.contact_number);
  if (!phone) {
    throw new Error(
      "Valid phone number (8–11 digits) is required for Razorpay KYC",
    );
  }

  /* ---------- COMPANY ---------- */
  const company = user.company_details;
  if (!company?.type) {
    throw new Error("Company type is required for Razorpay KYC");
  }

  /* ---------- ADDRESS ---------- */
  const address = company.address?.toObject?.() || company.address;
  if (!address) {
    throw new Error("Company address is required for Razorpay KYC");
  }

  if (!address.street || address.street.trim().length < 10) {
    throw new Error(
      "Street address (min 10 characters) is required for Razorpay KYC",
    );
  }

  if (!address.city || !address.state || !address.postcode) {
    throw new Error("City, state, and postcode are required for Razorpay KYC");
  }

  if (!address.country || address.country.length !== 2) {
    throw new Error("Valid country code is required for Razorpay KYC");
  }

  /* ---------- BANK ---------- */
  if (!bankDetails?.account_holder_name) {
    throw new Error("Bank account holder name is required");
  }

  if (!bankDetails?.account_number) {
    throw new Error("Bank account number is required");
  }

  if (!bankDetails?.ifsc_code) {
    throw new Error("IFSC code is required");
  }

  return {
    fullName,
    phone,
    address,
  };
};

module.exports = {
  convertDate,
  HttpResponse,
  validateRazorpayKYCInput,
};
