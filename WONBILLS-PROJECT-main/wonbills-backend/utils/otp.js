const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendPhoneOTP = async (phone, otp) => {
  const AuthKey = process.env.SMSLOGIN_AUTH_KEY;
  const SenderID = process.env.SMSLOGIN_SENDER_ID;
  const UserName = process.env.SMSLOGIN_USERNAME;
  const TemplateID = process.env.SMSLOGIN_TEMPLATE_ID;

  const minutes = 3;
  const safePhone = phone.slice(1);

  // ⚠️ MUST MATCH DLT TEMPLATE EXACTLY
  const appName = "WONAPP";
  const Message =
    `Dear User, your OTP for ${appName} verification is ${otp}. ` +
    `This OTP is valid for ${minutes} minutes. Do not disclose it. NOWIT SERVICES`;

  try {
    const res = await axios.get("https://smslogin.co/v3/api.php", {
      params: {
        username: UserName,
        apikey: AuthKey,
        senderid: SenderID,
        mobile: `${safePhone}`,
        message: Message,
        templateid: TemplateID,
      },
    });

    return res.data;
  } catch (err) {
    console.error("SMS send error:", err?.response?.data || err.message);
    throw new Error("Failed to send OTP");
  }
};

const normalizePhone = (phone) => phone.replace(/\D/g, ""); // keep digits only

module.exports = {
  generateOTP,
  sendPhoneOTP,
  normalizePhone,
};
