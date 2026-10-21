const CurrentPlanCard = ({ subscription }) => {
  const isTrial = subscription.type === "trial";
  const isFree = subscription.type === "free";

  return (
    <div className="border border-gray-200 rounded-2xl p-4 bg-white mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
          Current Plan
        </span>
        <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          Active
        </span>
      </div>

      <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
        Free
        <span className="text-sm font-normal text-gray-400 line-through">₹{999}</span>
      </div>

      <p className="text-sm text-gray-500 mt-2 pt-3 border-t border-gray-100">
        {isTrial
          ? `⏳ ${subscription.remainingDays} days remaining on your free trial.`
          : "🎁 Promotional offer — enjoy ₹999 worth of features for free with limited access."}
      </p>
    </div>
  );
};

export default CurrentPlanCard;