const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const SubscriptionCancellingView = ({ subscription, loading, onSubscribe }) => {
  const isYearly = subscription.planType === "yearly";

  return (
    <div className="max-w-md mx-auto p-5">
      {/* Status Card */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-4">
        <p className="text-orange-800 font-semibold text-base mb-1">
          Pro Subscription — Cancelling
        </p>
        <p className="text-orange-600 text-sm">
          Your access continues until{" "}
          <span className="font-medium">{formatDate(subscription.expiryDate)}</span>.
          After this date you'll move to the free plan.
        </p>
        <span className="inline-block mt-2 bg-orange-100 text-orange-700 text-xs font-medium px-3 py-1 rounded-full">
          {isYearly ? "Yearly Plan" : "Monthly Plan"}
        </span>
      </div>

      {/* Reactivate / Switch */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
        <p className="text-sm font-medium text-center text-gray-600 mb-3">
          Want to switch? Reactivate or change your plan once it expires.
        </p>
        {/* <button
          type="button"
          onClick={() => onSubscribe(subscription.planType)}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          {loading ? "Processing…" : `Reactivate ${isYearly ? "Yearly" : "Monthly"} Plan`}
        </button>
        <button
          type="button"
          onClick={() => onSubscribe(isYearly ? "monthly" : "yearly")}
          disabled={loading}
          className="w-full py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60"
        >
          {loading ? "Processing…" : `Switch to ${isYearly ? "Monthly" : "Yearly"} Plan`}
        </button> */}
      </div>
    </div>
  );
};

export default SubscriptionCancellingView;