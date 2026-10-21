import { PRICING } from "./Subscription.constants";

const PlanToggle = ({ selectedPlan, onSelect }) => {
  return (
    <div className="flex bg-gray-100 rounded-xl p-1 gap-1 mb-5">
      <button
        onClick={() => onSelect("monthly")}
        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all text-center ${
          selectedPlan === "monthly"
            ? "bg-white text-indigo-600 shadow-sm border border-gray-200"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Monthly
        <span className="block text-xs font-normal mt-0.5 opacity-70">
          ₹{PRICING.monthly}/mo
        </span>
      </button>

      <button
        onClick={() => onSelect("yearly")}
        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all text-center relative ${
          selectedPlan === "yearly"
            ? "bg-white text-indigo-600 shadow-sm border border-gray-200"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Yearly
        <span className="ml-1.5 inline-block bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full align-middle">
          Save 20%
        </span>
        <span className="block text-xs font-normal mt-0.5 opacity-70">
          ₹{PRICING.yearly}/yr
        </span>
      </button>
    </div>
  );
};

export default PlanToggle;