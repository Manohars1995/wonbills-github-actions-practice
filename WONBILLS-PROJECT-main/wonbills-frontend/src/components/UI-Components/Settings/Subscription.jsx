import { useContext, useState } from "react";
import { toast } from "sonner";
import { WonBillsContext } from "../../../store/WonBillsContext";
import {
  getSubsDetails,
  createSubscription,
  verifySubscriptionStatus,
  cancelSubscription,
} from "../../../services/auth/auth";
import Accordion from "../../UI-Elements/Accordion";
import SubscriptionFreeView from "./components/Subscriptionfreeview"
import SubscriptionProView from "./components/Subscriptionproview";
import SubscriptionCancellingView from "./components/Subscriptioncancellingview";

const Subscription = () => {
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const { userID, subscription, updateSubscription } = useContext(WonBillsContext);

  const isLoading = subscription.type === "loading";
  const isTrial = subscription.type === "trial";
  const isFree = subscription.type === "free";
  const isExpired = subscription.type === "expired";
  const isPro = subscription.type === "pro";
  const isYearly = subscription.planType === "yearly";
  const isCancelledAtCycleEnd = subscription.cancelledAtCycleEnd || false;

  /* ---------------- VERIFY SUBSCRIPTION (FALLBACK) ---------------- */
  const verifySubscription = async (subscriptionId, toastId) => {
    try {
      const { data } = await verifySubscriptionStatus(subscriptionId);
      if (data.success) {
        updateSubscription({
          label: `Pro - Active (${data.planType === "yearly" ? "Yearly" : "Monthly"})`,
          type: "pro",
          planType: data.planType || "monthly",
          remainingDays: null,
          expiryDate: data.expiryDate,
          cancelledAtCycleEnd: data.subscriptionCancelledAtCycleEnd || false,
        });
        toast.success("Subscription activated successfully!", { id: toastId });
        setTimeout(() => window.location.reload(), 1500);
        return true;
      } else {
        toast.info(data.message || "Payment pending. Please complete the payment.", { id: toastId });
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to verify subscription status", { id: toastId });
      return false;
    }
  };

  /* ---------------- POLL SUBSCRIPTION STATUS ---------------- */
  const pollSubscriptionStatus = async (subscriptionId, toastId) => {
    let attempts = 0;
    const maxAttempts = 10;

    const poll = async () => {
      attempts++;
      try {
        const { data } = await getSubsDetails();

        if (data?.subscription_status === "active") {
          updateSubscription({
            label: `Pro - Active (${data.planType === "yearly" ? "Yearly" : "Monthly"})`,
            type: "pro",
            planType: data.planType || data.current_plan || "monthly",
            remainingDays: null,
            expiryDate: data.subscription_end || data.current_period_end || null,
            cancelledAtCycleEnd: data.cancelledAtCycleEnd || data.subscription_cancelled_at_cycle_end || false,
          });
          toast.success("Subscription activated successfully!", { id: toastId });
          setTimeout(() => window.location.reload(), 1500);
          return;
        }

        if (attempts >= maxAttempts) {
          toast.loading("Verifying payment status...", { id: toastId });
          const verified = await verifySubscription(subscriptionId, toastId);
          if (!verified) {
            toast.info("Payment pending. If you've completed payment, it will reflect shortly.", {
              id: toastId,
              duration: 5000,
            });
          }
          return;
        }

        setTimeout(poll, 3000);
      } catch (error) {
        if (attempts >= maxAttempts) {
          toast.loading("Verifying payment status...", { id: toastId });
          await verifySubscription(subscriptionId, toastId);
        } else {
          setTimeout(poll, 3000);
        }
      }
    };

    poll();
  };

  /* ---------------- HANDLE WINDOW FOCUS ---------------- */
  const handleWindowFocus = (subscriptionId, toastId) => {
    const onFocus = async () => {
      toast.loading("Checking subscription status...", { id: toastId });
      try {
        const { data } = await getSubsDetails();
        if (data?.subscription_status === "active") {
          updateSubscription({
            label: `Pro - Active (${data.planType === "yearly" ? "Yearly" : "Monthly"})`,
            type: "pro",
            planType: data.planType || data.current_plan || "monthly",
            remainingDays: null,
            expiryDate: data.subscription_end || data.current_period_end || null,
            cancelledAtCycleEnd: data.cancelledAtCycleEnd || data.subscription_cancelled_at_cycle_end || false,
          });
          toast.success("Subscription activated!", { id: toastId });
          window.removeEventListener("focus", onFocus);
          setTimeout(() => window.location.reload(), 1500);
        } else {
          await verifySubscription(subscriptionId, toastId);
          window.removeEventListener("focus", onFocus);
        }
      } catch {
        await verifySubscription(subscriptionId, toastId);
        window.removeEventListener("focus", onFocus);
      }
    };

    window.addEventListener("focus", onFocus);
    setTimeout(() => window.removeEventListener("focus", onFocus), 5 * 60 * 1000);
  };

  /* ---------------- SUBSCRIBE HANDLER ---------------- */
  const handleSubscribe = async (planType) => {
    if (!userID) {
      toast.error("Please log in to continue.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await createSubscription({ planType });

      if (!data.success) {
        toast.error(data.message || "Failed to create subscription");
        setLoading(false);
        return;
      }

      const { subscriptionId, shortUrl } = data;

      if (!subscriptionId) {
        toast.error("Invalid subscription response");
        setLoading(false);
        return;
      }

      if (shortUrl) {
        const paymentWindow = window.open(shortUrl, "_blank");
        if (!paymentWindow) {
          toast.error("Please allow popups to complete payment");
          setLoading(false);
          return;
        }

        const toastId = toast.loading("Waiting for payment confirmation...");
        pollSubscriptionStatus(subscriptionId, toastId);
        handleWindowFocus(subscriptionId, toastId);
        setLoading(false);
      } else {
        toast.error("Payment link not received");
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create subscription. Please try again.");
      setLoading(false);
    }
  };

  /* ---------------- CANCEL HANDLER ---------------- */
  const handleCancelSubscription = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel your subscription? You'll retain access until the end of your current billing period."
    );
    if (!confirmCancel) return;

    setCancelLoading(true);
    try {
      const { data } = await cancelSubscription();
      if (data.success) {
        toast.success(data.message || "Subscription will cancel at cycle end");
        updateSubscription({ ...subscription, cancelledAtCycleEnd: true });
      } else {
        toast.error(data.message || "Failed to cancel subscription");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel subscription");
    } finally {
      setCancelLoading(false);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <section className="p-6 text-center text-gray-400 text-sm">
        Loading subscription details…
      </section>
    );
  }

  /* ---------------- RENDER ---------------- */
  return (
    <section>
      <Accordion title={isPro ? "Subscription" : "Subscription Plans"}>
        {/* Active pro — cancelling */}
        {isPro && isCancelledAtCycleEnd && (
          <SubscriptionCancellingView
            subscription={subscription}
            loading={loading}
            onSubscribe={handleSubscribe}
          />
        )}

        {/* Active pro — not cancelling */}
        {isPro && !isCancelledAtCycleEnd && (
          <SubscriptionProView
            subscription={subscription}
            loading={loading}
            cancelLoading={cancelLoading}
            onSubscribe={handleSubscribe}
            onCancel={handleCancelSubscription}
          />
        )}

        {/* Free / Trial / Expired */}
        {(isFree || isTrial || isExpired) && (
          <SubscriptionFreeView
            subscription={subscription}
            loading={loading}
            onSubscribe={handleSubscribe}
          />
        )}

  

      </Accordion>
    </section>
  );
};

export default Subscription;