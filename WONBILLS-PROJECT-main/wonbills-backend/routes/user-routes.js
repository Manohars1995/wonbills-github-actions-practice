const express = require('express');
const router = express.Router();
const userControllers = require("../controllers/user-controllers");
const { authenticateToken } = require("../middleware/check-auth");



router.post("/create/subscription/order", authenticateToken, userControllers.createSubscriptionPaymentOrder);
router.get("/check-subscription/status", authenticateToken, userControllers.checkSubscriptionStatus);
router.get("/profile", authenticateToken, userControllers.getProfile);
router.put("/update/profile", authenticateToken, userControllers.updateProfile)
router.get("/business-profile", authenticateToken, userControllers.getBusinessProfile)
router.get("/kyc", authenticateToken, userControllers.getKYCDetails);
router.put('/toggle/alerts', authenticateToken, userControllers.toggleAlerts);
router.put('/toggle/notifications', authenticateToken, userControllers.toggleNotifications);
router.get('/alerts/notifications', authenticateToken, userControllers.getAlertsNotifications);
router.put('/inv/temp', authenticateToken, userControllers.updateInvoiceTemplate);
router.put('/upload/logo/sig', authenticateToken, userControllers.updateLogoSig);
router.put('/update/bank-details/kyc', authenticateToken, userControllers.updateKYCDetails);
router.get("/verify-payment/:paymentId",authenticateToken, userControllers.verifyAndUpdateSubscription);
router.post("/create/subscription/link", authenticateToken, userControllers.paymentLink);

module.exports = router;