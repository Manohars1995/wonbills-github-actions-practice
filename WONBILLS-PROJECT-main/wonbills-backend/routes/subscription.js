// subscription.routes.ts
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/check-auth");
const subscriptionControllers = require("../controllers/subscription-controllers");

router.post(
  "/create",
  authenticateToken,
  subscriptionControllers.createSubscription,
);
router.post(
  "/verify-status",
  authenticateToken,
  subscriptionControllers.verifySubscriptionStatus,
);
router.post("/webhook", subscriptionControllers.subscriptionWebhook);
router.post(
  "/cancel",
  authenticateToken,
  subscriptionControllers.cancelSubscription,
);

module.exports = router;
