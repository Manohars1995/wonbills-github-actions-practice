const express = require('express');
const router = express.Router();
const authControllers = require("../controllers/auth-controllers");
const { authenticateToken } = require("../middleware/check-auth");
router.get("/me", authenticateToken, authControllers.getMe);
router.post("/logout", authControllers.logout);

router.post("/signup/send-otp", authControllers.sendOtpOnRegisterUser);
// sign in routes
router.post("/send-otp/sign-in", authControllers.sendOtpOnSignin);
router.post("/verify-otp/sign-in", authControllers.verifyLoginOtp);

// sign up routes
router.post("/signup/verify-otp", authControllers.verifySignUpOtp);
router.post("/signup/user", authControllers.registerUser);

router.get("/get-subscription/status", authenticateToken, authControllers.checkSubscriptionStatus);
router.delete("/de-activate/account", authenticateToken, authControllers.deactivateAccountById);

router.put("/update-intro", authenticateToken, authControllers.updateIntroStatus);

module.exports = router