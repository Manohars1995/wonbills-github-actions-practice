import { PRICING, PRO_FEATURES, YEARLY_SAVING } from "./Subscription.constants";

const CheckIcon = () => (
  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
    <svg width="10" height="10" viewBox="0 0 10 10">
      <polyline
        points="1.5,5 4,7.5 8.5,2.5"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

const ProPlanCard = ({ selectedPlan, isExpired, isTrial, loading, onSubscribe }) => {
  const isYearly = selectedPlan === "yearly";
  const price = isYearly ? PRICING.yearly : PRICING.monthly;
  const period = isYearly ? "/year" : "/month";

  const ctaText = isExpired
    ? "Renew Subscription"
    : isTrial
    ? "Upgrade to Pro"
    : "Start Pro Plan";

  return (
    <div className="bg-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
      {/* decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/[0.03] rounded-full pointer-events-none" />

      <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
        ⚡ Most Popular
      </span>

      <p className="text-[10px] tracking-widest uppercase opacity-60 mb-1">Premium Plan</p>
      <p className="text-xl font-bold mb-1">WonBills Pro</p>
      <p className="text-xs opacity-60 mb-5">
        ↻ Auto-renews {isYearly ? "yearly" : "monthly"} · Cancel anytime
      </p>

      <div className="flex items-end gap-2 mb-5 flex-wrap">
        <div className="flex items-end gap-1">
          <span className="text-xl opacity-80 mb-1.5">₹</span>
          <span className="text-5xl font-bold leading-none">
            {isYearly ? "9,999" : "999"}
          </span>
          <span className="text-sm opacity-70 mb-1.5">{period}</span>
        </div>
        {isYearly && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm opacity-50 line-through">
              ₹{(PRICING.monthly * 12).toLocaleString("en-IN")}
            </span>
            <span className="bg-green-400 text-green-900 text-xs font-bold px-2 py-0.5 rounded-full">
              16.5% off
            </span>
          </div>
        )}
      </div>

      <ul className="space-y-2.5 mb-6">
        {PRO_FEATURES.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-sm opacity-90">
            <CheckIcon />
            {f}
          </li>
        ))}
        {isYearly && (
          <li className="flex items-center gap-2.5 text-sm text-green-300 font-semibold">
            <CheckIcon />
            Save ₹{YEARLY_SAVING} annually
          </li>
        )}
      </ul>

      <button
        type="button"
        onClick={() => onSubscribe(selectedPlan)}
        disabled={loading}
        className="w-full py-4 bg-white text-indigo-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-transform active:scale-[.99] disabled:opacity-60"
      >
        {loading ? "Processing…" : `${ctaText} · ₹${isYearly ? "9,999/yr" : "999/mo"}`}
        {!loading && <span>→</span>}
      </button>
    </div>
  );
};

export default ProPlanCard;