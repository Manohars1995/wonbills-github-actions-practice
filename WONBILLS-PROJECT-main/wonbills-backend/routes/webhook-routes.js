const express = require('express');
const router = express.Router();
const webhookControllers = require("../controllers/webhook-controllers")

router.post("/razorpay-payment-webhook", webhookControllers.transferAmoutToLinkedAccWebhook);
router.post("/subscription-webhook", webhookControllers.subscriptionWebhook);
router.post("/bank-account-status-webhook", webhookControllers.LinkedAccountStatusUpdateWebhook);

module.exports = router;