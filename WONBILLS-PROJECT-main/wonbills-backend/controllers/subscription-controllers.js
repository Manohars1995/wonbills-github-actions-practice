const User = require("../models/users");
const {
  sendSubscriptionExpiringEmail,
  sendFreeTrailExpiredEmail,
} = require("../utils/EmailUtils");
const { razorpay } = require("../utils/razorpay/razorpay-helpers");
const crypto = require("crypto");

const MONTHLY_PLAN_ID = process.env.RAZORPAY_MONTHLY_PLAN_ID;
const YEARLY_PLAN_ID = process.env.RAZORPAY_YEARLY_PLAN_ID;


/* ---------------- DATE FORMAT ---------------- */
const DateConversion = (newDate) => {
  const date = new Date(newDate);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const updateUserSubscription = async ({ userId, subscription }) => {
  console.log(subscription);
  const planType = subscription.notes?.planType || "monthly";
  const planStartedAt = new Date(
    (subscription.current_start || subscription.start_at) * 1000,
  );

  const expiry = subscription.current_end
    ? new Date(subscription.current_end * 1000)
    : null;

  return await User.findByIdAndUpdate(userId, {
    is_subscribed: true,
    free_trial: false,
    trial_expiry: expiry?.toISOString(),
    subscription_expiry: expiry?.toISOString(),
    razorpaySubscriptionId: subscription.id,
    subscription_cancelled_at_cycle_end: false,
    current_plan: planType,
    subscription_status: subscription.status,
    plan_started_at: planStartedAt.toISOString(),
  });
};

/* ---------------- EXPIRY REMINDER ---------------- */
const getAccountsExpiringSoon = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fiveDaysLater = new Date();
    fiveDaysLater.setDate(today.getDate() + 5);
    fiveDaysLater.setHours(23, 59, 59, 999);

    const users = await User.find({
      trial_expiry: { $gte: today, $lte: fiveDaysLater },
      is_subscribed: true,
    }).select("user_id full_name email trial_expiry");

    if (!users?.length) return;

    await Promise.all(
      users.map(async (user) => {
        try {
          const formattedDate = DateConversion(user.trial_expiry);

          await sendSubscriptionExpiringEmail(
            user.email,
            user.full_name,
            formattedDate,
          );
        } catch (err) {
          console.error(
            `Failed reminder for User ID: ${user.user_id}`,
            err.message,
          );
        }
      }),
    );
  } catch (err) {
    console.error("Error fetching expiring accounts:", err.message);
  }
};

/* ---------------- FREE TRIAL EXPIRED ---------------- */
const getAccountsFreeTrailExpired = async () => {
  try {
    const now = new Date();

    const users = await User.find({
      trial_expiry: { $ne: null, $lt: now },
      is_subscribed: false,
      free_trial: true,
    }).select("user_id full_name email");

    if (!users?.length) return;

    await Promise.all(
      users.map(async (user) => {
        try {
          await sendFreeTrailExpiredEmail(user.email, user.full_name);
        } catch (err) {
          console.error(
            `Failed trial expiry email: ${user.user_id}`,
            err.message,
          );
        }
      }),
    );
  } catch (error) {
    console.error("Error fetching expired trials:", error.message);
  }
};

/* ---------------- CREATE SUBSCRIPTION ---------------- */
const createSubscription = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { planType } = req.body;
    console.log(req.body, "hereee")

    if (!["monthly", "yearly"].includes(planType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan type",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const planId = planType === "yearly" ? YEARLY_PLAN_ID : MONTHLY_PLAN_ID;
    if (!planId) {
      return res.status(400).json({
        success: false,
        message: "Plan not configured",
      });
    }

    if (user.razorpaySubscriptionId) {
      // try {
      //   const existing = await razorpay.subscriptions.fetch(
      //     user.razorpaySubscriptionId,
      //   );

      //   if (
      //     existing &&
      //     ["created", "authenticated", "active"].includes(existing.status)
      //   ) {
      //     return res.json({
      //       success: true,
      //       subscriptionId: existing.id,
      //       shortUrl: existing.short_url,
      //     });
      //   }
      // } catch (err) {
      //   console.log("Old subscription fetch failed, creating new...");
      // }
      if (user.razorpaySubscriptionId) {
        try {
          const existing = await razorpay.subscriptions.fetch(
            user.razorpaySubscriptionId,
          );

          const existingPlanType = user.current_plan;

          // same plan → reuse
          if (
            existing &&
            ["created", "authenticated", "active"].includes(existing.status) &&
            existingPlanType === planType
          ) {
            return res.json({
              success: true,
              subscriptionId: existing.id,
              shortUrl: existing.short_url,
            });
          }

       
        } catch (err) {
          console.log("Old subscription fetch failed");
        }
      }
    }

    const totalCount = planType === "yearly" ? 10 : 60;
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      quantity: 1,
      total_count: totalCount,
      notes: {
        userId: String(user._id),
        planType,
      },
    });

    await User.findByIdAndUpdate(userId, {
      razorpaySubscriptionId: subscription.id,
      current_plan: planType,
    });

    return res.json({
      success: true,
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url,
    });
  } catch (error) {
    console.error("Create Subscription Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.error?.description ||
        error?.message ||
        "Failed to create subscription",
    });
  }
};

/* ---------------- VERIFY STATUS ---------------- */
const verifySubscriptionStatus = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const userId = req.user?.userId;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: "subscriptionId is required",
      });
    }

    const subscription = await razorpay.subscriptions.fetch(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    if (!["active", "completed"].includes(subscription.status)) {
      return res.json({
        success: false,
        status: subscription.status,
        message: "Payment not completed",
      });
    }

    await updateUserSubscription({
      userId,
      subscription,
    });

    return res.json({
      success: true,
      expiryDate: subscription.current_end
        ? new Date(subscription.current_end * 1000)
        : null,
      planType: subscription.notes?.planType || "monthly",
      status: subscription.status,
      subscriptionCancelledAtCycleEnd: false,
    });
  } catch (error) {
    console.error("Verify Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

/* ---------------- WEBHOOK ---------------- */
const subscriptionWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_SECRET_WEBHOOK;

    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = req.body.event;
    const payload = req.body.payload?.subscription?.entity;

    /* ---------------- RENEWAL ---------------- */
    if (event === "subscription.charged") {
      const user = await User.findOne({
        razorpaySubscriptionId: payload.id,
      });

      if (!user) {
        console.log("User not found for subscription:", payload.id);
        return res.json({ success: true });
      }

      // ✅ Always fetch latest subscription
      const subscription = await razorpay.subscriptions.fetch(payload.id);

      await updateUserSubscription({
        userId: user._id,
        subscription,
      });

      console.log(`✅ Renewed (${subscription.notes?.planType}) ${user.email}`);
    }

    /* ---------------- CANCEL / HALT ---------------- */
    if (["subscription.halted", "subscription.cancelled"].includes(event)) {
      const user = await User.findOne({
        razorpaySubscriptionId: payload.id,
      });

      if (user) {
        await User.findByIdAndUpdate(user._id, {
          is_subscribed: false,
          razorpaySubscriptionId: null,
          subscription_status: payload.status,
        });

        console.log(`❌ Cancelled ${user.email}`);
      }
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);

    return res.status(500).json({
      message: "Webhook failed",
    });
  }
};

/* ---------------- CANCEL ---------------- */
const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId);

    if (!user?.razorpaySubscriptionId) {
      return res.status(400).json({
        success: false,
        message: "No active subscription",
      });
    }

    await razorpay.subscriptions.cancel(user.razorpaySubscriptionId, 1);

    await User.findByIdAndUpdate(user._id, {
      subscription_cancelled_at_cycle_end: true,
    });

    return res.json({
      success: true,
      message:
        "Your subscription will remain active until the current billing cycle ends.",
    });
  } catch (error) {
    console.error("Cancel Error:", error);
    return res.status(500).json({
      success: false,
      message: "Cancel failed",
    });
  }
};

module.exports = {
  getAccountsExpiringSoon,
  getAccountsFreeTrailExpired,
  createSubscription,
  verifySubscriptionStatus,
  subscriptionWebhook,
  cancelSubscription,
};
