const Razorpay = require("razorpay");
const { uploadImageToS3Bucket } = require("../utils/S3-bucket");
const {
  razorpay,
  createRazorpayAcc,
  EditProductBankAccountDetails,
} = require("../utils/razorpay/razorpay-helpers");
const { validateRazorpayKYCInput } = require("../utils/helper-functions");
const SubscriptionPayment = require("../models/subscriptionPayment");

const User = require("../models/users");
const { default: mongoose } = require("mongoose");

const getUserData = async (req, res, next) => {
  try {
    const Id = req.params.vid;

    if (!Id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(Id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched user data successfully.",
      data: user,
    });
  } catch (err) {
    console.error("MongoDB query error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user data, Please try again later.",
    });
  }
};

const getKycStatusById = async (req, res) => {
  try {
    const userId = req.params.vid;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const user = await User.findById(userId, {
      razorpay_account_status: 1,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched user KYC status successfully.",
      data: {
        razorpay_account_status: user.razorpay_account_status,
      },
    });
  } catch (err) {
    console.error("Failed to fetch user KYC status:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user KYC status.",
    });
  }
};

const updateUserProfileDataById = async (req, res) => {
  try {
    const id = req.params.vid;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const updateData = {};

    // Dynamically add fields only if provided
    if (req.body.full_name) updateData.full_name = req.body.full_name;

    if (req.body.email) updateData.email = req.body.email;

    if (req.body.phone) {
      updateData.contact_number = req.body.phone;
    }

    if (req.body.company_details) {
      updateData.company_details = req.body.company_details;
    }

    if (req.body.timezone) updateData.timezone = req.body.timezone;

    if (req.body.currency_preference)
      updateData.currency_preference = req.body.currency_preference;

    if (req.body.national_id) updateData.national_id = req.body.national_id;

    updateData.last_modified_date = new Date();

    // No fields provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided to update",
      });
    }

    // Update user by _id
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const toggleAlertAndNotify = async (req, res) => {
  try {
    const { userId, field, value } = req.body;

    // Validate allowed fields
    const allowedFields = ["alerts", "notifications"];

    if (!userId || !field || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "userId, field, and value are required",
      });
    }

    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        message: `Invalid field. Allowed: ${allowedFields.join(", ")}`,
      });
    }

    // Build update object dynamically
    const updateObj = {};
    updateObj[field] = value;

    const updatedUser = await User.findByIdAndUpdate(userId, updateObj, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `${field} updated successfully`,
    });
  } catch (error) {
    console.error("Error updating boolean setting:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const uploadCompanyLogoById = async (req, res) => {
  try {
    // Validate file
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const userId = req.params.vid;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing user ID.",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Upload image to S3
    const imageUrl = await uploadImageToS3Bucket(req.files[0]);

    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to S3",
      });
    }

    // Prepare image object
    const imageData = {
      url: imageUrl,
      timestamp: Date.now(),
    };

    // Update in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { company_logo: imageData },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to update company logo",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company logo uploaded successfully",
      image: imageUrl,
    });
  } catch (error) {
    console.error("Error uploading company logo:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const uploadSignatureById = async (req, res) => {
  try {
    // Validate uploaded file
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const userId = req.params.vid;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing user ID.",
      });
    }

    // Check if user exists (MongoDB)
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Upload signature image to S3
    const imageUrl = await uploadImageToS3Bucket(req.files[0]);

    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to S3",
      });
    }

    // Prepare image object
    const signatureData = {
      url: imageUrl,
      timestamp: Date.now(),
    };

    // Update signature field in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { signature: signatureData },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: "Could not update the signature. Try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Signature uploaded successfully",
      image: imageUrl,
    });
  } catch (error) {
    console.error("Error uploading signature:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getUserLogoAndSign = async (req, res) => {
  try {
    const userId = req.params.vid;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Fetch only the needed fields
    const user = await User.findById(
      userId,
      { company_logo: 1, signature: 1 }, // projection
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        company_logo: user.company_logo,
        signature: user.signature,
      },
    });
  } catch (err) {
    console.error("Error fetching logo & signature:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    // Validate file upload
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const userId = req.params.vid;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing user ID.",
      });
    }

    // Check if user exists in MongoDB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Upload image to S3 bucket
    const imageUrl = await uploadImageToS3Bucket(req.files[0]);

    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to S3",
      });
    }

    // Prepare image data to save in DB
    const imageData = {
      url: imageUrl,
      timestamp: Date.now(),
    };

    // Update DB using MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profile_picture: imageData },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to update profile picture",
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      image: imageUrl,
    });
  } catch (error) {
    console.error("Profile picture upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const checkSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const now = new Date();

    /* ---------------- FREE TRIAL ---------------- */
    if (user.free_trial === true) {
      if (!user.trial_expiry || new Date(user.trial_expiry) <= now) {
        await User.findByIdAndUpdate(userId, {
          free_trial: false,
          trial_expiry: null,
        });

        return res.status(200).json({
          success: false,
          type: "free",
          expiry: user.trial_expiry,
          message: "Free trial expired",
        });
      }

      return res.status(200).json({
        success: true,
        type: "free",
        expiry: user.trial_expiry,
        message: "Free trial active",
      });
    }

    /* ---------------- PAID SUBSCRIPTION ---------------- */
    if (user.is_subscribed === true) {
      if (
        !user.subscription_expiry ||
        new Date(user.subscription_expiry) <= now
      ) {
        await User.findByIdAndUpdate(userId, {
          is_subscribed: false,
          subscription_expiry: null,
        });

        return res.status(200).json({
          success: false,
          type: "pro",
          expiry: user.subscription_expiry,
          message: "Subscription expired",
        });
      }

      return res.status(200).json({
        success: true,
        type: "pro",
        expiry: user.subscription_expiry,
        message: "Subscription active",
      });
    }

    /* ---------------- NO ACCESS ---------------- */
    return res.status(200).json({
      success: false,
      type: "none",
      expiry: null,
      message: "No active subscription",
    });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check subscription status",
    });
  }
};

const renewSubscription = async (req, res) => {
  try {
    const userId = req.params.vid;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Calculate new expiry date (1 month from today)
    const newExpiryDate = new Date();
    newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);

    // Update user subscription
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        is_subscribed: true,
        free_trial: false,
        trial_expiry: newExpiryDate,
      },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      expiry: updatedUser.trial_expiry,
      isSubscribed: updatedUser.is_subscribed,
      message: "Subscription renewed successfully",
    });
  } catch (err) {
    console.error("Failed to renew subscription:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to renew subscription",
    });
  }
};

const createSubscriptionPaymentOrder = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { amount } = req.body;
    /* ---------------- VALIDATION ---------------- */
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    const user = await User.findById(userId).select("_id custom_id").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* ---------------- RAZORPAY ORDER ---------------- */
    // const amount = 99900; // ₹999
    const currency = "INR";

    // receipt length < 40
    const receipt = `sub_${user.custom_id}_${Date.now().toString().slice(-6)}`;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt,
      payment_capture: 1,
    });

    /* ---------------- SAVE PAYMENT ---------------- */
    await SubscriptionPayment.create({
      user_id: user._id,
      order_id: order.id,
      receipt,
      amount: order.amount,
      currency: order.currency,
      status: "pending",
    });

    return res.status(200).json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Create subscription order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};

const paymentLink = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user?.userId;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔹 Razorpay link
    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100, // paisa
      currency: "INR",
      description: "Yearly Subscription",
      customer: {
        email: userExists.email,
        contact: userExists.contact_number,
      },
    });

    // 🔹 Save in DB (IMPORTANT FIX)
    const paymentRecord = await SubscriptionPayment.create({
      user_id: userId,
      order_id: paymentLink.id,
      amount: amount, // ✅ REQUIRED FIELD
      status: "pending",
    });

    return res.status(200).json({
      success: true,
      paymentLink,
      paymentRecord,
    });
  } catch (error) {
    console.error("Payment link creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment link",
      error: error.message,
    });
  }
};

const verifyAndUpdateSubscription = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
    }

    // 🔹 Fetch payment link from Razorpay
    const paymentLink = await razorpay.paymentLink.fetch(paymentId);

    if (!paymentLink) {
      return res.status(404).json({
        success: false,
        message: "Payment not found in Razorpay",
      });
    }

    const status = paymentLink.status;

    // 🔹 Get payment record
    const paymentRecord = await SubscriptionPayment.findOne({
      order_id: paymentId,
    });

    if (!paymentRecord) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    const user = await User.findById(paymentRecord.user_id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let expiry;
    /* ================= PAYMENT SUCCESS ================= */
    if (status === "paid") {
      if (paymentRecord.status !== "paid") {
        // ✅ Update payment table
        paymentRecord.status = "paid";
        await paymentRecord.save();

        /* ---------------- EXPIRY CALCULATION ---------------- */
        const now = new Date();

        const baseDate =
          user.subscription_expiry && new Date(user.subscription_expiry) > now
            ? new Date(user.subscription_expiry)
            : now;

        expiry = new Date(baseDate);

        if (user.plan_interval === "yearly") {
          expiry.setFullYear(expiry.getFullYear() + 1);
        } else {
          expiry.setMonth(expiry.getMonth() + 1);
        }

        /* ---------------- UPDATE USER ---------------- */
        await User.findByIdAndUpdate(user._id, {
          is_subscribed: true,
          free_trial: false,

          subscription_expiry: expiry,
          plan_started_at: now,

          subscription_status: "active",
          current_plan: "pro",

          subscription_details: {
            provider: "razorpay",
            order_id: paymentId,
            payment_id: paymentLink.payments?.[0]?.payment_id || null,
            auto_renew: false,
          },
        });
      }

      return res.json({
        success: true,
        status: "paid",
        expiry,
        message: "Subscription activated successfully",
      });
    }

    /* ================= FAILED / CANCELLED ================= */
    if (status === "cancelled" || status === "failed") {
      await SubscriptionPayment.findOneAndUpdate(
        { order_id: paymentId },
        { status },
      );

      return res.json({
        success: false,
        status,
        message: "Payment failed or cancelled",
      });
    }

    /* ================= PENDING ================= */
    return res.json({
      success: false,
      status: "pending",
      message: "Payment still pending",
    });
  } catch (error) {
    console.error("Verify + activate error:", error);

    return res.status(500).json({
      success: false,
      message: "Error verifying payment",
    });
  }
};

const subsRazorpayWebhook = async (req, res, io) => {
  try {
    if (!io) {
      console.error("Socket.io instance not found");
      return res.status(500).json({ error: "Socket.io not initialized" });
    }

    const event = req.body;

    // PAYMENT SUCCESS
    if (event.event === "payment_link.paid") {
      const paymentLinkId = event.payload.payment_link.entity.id;

      // Extend subscription: add 1 month
      const newExpiryDate = new Date();
      newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);

      //  Update subscription_payments status = "paid"
      const paymentRecord = await SubscriptionPayment.findOneAndUpdate(
        { order_id: paymentLinkId },
        { status: "paid" },
        { new: true },
      );

      if (!paymentRecord) {
        console.error("Payment record not found in DB");
        return res.status(404).json({ error: "Payment record not found" });
      }

      //  Update user subscription status
      await User.findByIdAndUpdate(paymentRecord.user_id, {
        is_subscribed: true,
        free_trial: false,
        trial_expiry: newExpiryDate,
      });

      //  Notify client via socket
      io.emit("payment_status", "paid");

      return res.status(200).json({ received: true });
    }

    // PAYMENT FAILED
    if (event.event === "payment_link.failed") {
      io.emit("payment_status", "failed");

      return res.status(200).json({ received: true });
    }

    // Unknown Events
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).json({
      success: false,
      message: "Webhook processing error",
    });
  }
};

const paymentStatus = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Find payment by order_id
    const payment = await SubscriptionPayment.findOne({ order_id: orderId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Fetch associated user
    const user = await User.findById(payment.user_id, {
      is_subscribed: 1,
      trial_expiry: 1,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found for this payment",
      });
    }

    // Respond with combined data
    return res.json({
      status: payment.status,
      is_subscribed: user.is_subscribed,
      trial_expiry: user.trial_expiry,
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const geyKycStatusById2 = async (id) => {
  try {
    if (!id) {
      return { success: false, message: "User ID is required." };
    }

    // Fetch only the razorpay_account_status field
    const user = await User.findById(id, {
      razorpay_account_status: 1,
    });

    if (!user) {
      return { success: false, message: "User not found." };
    }

    return {
      success: true,
      message: "Fetched user KYC status successfully.",
      data: {
        razorpay_account_status: user.razorpay_account_status,
      },
    };
  } catch (err) {
    console.error("Failed to fetch user KYC status:", err);
    return {
      success: false,
      message: "Failed to fetch user KYC status.",
    };
  }
};

const getProfile = async (req, res) => {
  try {
    const userID = req.user?.userId;

    /* ---------------- VALIDATE USER ID ---------------- */
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    /* ---------------- FETCH PROFILE (ONLY REQUIRED FIELDS) ---------------- */
    const user = await User.findById(userID).select(
      "custom_id first_name last_name contact_number email national_id profile_picture",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* ---------------- SUCCESS RESPONSE ---------------- */
    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: {
        custom_id: user.custom_id || null,
        first_name: user.first_name,
        last_name: user.last_name,
        contact_number: user.contact_number,
        email: user.email,
        national_id: user.national_id,
        profile_picture: user.profile_picture || null,
      },
    });
  } catch (err) {
    console.error("Get Profile Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    /* ---------------- AUTH ---------------- */
    const userID = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const {
      first_name,
      last_name,
      email,
      contact_number,
      national_id,
      profile_picture,
    } = req.body;

    const updateData = {};

    /* ---------------- FIRST NAME ---------------- */
    if (first_name !== undefined) {
      if (typeof first_name !== "string" || !first_name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Invalid first_name",
        });
      }
      updateData.first_name = first_name.trim();
    }

    /* ---------------- LAST NAME ---------------- */
    if (last_name !== undefined) {
      if (typeof last_name !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid last_name",
        });
      }
      updateData.last_name = last_name.trim();
    }

    /* ---------------- EMAIL ---------------- */
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }

      const emailExists = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userID },
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }

      updateData.email = email.toLowerCase();
    }

    /* ---------------- CONTACT NUMBER ---------------- */
    /* ---------------- CONTACT NUMBER ---------------- */
    if (contact_number !== undefined) {
      const phoneStr = String(contact_number).trim();

      // E.164 compatible: optional +, 7–15 digits
      const phoneRegex = /^\+?[0-9]{7,15}$/;

      if (!phoneRegex.test(phoneStr)) {
        return res.status(400).json({
          success: false,
          message: "Invalid contact number format",
        });
      }

      const phoneExists = await User.findOne({
        contact_number: phoneStr,
        _id: { $ne: userID },
      });

      if (phoneExists) {
        return res.status(409).json({
          success: false,
          message: "Contact number already in use",
        });
      }

      updateData.contact_number = phoneStr;
    }

    /* ---------------- NATIONAL ID (OPTIONAL) ---------------- */
    if (national_id !== undefined) {
      if (national_id === null || national_id === "") {
        updateData.national_id = null;
      } else if (typeof national_id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid national_id",
        });
      } else {
        updateData.national_id = national_id.trim();
      }
    }

    /* ---------------- PROFILE PICTURE (OPTIONAL) ---------------- */
    if (profile_picture !== undefined) {
      if (profile_picture === null || profile_picture === "") {
        updateData.profile_picture = null;
      } else if (typeof profile_picture !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid profile_picture",
        });
      } else {
        updateData.profile_picture = profile_picture;
      }
    }

    /* ---------------- NO-OP GUARD ---------------- */
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    /* ---------------- UPDATE ---------------- */
    const updatedUser = await User.findByIdAndUpdate(
      userID,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        select: "-password -__v",
      },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({
      success: false,
      message: "Error updating profile",
    });
  }
};

const getBusinessProfile = async (req, res) => {
  try {
    const userID = req.user?.userId;

    /* ---------------- VALIDATE USER ID ---------------- */
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    /* ---------------- FETCH PROFILE (ONLY REQUIRED FIELDS) ---------------- */
    const user = await User.findById(userID).select(
      "custom_id company_details company_logo signature",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* ---------------- SUCCESS RESPONSE ---------------- */
    return res.status(200).json({
      success: true,
      message: "Business profile retrieved successfully",
      data: {
        custom_id: user.custom_id || null,
        name: user.company_details.name,
        registration_number: user.company_details.registration_number,
        tax_number: user.company_details.tax_number,
        type: user.company_details.type,
        category: user.company_details.category,
        subcategory: user.company_details.subcategory,
        address: user.company_details.address,
        company_logo: user.company_logo || "",
        signature: user.signature || "",
      },
    });
  } catch (err) {
    console.error("Get Business Profile Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

const getKYCDetails = async (req, res) => {
  try {
    const userID = req.user?.userId;

    /* ---------------- VALIDATE USER ID ---------------- */
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    /* ---------------- FETCH REQUIRED FIELDS ---------------- */
    const user = await User.findById(userID).select(
      "custom_id bank_details razorpay_account_status",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* ---------------- SAFE NORMALIZATION ---------------- */
    const bankDetails = user.bank_details || {};

    /* ---------------- SUCCESS RESPONSE ---------------- */
    return res.status(200).json({
      success: true,
      message: "KYC retrieved successfully",
      data: {
        account_holder_name: bankDetails.account_holder_name ?? null,
        account_number: bankDetails.account_number ?? null,
        ifsc_code: bankDetails.ifsc_code ?? null,
        razorpay_account_status: user.razorpay_account_status ?? null,
      },
    });
  } catch (err) {
    console.error("Get KYC Details Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

// const updateKYCDetails = async (req, res) => {
//   try {
//     const { account_holder_name, account_number, ifsc_code } = req.body;
//     const userID = req.user?.userId;

//     /* ---------------- USER ID ---------------- */
//     if (!mongoose.Types.ObjectId.isValid(userID)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid user ID",
//       });
//     }

//     /* ---------------- BANK INPUT ---------------- */
//     if (!account_holder_name || !account_number || !ifsc_code) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "account_holder_name, account_number and ifsc_code are required",
//       });
//     }

//     const bankDetails = {
//       account_holder_name: account_holder_name.trim(),
//       account_number: account_number.trim(),
//       ifsc_code: ifsc_code.trim().toUpperCase(),
//     };

//     /* ---------------- USER ---------------- */
//     const user = await User.findById(userID);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     //  PRE-FLIGHT VALIDATION
//     validateRazorpayKYCInput({
//       user,
//       bankDetails,
//     });
//     /* ===================================================== */

//     const firstName = user.first_name || "";
//     const lastName = user.last_name || "";

//     let razorpayResult;

//     /* ---------------- RAZORPAY FLOW ---------------- */
//     if (!user.razorpay_account_id) {
//       razorpayResult = await createRazorpayAcc(
//         user._id,
//         user.email,
//         firstName,
//         lastName,
//         user.contact_number,
//         user.company_details,
//         bankDetails,
//         user.custom_id,
//       );
//     } else {
//       console.log("Triggering @prabhuva")
//       razorpayResult = await EditProductBankAccountDetails(
//         user.razorpay_account_id,
//         user.razorpay_product_id,
//         bankDetails,
//       );
//       console.log("EditProductBankAccountDetails result:", razorpayResult);
//     }

//     /* ---------------- DB UPDATE ---------------- */
//     await User.findByIdAndUpdate(
//       userID,
//       {
//         bank_details: bankDetails,
//         razorpay_account_id:
//           razorpayResult.accountId || user.razorpay_account_id,
//         razorpay_stakeholder_id:
//           razorpayResult.stakeholderId || user.razorpay_stakeholder_id,
//         razorpay_product_id:
//           razorpayResult.rzpProductID || user.razorpay_product_id,
//         fund_account_id: razorpayResult.fund_account_id || user.fund_account_id,
//         razorpay_account_status: razorpayResult.razorpay_account_status,
//       },
//       { new: true },
//     );

//     return res.status(200).json({
//       success: razorpayResult.razorpay_account_status !== "failed",
//       razorpay_account_status: razorpayResult.razorpay_account_status,
//     });
//   } catch (error) {
//     console.log("updateKYCDetails error:", error);
//     console.error("updateKYCDetails error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Unexpected server error",
//     });
//   }
// };
const updateKYCDetails = async (req, res) => {
  try {
    const { account_holder_name, account_number, ifsc_code } = req.body;
    const userID = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    if (!account_holder_name || !account_number || !ifsc_code) {
      return res.status(400).json({
        success: false,
        message: "account_holder_name, account_number and ifsc_code are required",
      });
    }

    const bankDetails = {
      account_holder_name: account_holder_name.trim(),
      account_number: account_number.trim(),
      ifsc_code: ifsc_code.trim().toUpperCase(),
    };

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    validateRazorpayKYCInput({ user, bankDetails });

    const firstName = user.first_name || "";
    const lastName = user.last_name || "";

    let razorpayResult;
    if (!user.razorpay_account_id) {
      razorpayResult = await createRazorpayAcc(
        user._id,
        user.email,
        firstName,
        lastName,
        user.contact_number,
        user.company_details,
        bankDetails,
        user.custom_id,
      );
    } else {
      console.log("Triggering @prabhuva");
      razorpayResult = await EditProductBankAccountDetails(
        user.razorpay_account_id,
        user.razorpay_product_id,
        bankDetails,
      );
      console.log("EditProductBankAccountDetails result:", razorpayResult);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userID,
      {
        bank_details: bankDetails,
        razorpay_account_id: razorpayResult.accountId || user.razorpay_account_id,
        razorpay_stakeholder_id: razorpayResult.stakeholderId || user.razorpay_stakeholder_id,
        razorpay_product_id: razorpayResult.rzpProductID || user.razorpay_product_id,
        fund_account_id: razorpayResult.fund_account_id || user.fund_account_id,
        razorpay_account_status: razorpayResult.razorpay_account_status, // ✅ now aligned
      },
      { new: true },
    );

    console.log("Updated user:", updatedUser);

    return res.status(200).json({
      success: razorpayResult.razorpay_account_status !== "failed",
      razorpay_account_status: razorpayResult.razorpay_account_status,
    });
  } catch (error) {
    console.error("updateKYCDetails error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unexpected server error",
    });
  }
};

const toggleAlerts = async (req, res) => {
  try {
    const { alert } = req.body;
    const userID = req.user?.userId;

    /* ---------------- VALIDATE USER ID ---------------- */
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    /* ---------------- VALIDATE INPUT ---------------- */
    if (typeof alert !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Alert value must be boolean",
      });
    }

    /* ---------------- UPDATE USER ---------------- */
    const user = await User.findByIdAndUpdate(
      userID,
      { alerts: alert },
      { new: true, select: "alerts" },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* ---------------- SUCCESS RESPONSE ---------------- */
    return res.status(200).json({
      success: true,
      message: "Alerts preference updated successfully",
      data: {
        alerts: user.alerts,
      },
    });
  } catch (err) {
    console.error("Toggle Alerts Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update alerts preference",
    });
  }
};

const toggleNotifications = async (req, res) => {
  try {
    const { notification } = req.body;
    const userID = req.user?.userId;

    /* ---------------- VALIDATE USER ID ---------------- */
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    /* ---------------- VALIDATE INPUT ---------------- */
    if (typeof notification !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Notification value must be boolean",
      });
    }

    /* ---------------- UPDATE USER ---------------- */
    const user = await User.findByIdAndUpdate(
      userID,
      { notifications: notification },
      { new: true, select: "notifications" },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* ---------------- SUCCESS RESPONSE ---------------- */
    return res.status(200).json({
      success: true,
      message: "Notification preference updated successfully",
      data: {
        notifications: user.notifications,
      },
    });
  } catch (err) {
    console.error("Toggle Notifications Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update notification preference",
    });
  }
};

const getAlertsNotifications = async (req, res) => {
  try {
    const userID = req.user?.userId;

    /* ---------------- VALIDATE USER ID ---------------- */
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    /* ---------------- FETCH USER PREFERENCES ---------------- */
    const user = await User.findById(userID).select("alerts notifications");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* ---------------- SUCCESS RESPONSE ---------------- */
    return res.status(200).json({
      success: true,
      message: "Preferences retrieved successfully",
      data: {
        alerts: user.alerts ?? false,
        notifications: user.notifications ?? false,
      },
    });
  } catch (err) {
    console.error("Get Alerts & Notifications Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch preferences",
    });
  }
};

const updateInvoiceTemplate = async (req, res) => {
  try {
    const { tempID } = req.body;
    const userID = req.user?.userId;

    /* ---------------- VALIDATION ---------------- */
    if (!userID || tempID === undefined || tempID === null || isNaN(tempID)) {
      return res.status(400).json({
        success: false,
        message: "User ID and a valid invoice template are required",
      });
    }

    /* ---------------- UPDATE ---------------- */
    const updatedUser = await User.findByIdAndUpdate(
      userID,
      { selected_invoice: tempID },
      { new: true, select: "selected_invoice" },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Invoice template updated successfully",
      data: {
        selected_invoice: updatedUser.selected_invoice,
      },
    });
  } catch (error) {
    console.error("Error updating invoice template:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateLogoSig = async (req, res) => {
  try {
    const userId = req.user?.userId;

    /* ---------------- VALIDATE USER ---------------- */
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const { company_logo, signature } = req.body;

    /* ---------------- BUILD UPDATE PAYLOAD ---------------- */
    const update = {};

    if (typeof company_logo === "string" && company_logo.trim()) {
      update.company_logo = company_logo.trim();
    }

    if (typeof signature === "string" && signature.trim()) {
      update.signature = signature.trim();
    }

    /* ---------------- VALIDATE PAYLOAD ---------------- */
    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update",
      });
    }

    /* ---------------- UPDATE ---------------- */
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true },
    ).select("company_logo signature");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Logo / signature updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user logo or signature:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getUserData,
  getKycStatusById,
  updateUserProfileDataById,
  toggleAlertAndNotify,
  updateInvoiceTemplate,
  uploadCompanyLogoById,
  uploadSignatureById,
  getUserLogoAndSign,
  uploadProfilePicture,
  updateProfile,
  checkSubscriptionStatus,
  renewSubscription,
  createSubscriptionPaymentOrder,
  paymentLink,
  subsRazorpayWebhook,
  paymentStatus,
  geyKycStatusById2,
  updateKYCDetails,
  getProfile,
  getBusinessProfile,
  getKYCDetails,
  toggleAlerts,
  toggleNotifications,
  getAlertsNotifications,
  updateLogoSig,
  verifyAndUpdateSubscription,
};
