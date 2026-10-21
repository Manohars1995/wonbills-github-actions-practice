const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const OtpStore = require("../models/otpStore");
const User = require("../models/users");
const { welcomeMail } = require("../utils/EmailUtils");
const { generateUniqueCustomId } = require("../utils/CustomIDGenerator");

const {
  PhoneOtpServiceOnSignup,
  EmailOtpServiceOnSignup,
  PhoneOtpServiceOnSignin,
  EmailOtpServiceOnSignin,
} = require("../services/AuthServices");

// FUNCTION TO GENERATE A 6-DIGIT OTP On REGISTER for phone & email
const sendOtpOnRegisterUser = async (req, res) => {
  try {
    const { identifier, type } = req.body;

    if (!identifier || !type) {
      return res.status(400).json({
        success: false,
        message: "Identifier and type are required",
      });
    }

    if (type === "phone") {
      await PhoneOtpServiceOnSignup(identifier);
    } else if (type === "email") {
      await EmailOtpServiceOnSignup(identifier);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP type",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("OTP error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "OTP sending failed",
    });
  }
};

// FUNCTION TO VERIFY THE OTP EMAIL & PHONE
const verifySignUpOtp = async (req, res) => {
  try {
    let { identifier, type, otp } = req.body;

    if (!identifier || !type || !otp) {
      return res.status(400).json({
        success: false,
        message: "identifier, type and otp are required",
      });
    }

    if (!["phone", "email"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid identifier type",
      });
    }

    // Normalize to match how it was stored
    if (type === "phone") {
      identifier = `+91${identifier.trim()}`;
    } else if (type === "email") {
      identifier = identifier.trim().toLowerCase();
    }

    const otpRecord = await OtpStore.findOne({ identifier, type });

    if (!otpRecord || !otpRecord.otp_obj) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Block already verified identifiers
    if (otpRecord.verified) {
      return res.status(400).json({
        success: false,
        message: `${type} already verified`,
      });
    }

    // Block inactive OTP
    if (!otpRecord.otp_obj.active) {
      return res.status(400).json({
        success: false,
        message: "OTP is no longer active",
      });
    }

    // Expiry check
    if (Date.now() > otpRecord.otp_obj.expiry) {
      otpRecord.otp_obj.active = false;
      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // OTP mismatch → increment attempts
    if (otpRecord.otp_obj.otp !== Number(otp)) {
      otpRecord.otp_obj.attempts += 1;

      // Optional brute-force protection
      if (otpRecord.otp_obj.attempts >= 5) {
        otpRecord.otp_obj.active = false;
      }

      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP valid → mark verified
    otpRecord.otp_obj.active = false;
    otpRecord.verified = true;
    await otpRecord.save();

    return res.status(200).json({
      success: true,
      message: `${type} verified successfully`,
    });
  } catch (err) {
    console.error("verifySignUpOtp error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,

      company_name,
      company_reg_number,
      company_tax_number,
      company_type,
      company_category,
      company_subcategory,
      country,
      state,
      city,
      postcode,
      street,

      timezone = "Asia/Kolkata",
      agreed_to_terms = false,
    } = req.body;

    /* ---------------- NORMALIZE INPUT ---------------- */
    const normalizedEmail = email?.trim().toLowerCase() || null;
    const normalizedPhone = phone?.trim() || null;

    /* ---------------- BASIC VALIDATION ---------------- */
    if (!normalizedEmail && !normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number is required.",
      });
    }

    if (!agreed_to_terms) {
      return res.status(400).json({
        success: false,
        message: "You must agree to the terms and conditions.",
      });
    }

    /* ---------------- COMPANY NAME REQUIRED ---------------- */
    if (!company_name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required.",
      });
    }

    const now = Date.now();

    /* ---------------- DUPLICATE CHECK ---------------- */
    if (normalizedEmail) {
      const exists = await User.findOne({ email: normalizedEmail }).lean();
      if (exists) {
        return res.status(409).json({
          success: false,
          message: "User already exists with this email.",
        });
      }
    }

    if (normalizedPhone) {
      const exists = await User.findOne({
        contact_number: normalizedPhone,
      }).lean();
      if (exists) {
        return res.status(409).json({
          success: false,
          message: "User already exists with this phone number.",
        });
      }
    }

    /* ---------------- COMPANY DETAILS ---------------- */
    const company_details = {
      name: company_name.trim(),
      registration_number: company_reg_number?.trim() || null,
      tax_number: company_tax_number?.trim() || null,
      type: company_type || null,
      category: company_category?.trim() || null,
      subcategory: company_subcategory?.trim() || null,
      address: {
        country: country?.trim() || null,
        state: state?.trim() || null,
        city: city?.trim() || null,
        postcode: postcode?.trim() || null,
        street: street?.trim() || null,
      },
    };

    /* ---------------- TRIAL SETUP ---------------- */
    const trialExpiryDate = new Date();
    trialExpiryDate.setDate(trialExpiryDate.getDate() + 30); // ← align with UI

    const custom_id = await generateUniqueCustomId("VND", User);

    /* ---------------- CREATE USER ---------------- */
    const newUser = await User.create({
      custom_id,

      first_name: first_name?.trim() || null,
      last_name: last_name?.trim() || null,
      email: normalizedEmail,
      contact_number: `+91${normalizedPhone}`,

      company_details,

      timezone,
      currency_preference: "INR",

      agreed_to_terms: true,
      /* ---------- ACCOUNT STATUS ---------- */
      status: true,

      /* ---------- SUBSCRIPTION (CORRECT) ---------- */
      free_trial: true,
      trial_expiry: trialExpiryDate,

      is_subscribed: false,
      subscription_expiry: null,

      current_plan: "free",
      plan_interval: null,
      plan_started_at: null, // IMPORTANT
      subscription_status: "trial",

      company_logo:
        "https://res.cloudinary.com/dca9sij3n/image/upload/f_auto,q_auto/iph8c5dgmpgunr4ps3qq",
    });

    /* ---------------- CONSUME OTPs ---------------- */
    await OtpStore.deleteMany({
      identifier: { $in: [normalizedEmail, normalizedPhone].filter(Boolean) },
    });

    /* ---------------- WELCOME EMAIL ---------------- */
    if (normalizedEmail) {
      try {
        await welcomeMail(first_name, normalizedEmail);
      } catch (err) {
        console.error("Welcome email failed:", err);
      }
    }

    return res.status(201).json({
      success: true,
      userId: newUser._id,
      message: "User created successfully",
    });
  } catch (err) {
    console.error("Error in user registration:", err);

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// Send OTP on Sign-In (Phone / Email)
const sendOtpOnSignin = async (req, res) => {
  try {
    const { identifier, type } = req.body;

    if (!identifier || !type) {
      return res.status(400).json({
        success: false,
        message: "Identifier and type are required",
      });
    }

    let result;

    if (type === "phone") {
      result = await PhoneOtpServiceOnSignin(identifier);
    } else if (type === "email") {
      result = await EmailOtpServiceOnSignin(identifier);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP type",
      });
    }

    if (result === "USER_NOT_FOUND") {
      return res.status(403).json({
        success: false,
        message: "User not found",
      });
    }

    if (result === "USER_DISABLED" && result !== "USER_NOT_FOUND") {
      return res.status(403).json({
        success: false,
        message: "Account is disabled. Please contact support.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "If the account exists, an OTP has been sent",
    });
  } catch (error) {
    console.error("Error in sendOtp controller:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// FUNCTION TO VERIFY THE OTP ON LOGIN
const verifyLoginOtp = async (req, res) => {
  try {
    const { identifier, type, otp } = req.body;

    /* ---------------- BASIC VALIDATION ---------------- */
    if (!identifier || !type) {
      return res.status(400).json({
        success: false,
        message: "identifier and type are required",
      });
    }

    if (!["phone", "email"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP type",
      });
    }

    /* ---------------- NORMALIZE IDENTIFIER ---------------- */
    let normalizedIdentifier;

    if (type === "phone") {
      const phone = identifier.trim();
      const phoneRegex = /^[6-9]\d{9}$/;

      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format",
        });
      }

      normalizedIdentifier = `+91${phone}`;
    } else {
      normalizedIdentifier = identifier.trim().toLowerCase();
    }

    /* ---------------- FETCH USER ---------------- */
    const userQuery =
      type === "phone"
        ? { contact_number: normalizedIdentifier }
        : { email: normalizedIdentifier };

    const user = await User.findOne(userQuery);
    console.log("User found:", user);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Account not found",
      });
    }

    if (user.status !== true) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is either deactivated or deleted. Please contact support.",
      });
    }

    /* ---------------- BYPASS CONFIG ---------------- */
    const STATIC_EMAIL =
      process.env.STATIC_LOGIN_EMAIL || "review@wonbills.com";
    const STATIC_OTP =
      process.env.STATIC_LOGIN_OTP || "123456";

    const isBypassUser =
      type === "email" && normalizedIdentifier === STATIC_EMAIL;

    /* ---------------- DIRECT LOGIN (BYPASS) ---------------- */
    // if (isBypassUser) {
    //   console.log("first");
    //   const tokenPayload = {
    //     userId: user._id.toString(),
    //     role: user.user_type,
    //   };

    //   const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    //     expiresIn: "24h",
    //   });

    //   const refreshToken = jwt.sign(
    //     { ...tokenPayload, type: "refresh" },
    //     process.env.JWT_REFRESH_SECRET,
    //     { expiresIn: "48h" },
    //   );

    //   const cookieOptions = {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production",
    //     sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    //   };

    //   res.cookie("accessToken", accessToken, {
    //     ...cookieOptions,
    //     maxAge: 24 * 60 * 60 * 1000,
    //   });

    //   res.cookie("refreshToken", refreshToken, {
    //     ...cookieOptions,
    //     maxAge: 48 * 60 * 60 * 1000,
    //   });

    //   const mobileToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    //     expiresIn: "7d",
    //   });

    //   return res.status(200).json({
    //     success: true,
    //     message: "Login success (bypass mode)",
    //     mobileToken,
    //     user: {
    //       reference_id: user.custom_id,
    //       role: user.user_type,
    //       email: user.email,
    //       phone: user.contact_number,
    //       profile_picture: user.profile_picture,
    //       isSubscribed: user.is_subscribed,
    //       free_trial: user.free_trial,
    //       trial_expiry: user.trial_expiry,
    //       company_name: user?.company_details?.name,
    //       logo: user?.company_logo,
    //       subscriptionCancelledAtCycleEnd:
    //         user.subscription_cancelled_at_cycle_end || false,
    //       current_plan: user.current_plan || "free",
    //     },
    //   });
    // }
    /* ---------------- REVIEW LOGIN (PLAY STORE) ---------------- */
    if (isBypassUser) {

      // reviewer must enter otp
      if (!otp) {
        return res.status(400).json({
          success: false,
          message: "OTP is required",
        });
      }

      // validate static otp
      if (String(otp) !== String(STATIC_OTP)) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      console.log("Play Store review login");

      const tokenPayload = {
        userId: user._id.toString(),
        role: user.user_type,
      };

      const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      const refreshToken = jwt.sign(
        { ...tokenPayload, type: "refresh" },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "48h" },
      );

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      };

      res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 48 * 60 * 60 * 1000,
      });

      const mobileToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.status(200).json({
        success: true,
        message: "Login success (review mode)",
        mobileToken,
        user: {
          reference_id: user.custom_id,
          role: user.user_type,
          email: user.email,
          phone: user.contact_number,
          profile_picture: user.profile_picture,
          isSubscribed: user.is_subscribed,
          free_trial: user.free_trial,
          trial_expiry: user.trial_expiry,
          company_name: user?.company_details?.name,
          logo: user?.company_logo,
          subscriptionCancelledAtCycleEnd:
            user.subscription_cancelled_at_cycle_end || false,
          current_plan: user.current_plan || "free",
          intro: user?.intro,

        },
      });
    }

    /* ---------------- REQUIRE OTP FOR NORMAL USERS ---------------- */
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    /* ---------------- FETCH OTP ---------------- */
    const otpRecord = await OtpStore.findOne({
      identifier: normalizedIdentifier,
      type,
    });

    if (!otpRecord || !otpRecord.otp_obj) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const { otp: storedOtp, expiry, active, attempts = 0 } = otpRecord.otp_obj;

    /* ---------------- CHECK OTP EXPIRY ---------------- */
    if (!active || Date.now() > expiry) {
      await OtpStore.deleteOne({ _id: otpRecord._id });
      return res.status(401).json({
        success: false,
        message: "OTP expired",
      });
    }

    /* ---------------- VERIFY OTP ---------------- */
    if (String(storedOtp) !== String(otp)) {
      otpRecord.otp_obj.attempts = attempts + 1;

      if (otpRecord.otp_obj.attempts >= 5) {
        otpRecord.otp_obj.active = false;
      }

      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    /* ---------------- OTP CONSUMED ---------------- */
    await OtpStore.deleteOne({ _id: otpRecord._id });

    /* ---------------- TOKENS ---------------- */
    const tokenPayload = {
      userId: user._id.toString(),
      role: user.user_type,
    };

    const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    const refreshToken = jwt.sign(
      { ...tokenPayload, type: "refresh" },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "48h" },
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 48 * 60 * 60 * 1000,
    });

    const mobileToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    /* ---------------- RESPONSE ---------------- */
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      mobileToken,
      user: {
        reference_id: user.custom_id,
        role: user.user_type,
        email: user.email,
        phone: user.contact_number,
        profile_picture: user.profile_picture,
        isSubscribed: user.is_subscribed,
        free_trial: user.free_trial,
        trial_expiry: user.trial_expiry,
        company_name: user?.company_details?.name,
        logo: user?.company_logo,
        subscriptionCancelledAtCycleEnd:
          user.subscription_cancelled_at_cycle_end || false,
        current_plan: user.current_plan || "free",
        intro: user?.intro,
        razorpay_account_status: user.razorpay_account_status || "not_created",
      },
    });
  } catch (error) {
    console.error("Error in verifyLoginOtp:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId).lean();

    if (!user || user.status === false) {
      return res.status(401).json({
        success: false,
        message: "Session expired or user inactive",
      });
    }

    return res.status(200).json({
      success: true,
      message: "verified user",
      user: {
        reference_id: user.custom_id,
        role: user.user_type,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || null,
        phone: user.contact_number || null,
        alerts: user.alerts,
        notifications: user.notifications,
        isSubscribed: user.is_subscribed,
        profile_picture: user.profile_picture || null,
        logo: user.company_logo || null,
        template: user.selected_invoice || 1,
        company_name: user?.company_details?.name,
      },
    });
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user session",
    });
  }
};

//logout
const logout = (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    // Clear access token
    res.clearCookie("accessToken", cookieOptions);

    // Clear refresh token
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// const checkSubscriptionStatus = async (req, res) => {
//   try {
//     const userId = req.user?.userId;

//     /* ---------- VALIDATE USER ID ---------- */
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user ID",
//       });
//     }

//     /* ---------- FETCH USER ---------- */
//     const user = await User.findById(userId).select(
//       `
//         free_trial
//         trial_expiry
//         is_subscribed
//         subscription_expiry
//         current_plan
//         plan_interval
//         plan_started_at
//         subscription_status
//       `,
//     );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const now = new Date();

//     /* =====================================================
//            FREE TRIAL
//         ===================================================== */
//     if (user.free_trial === true) {
//       if (!user.trial_expiry) {
//         return res.status(200).json({
//           success: false,
//           status: "invalid",
//           message: "Trial expiry missing",
//         });
//       }

//       if (now < user.trial_expiry) {
//         const remainingDays = Math.ceil(
//           (user.trial_expiry - now) / (1000 * 60 * 60 * 24),
//         );

//         return res.status(200).json({
//           success: true,
//           status: "trial",
//           subscription_status: "trial",
//           expiry: user.trial_expiry,
//           remainingDays,
//           current_plan: "free",
//           message: "Free trial active",
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         status: "expired",
//         subscription_status: "expired",
//         expiry: user.trial_expiry,
//         remainingDays: 0,
//         current_plan: "free",
//         message: "Free trial expired",
//       });
//     }

//     /* =====================================================
//            PRO SUBSCRIPTION
//         ===================================================== */
//     if (user.is_subscribed === true && user.current_plan === "pro") {
//       // Lifetime / no-expiry plan
//       if (!user.subscription_expiry) {
//         return res.status(200).json({
//           success: true,
//           status: "active",
//           subscription_status: "active",
//           expiry: null,
//           plan_interval: user.plan_interval,
//           plan_started_at: user.plan_started_at,
//           current_plan: "pro",
//           message: "Pro subscription active",
//         });
//       }

//       if (now < user.subscription_expiry) {
//         return res.status(200).json({
//           success: true,
//           status: "active",
//           subscription_status: "active",
//           expiry: user.subscription_expiry,
//           plan_interval: user.plan_interval,
//           plan_started_at: user.plan_started_at,
//           current_plan: "pro",
//           message: "Pro subscription active",
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         status: "expired",
//         subscription_status: "expired",
//         expiry: user.subscription_expiry,
//         plan_interval: user.plan_interval,
//         plan_started_at: user.plan_started_at,
//         current_plan: "pro",
//         message: "Pro subscription expired",
//       });
//     }

//     /* =====================================================
//            FREE PLAN (NO TRIAL, NO SUBSCRIPTION)
//         ===================================================== */
//     return res.status(200).json({
//       success: true,
//       status: "free",
//       subscription_status: "free",
//       current_plan: "free",
//       message: "Free plan",
//     });
//   } catch (err) {
//     console.error("Subscription status error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to check subscription status",
//     });
//   }
// };

const checkSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(userId).select(
      "free_trial trial_expiry is_subscribed current_plan plan_interval plan_started_at subscription_cancelled_at_cycle_end",
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const now = new Date();
    const expiryDate = user.trial_expiry;
    const isCancelled = user.subscription_cancelled_at_cycle_end || false;

    // 1. LIFETIME / ACTIVE PRO (No Expiry)
    if (!expiryDate && user.is_subscribed) {
      return res.status(200).json({
        success: true,
        subscription_status: "active",
        planType: user.plan_interval || "monthly",
        current_plan: "pro",
        subscription_end: null,
        cancelledAtCycleEnd: isCancelled,

      });
    }

    // 2. ABSOLUTE FREE USER (No trial history, not subscribed)
    if (!expiryDate) {
      return res.status(200).json({
        success: true,
        subscription_status: "free",
        current_plan: "free",

      });
    }

    /* ---------- EVALUATE EXPIRY LOGIC ---------- */
    const isExpired = now > expiryDate;
    const remainingDays = Math.max(0, Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)));

    // 3. EXPIRED STATUS
    if (isExpired) {
      return res.status(200).json({
        success: true,
        subscription_status: "expired",
        planType: user.plan_interval || null,
        subscription_end: expiryDate,
        remainingDays: 0,

      });
    }

    // 4. ACTIVE TRIAL
    if (!user.is_subscribed) {
      return res.status(200).json({
        success: true,
        subscription_status: "trial",
        remainingDays: remainingDays,
        trial_expiry: expiryDate,

      });
    }

    // 5. ACTIVE PRO (With Expiry)
    return res.status(200).json({
      success: true,
      subscription_status: "active",
      planType: user.current_plan || "monthly",
      subscription_end: expiryDate,
      cancelledAtCycleEnd: isCancelled,
      current_period_end: expiryDate, // Backup for frontend mapping
    });

  } catch (err) {
    console.error("Subscription status error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const deactivateAccountById = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Update status field to false
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status: false },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Account successfully deactivated.",
    });
  } catch (error) {
    console.error("Error deactivating account:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateIntroStatus = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { intro: false },
      { new: false },
    ).select("intro");
    // console.log("Updated user intro status:", updatedUser);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Intro marked as seen",
      intro: updatedUser.intro,
    });
  } catch (error) {
    console.error("updateIntroStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


module.exports = {
  sendOtpOnRegisterUser,
  verifySignUpOtp,
  sendOtpOnSignin,
  verifyLoginOtp,
  registerUser,
  getMe,
  logout,
  checkSubscriptionStatus,
  deactivateAccountById,
  updateIntroStatus
};
