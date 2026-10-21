import { useState } from "react";

export const usePlanToggle = (defaultPlan = "monthly") => {
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan);

  const isMonthly = selectedPlan === "monthly";
  const isYearly = selectedPlan === "yearly";

  return { selectedPlan, setSelectedPlan, isMonthly, isYearly };
};