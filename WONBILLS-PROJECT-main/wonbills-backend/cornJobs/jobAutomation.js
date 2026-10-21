const cron = require("node-cron");
const { processPayments } = require("./taskHandlers");
const { CheckPaymentsDue, CheckPaymentsOverDue } = require("./dueHandlers");
const {
  PaymentDueAlertLog,
  PaymentOverDueAlertLog,
} = require("../controllers/alert-controllers");
const {
  getAccountsExpiringSoon,
  getAccountsFreeTrailExpired,
} = require("../controllers/subscription-controllers");
const User = require("../models/users");

// CRON JOB SETUP TO CHECK SCHEDULE PAYMENTS EVERY DAY
cron.schedule("00 11 * * *", async () => {
  try {
    await processPayments();
  } catch (error) {
    console.error("Error processing payments:", error.message);
  }
});

// CRON JOB TO CHECK PAYMENT DUE DATES AND SEND REMAINDER TO THE CLIENT
cron.schedule("00 11 * * *", async () => {
  try {
    // Run all tasks in parallel
    await Promise.all([
      CheckPaymentsDue(),
      CheckPaymentsOverDue(),
      PaymentDueAlertLog(),
      PaymentOverDueAlertLog(),
    ]);
  } catch (error) {
    console.error("Error processing payment due dates:", error.message);
  }
});

cron.schedule("4 17 * * *", async () => {
  try {
    await Promise.all([
      getAccountsExpiringSoon(),
      getAccountsFreeTrailExpired(),
    ]);
    console.log("Subscription Alerts sent successfully.");
  } catch (error) {
    console.log("Error Automation for subscription Alerts:", error.message);
  }
});

export const startSubscriptionExpiryCron = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("🔄 Running subscription expiry check at midnight...");

    try {
      const now = new Date();

      const result = await User.updateMany(
        {
          is_subscribed: true,
          trial_expiry: { $lt: now.toISOString() },
        },
        {
          $set: {
            is_subscribed: false,
            free_trial: false,
            subscription_status:"expired"
          },
        },
      );

      console.log(
        `✅ Subscription expiry cron completed. Updated ${result.modifiedCount} users.`,
      );
    } catch (error) {
      console.error("❌ Subscription expiry cron failed:", error);
    }
  });
};
