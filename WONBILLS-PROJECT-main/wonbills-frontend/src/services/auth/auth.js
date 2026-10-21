import api from "../api";

const baseUrl = "/auth";

//  ------------------------------------------------ subscription -------------------------------------------------

// Check subscription status
export const getSubsDetails = () => {
  return api.get(`${baseUrl}/get-subscription/status`);
};

//  ------------------------------------------------ signin -------------------------------------------------

// sends otp on signin for phone & email
export const sendSigninOtp = ({ identifier, type }) => {
  return api.post(`${baseUrl}/send-otp/sign-in`, {
    identifier,
    type, // "phone" | "email"
  });
};

// verifies otp on signin for phone & email
export const verifySignInOtp = ({ identifier, type, otp }) => {
  return api.post(`${baseUrl}/verify-otp/sign-in`, { identifier, type, otp });
};



//  ------------------------------------------------ signup -------------------------------------------------

// sends otp on signup for phone & email
export const sendOtpSignUp = ({ identifier, type }) => {
  return api.post(`${baseUrl}/signup/send-otp`, {
    identifier,
    type, // "phone" | "email"
  });
};

// verifies otp on signup for phone & email
export const verifyOtpSignUp = ({ identifier, type, otp }) => {
  return api.post(`${baseUrl}/signup/verify-otp`, {
    identifier,
    type, // "phone" | "email"
    otp,
  });
};

// registers user after otp verification
export const registerUser = ({ userData }) => {
  if (!userData) return Promise.reject(new Error("user details required"));
  return api.post(`${baseUrl}/signup/user`, userData);
};

// Create Razorpay subscription order
export const createSubscription = (data) => {
  return api.post(`/subscription/create`, data);
};

export const verifySubscriptionStatus = (subsId) => {
  return api.post(`/subscription/verify-status`, { subscriptionId: subsId });
}
export const cancelSubscription = () => {
  return api.post(`/subscription/cancel`);
};

// Check subscription status
export const checkSubscriptionStatus = () => {
  return api.get(`${baseUrl}/user/check-subscription/status`);
};

//  ------------------------------------------------ logout -------------------------------------------------

// logout user
export const logoutUser = () => {
  return api.post(`${baseUrl}/logout`);
};

// ----------------------------------------- delete account -----------------------------------------

export const deleteAccount = () => {
  return api.delete(`${baseUrl}/de-activate/account`);
};
