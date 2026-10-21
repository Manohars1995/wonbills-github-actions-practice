import { PRICING } from "./Subscription.constants";

const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const SubscriptionProView = ({
  subscription,
  loading,
  cancelLoading,
  onSubscribe,
  onCancel,
}) => {
  const isYearly = subscription.planType === "yearly";
  const billingInfo = isYearly
    ? `Yearly billing at ₹${PRICING.yearly}/yr (~₹${Math.round(PRICING.yearly / 12)}/mo)`
    : `Monthly billing at ₹${PRICING.monthly}/month`;

  return (
    <div className="max-w-md mx-auto p-5">
      {/* Status Card */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-emerald-800 font-semibold text-base">
              Pro Subscription Active
            </p>
            <p className="text-emerald-600 text-sm mt-1">{billingInfo}</p>
            {subscription.expiryDate && (
              <p className="text-emerald-600 text-xs mt-0.5">
                Next billing: {formatDate(subscription.expiryDate)}
              </p>
            )}
            <span className="inline-block mt-2 bg-emerald-100 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full">
              {isYearly ? "Yearly Plan" : "Monthly Plan"}
            </span>
          </div>
          <span className="flex items-center gap-1.5 bg-white text-emerald-700 text-xs font-medium px-3 py-1 rounded-full border border-emerald-200 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Active
          </span>
        </div>
      </div>

    

      {/* Cancel */}
      <button
        type="button"
        onClick={onCancel}
        disabled={cancelLoading}
        className="w-full py-3 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-60"
      >
        {cancelLoading ? "Cancelling…" : "Cancel Subscription"}
      </button>
    </div>
  );
};

export default SubscriptionProView;