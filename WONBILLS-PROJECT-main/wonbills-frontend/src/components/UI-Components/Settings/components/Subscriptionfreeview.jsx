import CurrentPlanCard from "./Currentplancard";
import PlanToggle from "./Plantoggle";
import ProPlanCard from "./Proplancard";
import { usePlanToggle } from "./Useplantoggle";

const SubscriptionFreeView = ({ subscription, loading, onSubscribe }) => {
  const { selectedPlan, setSelectedPlan } = usePlanToggle("monthly");

  const isTrial = subscription.type === "trial";
  const isExpired = subscription.type === "expired";
  const showCurrentCard = isTrial || subscription.type === "free";

  return (
    <div className="max-w-md mx-auto p-5">
      <p className="text-center text-xs font-semibold tracking-widest text-gray-400 uppercase mb-5">
        Unlock the full power of WonBills
      </p>

      {showCurrentCard && <CurrentPlanCard subscription={subscription} />}

      <PlanToggle selectedPlan={selectedPlan} onSelect={setSelectedPlan} />

      <ProPlanCard
        selectedPlan={selectedPlan}
        isExpired={isExpired}
        isTrial={isTrial}
        loading={loading}
        onSubscribe={onSubscribe}
      />

      <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-gray-400">
        <span>🔒 Secure</span>
        <span>💳 Razorpay</span>
        <span>↩ Cancel anytime</span>
      </div>
    </div>
  );
};

export default SubscriptionFreeView;