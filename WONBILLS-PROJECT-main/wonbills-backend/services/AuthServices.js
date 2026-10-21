const User = require("../models/users");
const OtpStore = require("../models/otpStore");
const { generateOTP, sendPhoneOTP } = require("../utils/otp");
const { sendOTPEmail } = require("../utils/EmailUtils");

const PhoneOtpServiceOnSignup = async (phone) => {
  const normalizedPhone = phone.trim();

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(normalizedPhone)) {
    throw new Error("Invalid phone number");
  }
  const x = `+91${normalizedPhone}`;

  const existingUser = await User.findOne({ contact_number: x });
  if (existingUser) {
    throw new Error("User exists with this mobile number already.");
  }

  const existingOtp = await OtpStore.findOne({
    identifier: x,
    type: "phone",
    "otp_obj.expiry": { $gt: Date.now() },
  });

  if (existingOtp) {
    throw new Error("OTP already sent. Please wait before requesting again.");
  }

  const otp = generateOTP();

  await OtpStore.findOneAndUpdate(
    { identifier: x, type: "phone" },
    {
      identifier: x,
      type: "phone",
      verified: false,
      otp_obj: {
        otp,
        expiry: Date.now() + 3 * 60 * 1000,
        active: true,
        attempts: existingOtp?.otp_obj?.attempts ?? 0,
      },
    },
    { upsert: true, new: true },
  );
console.log("Phone OTP:", otp);
  const res = await sendPhoneOTP(x, otp);
  return true;
};

const EmailOtpServiceOnSignup = async (email) => {
  //  Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new Error("Invalid email format");
  }

  // Prevent signup if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new Error("User exists with this email already.");
  }

  // Prevent OTP spamming (cooldown)
  const existingOtp = await OtpStore.findOne({
    identifier: normalizedEmail,
    type: "email",
    "otp_obj.expiry": { $gt: Date.now() },
  });

  if (existingOtp) {
    throw new Error("OTP already sent. Please wait before requesting again.");
  }

  const otp = generateOTP();

  await OtpStore.findOneAndUpdate(
    {
      identifier: normalizedEmail,
      type: "email",
    },
    {
      identifier: normalizedEmail,
      type: "email",
      verified: false,
      otp_obj: {
        otp,
        expiry: Date.now() + 3 * 60 * 1000, // 2 minutes
        active: true,
        // Preserve attempts if record exists
        attempts: existingOtp?.otp_obj?.attempts ?? 0,
      },
    },
    {
      upsert: true,
      new: true,
    },
  );
console.log("Email OTP:", otp);
  await sendOTPEmail(normalizedEmail, otp);
  return true;
};

const PhoneOtpServiceOnSignin = async (phone) => {
  try {
    if (!phone || typeof phone !== "string") return;

    const normalizedPhone = phone.trim();
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(normalizedPhone)) return;

    const contactNumber = `+91${normalizedPhone}`;
    /* ---------------- USER MUST EXIST & BE ACTIVE ---------------- */
    const existingUser = await User.findOne({
      contact_number: contactNumber,
    }).lean();

    if (!existingUser) {
      return "USER_NOT_FOUND";
    }

    if (existingUser && existingUser.status === false) {
      return "USER_DISABLED";
    }

    /* ---------------- CLEAR OLD OTP ---------------- */
    await OtpStore.deleteOne({
      identifier: contactNumber,
      type: "phone",
    });

    const otp = generateOTP();
    console.log("Phone OTP:", otp);

    await OtpStore.create({
      identifier: contactNumber,
      type: "phone",
      verified: false,
      otp_obj: {
        otp,
        expiry: Date.now() + 3 * 60 * 1000,
        active: true,
        attempts: 0,
      },
    });
    await sendPhoneOTP(contactNumber, otp);
    return true;
  } catch (error) {
    console.error("PhoneOtpServiceOnSignin Error:", error);
    return false;
  }
};

const EmailOtpServiceOnSignin = async (email) => {
  try {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) return;

    /* ---------------- USER MUST EXIST & BE ACTIVE ---------------- */
    const existingUser = await User.findOne({
      email: normalizedEmail,
    }).lean();

    if (!existingUser) return;

    if (existingUser.status === false) {
      return "USER_DISABLED";
    }

    /* ---------------- CLEAR OLD OTP ---------------- */
    await OtpStore.deleteOne({
      identifier: normalizedEmail,
      type: "email",
    });

    const otp = generateOTP();
    console.log("Email OTP:", otp);

    await OtpStore.create({
      identifier: normalizedEmail,
      type: "email",
      verified: false,
      otp_obj: {
        otp,
        expiry: Date.now() + 3 * 60 * 1000,
        active: true,
        attempts: 0,
      },
    });

    await sendOTPEmail(normalizedEmail, otp);
    return true;
  } catch (error) {
    console.error("EmailOtpServiceOnSignin Error:", error);
    return false;
  }
};

module.exports = {
  PhoneOtpServiceOnSignup,
  EmailOtpServiceOnSignup,
  PhoneOtpServiceOnSignin,
  EmailOtpServiceOnSignin,
};
