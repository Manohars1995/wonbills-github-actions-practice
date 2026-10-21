// context/WonBillsProvider.jsx
import { createContext, useEffect, useState, useCallback } from "react";
import { logoutUser, getSubsDetails } from "../services/auth/auth";
import { registerLogoutFunction } from "../services/api";

const WonBillsContext = createContext();

export const WonBillsContextProvider = ({ children }) => {
  /* ---------- UI STATE ---------- */
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [pathText, setPathText] = useState("");
  const [alerts, setAlerts] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [selectedTemplate, setSelecetdTemplate] = useState(1);
  const [profilePicture, setProfilePicture] = useState("");
  const [isNavExpanded, setNavExpanded] = useState(false);
  const [businessLogo, setBusinessLogo] = useState("");
  const [isNotifyOpen, setNotifyOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  /* ---------- SUBSCRIPTION STATE ---------- */
  const [subscription, setSubscription] = useState({
    label: "",
    type: "loading", // loading | trial | pro | expired | free | error
    planType: null, // null | "monthly" | "yearly"
    remainingDays: null,
    expiryDate: null,
    cancelledAtCycleEnd: false,
  });

  /* ---------- AUTH STATE ---------- */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userID, setUserID] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  /* ---------- USER DATA ---------- */
  const [userData, setUserData] = useState({});

  /* =====================================================
     SUBSCRIPTION FETCH (BACKEND IS SOURCE OF TRUTH)
  ===================================================== */
  const fetchSubscriptionStatus = useCallback(async () => {
    if (!userID) return;

    try {
      const response = await getSubsDetails();
      const data = response.data;

      switch (data?.subscription_status) {
        case "trial":
          setSubscription({
            label: `Free Trial - ${data.remainingDays || 0} days left`,
            type: "trial",
            planType: null,
            remainingDays: data.remainingDays || 0,
            expiryDate: data.trial_expiry || null,
            cancelledAtCycleEnd: false,
          });
          break;

        case "active":
          const planType = data.planType || data.current_plan || "monthly";
          const isCancelled = data.cancelledAtCycleEnd || data.subscription_cancelled_at_cycle_end || false;
          
          setSubscription({
            label: `Pro - Active (${planType === "yearly" ? "Yearly" : "Monthly"})`,
            type: "pro",
            planType: planType,
            remainingDays: null,
            expiryDate: data.subscription_end || data.current_period_end || null,
            cancelledAtCycleEnd: isCancelled,
          });
          break;

        case "expired":
          setSubscription({
            label: "Pro - Expired",
            type: "expired",
            planType: data.planType || data.current_plan || null,
            remainingDays: 0,
            expiryDate: data.subscription_end || null,
            cancelledAtCycleEnd: false,
          });
          break;

        case "free":
          setSubscription({
            label: "Free Plan",
            type: "free",
            planType: null,
            remainingDays: null,
            expiryDate: null,
            cancelledAtCycleEnd: false,
          });
          break;

        default:
          setSubscription({
            label: "Unknown Status",
            type: "error",
            planType: null,
            remainingDays: null,
            expiryDate: null,
            cancelledAtCycleEnd: false,
          });
      }
    } catch (err) {
      console.error("Subscription fetch failed:", err);
      setSubscription({
        label: "Error loading status",
        type: "error",
        planType: null,
        remainingDays: null,
        expiryDate: null,
        cancelledAtCycleEnd: false,
      });
    }
  }, [userID]);

  /* =====================================================
     UPDATE SUBSCRIPTION (FOR REAL-TIME UPDATES)
     Used by Subscription component after payments
  ===================================================== */
  const updateSubscription = useCallback((newSubscriptionData) => {
    setSubscription((prev) => ({
      ...prev,
      ...newSubscriptionData,
    }));
  }, []);

  /* =====================================================
     LOGOUT (SINGLE SOURCE OF TRUTH)
  ===================================================== */
  const logout = async () => {
    try {
      await logoutUser();
    } catch (_) {
      // ignore
    } finally {
      setIsLoggedIn(false);
      setUserRole("");
      setUserID("");
      setUserData({});
      setAuthLoading(false);

      setSubscription({
        label: "",
        type: "loading",
        planType: null,
        remainingDays: null,
        expiryDate: null,
        cancelledAtCycleEnd: false,
      });

      window.location.href = "/signin";
    }
  };

  /* ---------- REGISTER LOGOUT WITH AXIOS ---------- */
  useEffect(() => {
    registerLogoutFunction(logout);
  }, []);

  /* ---------- FETCH SUBSCRIPTION AFTER LOGIN ---------- */
  useEffect(() => {
    if (isLoggedIn && userID) {
      fetchSubscriptionStatus();
    }
  }, [isLoggedIn, userID, fetchSubscriptionStatus]);

  /* =====================================================
     CONTEXT VALUE
  ===================================================== */
  const value = {
    /* UI */
    activeTab,
    pathText,
    alerts,
    notifications,
    companyName,
    timezone,
    selectedTemplate,
    profilePicture,
    isNavExpanded,
    businessLogo,
    isNotifyOpen,
    subscription,
    isCalculatorOpen,

    /* AUTH */
    isLoggedIn,
    userRole,
    userID,
    authLoading,

    /* DATA */
    userData,

    /* SETTERS */
    setActiveTab,
    setPathText,
    setAlerts,
    setNotifications,
    setCompanyName,
    setTimezone,
    setSelecetdTemplate,
    setProfilePicture,
    setNavExpanded,
    setBusinessLogo,
    setNotifyOpen,
    setIsLoggedIn,
    setUserRole,
    setUserID,
    setAuthLoading,
    setUserData,
    setIsCalculatorOpen,
    setSubscription,

    /* ACTIONS */
    fetchSubscriptionStatus,
    updateSubscription,
    logout,
  };

  return (
    <WonBillsContext.Provider value={value}>
      {children}
    </WonBillsContext.Provider>
  );
};

export { WonBillsContext };
export default WonBillsContextProvider;