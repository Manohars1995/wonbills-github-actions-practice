import { useState, Fragment } from "react";
import { useLanguage } from "./LanguageContext";
import { formatPrice } from "./Currency";
import { getPricingLabels } from "./pricingLabels"; // ← CHANGED: import label dictionary

const Pricing = () => {
  const [yearly, setYearly] = useState(false);
  const { language } = useLanguage();
  const t = getPricingLabels(language.code); 

  const plans = [
    {
      name: "Basic",
      desc: "Perfect for small businesses getting started.",
      monthlyPriceINR: 99000,
      yearlyPriceINR: 79000,
      isTrial: true,
      cta: "Start Free Trial",
      highlighted: false,
      features: [
        "Up to 50 invoices / month",
        "1 User",
        "Basic Reports",
        "Email Support",
      ],
    },
    {
      name: "Pro",
      desc: "Ideal for growing business needs more power.",
      monthlyPriceINR: 499,
      yearlyPriceINR: 4999,
      cta: "Get Started",
      highlighted: true,
      badge: "Most Popular",
      features: [
        "Up to 500 invoices / month",
        "5 Users",
        "Advanced Reports",
        "Priority Support",
        "Multi-terminal Support",
      ],
    },
    {
      name: "Enterprise",
      desc: "For large enterprises with complex needs.",
      isCustom: true,
      cta: "Contact Sales",
      highlighted: false,
      features: [
        "Unlimited Invoices",
        "Unlimited Users",
        "Custom Reports",
        "24/7 Phone Support",
        "Custom Integrations",
      ],
    },
  ];

  const handleGetStarted = () => {
    const el = document.getElementById("support");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else window.location.href = "#support";
  };

  const handleContactSales = () => {
    window.location.href = "#contact";
  };

  return (
    <section id="pricing" className="w-full bg-white py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[12px] font-bold text-blue-500 tracking-widest uppercase mb-0">
            Pricing
          </p>
          <h2 className="text-[28px] sm:text-[38px] font-black text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>

          {/* Toggle */}
          <div className="flex items-center justify-center">
            <div className="flex items-center bg-blue-50 rounded-full p-1 gap-1">
              <button
                onClick={() => setYearly(false)}
                className={`px-5 py-1.5 rounded-full text-[13px] font-bold transition-all ${!yearly ? "bg-blue-500 text-white shadow" : "text-gray-500 hover:text-gray-700"
                  }`}
                translate="no" // ← CHANGED: protect from Google Translate DOM rewrite
              >
                {t.monthly} {/* ← CHANGED: was hardcoded "Monthly" */}
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`px-5 py-1.5 rounded-full text-[13px] font-bold transition-all ${yearly ? "bg-blue-500 text-white shadow" : "text-gray-500 hover:text-gray-700"
                  }`}
                translate="no" // ← CHANGED: protect from Google Translate DOM rewrite
              >
                {t.yearly} {/* ← CHANGED: was hardcoded "Yearly" */}
              </button>
            </div>
          </div>
        </div>
        <div
          className="mx-4 hidden sm:grid gap-x-6"
          style={{
            gridTemplateColumns: "1fr 1fr 1fr",
            gridTemplateRows: "repeat(7, auto)",
          }}
        >
          {plans.map((plan, i) => {
            const priceINR = yearly ? plan.yearlyPriceINR : plan.monthlyPriceINR;
            const col = i + 1;

            const borderColor = plan.highlighted
              ? "border-blue-400"
              : plan.isCustom
                ? "border-slate-200"
                : "border-gray-100";
            const bg = plan.isCustom
              ? "bg-gradient-to-br from-slate-50 to-slate-100"
              : "bg-white";
            const shadow = plan.highlighted
              ? "shadow-xl shadow-blue-100"
              : "shadow-sm";

            return (
              <div
                key={plan.name}
                className={`grid px-7 ${bg} ${borderColor} ${shadow} border-2 rounded-2xl`}
                style={{
                  gridColumn: col,
                  gridRow: "1 / -1",
                  gridTemplateRows: "subgrid",
                }}
              >
                {/* Row 1 — badge area */}
                <div className="pt-5 flex items-center justify-center" style={{ gridRow: 1 }}>
                  {plan.badge ? (
                    <div className="relative flex justify-center w-full" style={{ height: "16px" }}>
                      <span
                        className="bg-blue-500 text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap absolute"
                        style={{ top: "-28px" }}
                      >
                        {plan.badge}
                      </span>
                    </div>
                  ) : (
                    <div style={{ height: "0px" }} />
                  )}
                </div>

                {/* Row 2 — name + trial pill */}
                <div className="pt-2 pb-1 flex items-start justify-between" style={{ gridRow: 2 }}>
                  <h3 className={`text-[18px] font-black leading-tight ${plan.highlighted ? "text-blue-600" : "text-gray-900"}`}>
                    {plan.name}
                  </h3>
                  {plan.isTrial && (
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-200 whitespace-nowrap ml-2 mt-0.5 shrink-0">
                      30-Day Trial
                    </span>
                  )}
                </div>

                {/* Row 3 — description */}
                <div className="pt-1 pb-4" style={{ gridRow: 3 }}>
                  <p className="text-[13px] text-gray-500">{plan.desc}</p>
                </div>

                {/* Row 4 — price */}
                <div className="pb-0 flex flex-col justify-start" style={{ gridRow: 4 }}>
                  {plan.isTrial ? (
                    <>
                      <span className="text-[32px] font-black text-blue-500 leading-none">Free</span>
                      <p className="text-[11px] text-gray-400 mt-1">No credit card required</p>
                    </>
                  ) : plan.isCustom ? (
                    <>
                      <p className="text-[26px] font-black text-slate-700 leading-none">Custom Pricing</p>
                      <p className="text-[12px] text-slate-500 mt-1">Tailored to your scale &amp; requirements</p>
                    </>
                  ) : (
                    <div translate="no"> {/* ← CHANGED: protect dynamic price block from Google Translate DOM rewrite */}
                      <p className={`text-[11px] mb-0.5 ${plan.highlighted ? "text-blue-500" : "text-gray-400"}`}>
                        {t.startsFrom} {/* ← CHANGED: was hardcoded "Starts from" */}
                      </p>
                      <div className="flex items-baseline">
                        <span className="text-[32px] font-black text-gray-900 leading-none">
                          {formatPrice(priceINR, language.code)} {/* unchanged — still your existing currency conversion */}
                        </span>
                        <span className="text-[13px] text-gray-400 ml-1">
                          {yearly ? t.perYear : t.perMonth} {/* ← CHANGED: was hardcoded "/month" */}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 5 — savings badge */}
                <div className="pt-2 pb-0 flex items-center" style={{ gridRow: 5 }}>
                  {yearly && !plan.isCustom && !plan.isTrial ? (
                    <span
                      className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-green-100"
                      translate="no" // ← CHANGED: protect from Google Translate DOM rewrite
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {t.save} 
                    </span>
                  ) : (
                    <span className="invisible text-[11px]">placeholder</span>
                  )}
                </div>

                {/* Row 6 — CTA button */}
                <div className="pt-4 pb-5" style={{ gridRow: 6 }}>
                  <button
                    onClick={plan.isCustom ? handleContactSales : handleGetStarted}
                    className={`w-full py-2.5 rounded-xl text-[14px] font-bold transition-all ${plan.highlighted
                        ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-200"
                        : plan.isCustom
                          ? "bg-slate-800 text-white hover:bg-slate-900 shadow-md shadow-slate-200"
                          : "border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                      }`}
                  >
                    {plan.cta}
                  </button>
                </div>

                {/* Row 7 — divider + features */}
                <div className="pt-0 pb-7" style={{ gridRow: 7 }}>
                  <hr className="border-t border-gray-100 mb-4" />
                  <ul className="space-y-2.5">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-[13px] text-gray-600">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={plan.isCustom ? "#475569" : "#3b82f6"} strokeWidth="2.5" className="shrink-0">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {plan.isCustom && (
                    <p className="text-[11px] text-slate-400 text-center mt-4">
                      We'll get back to you within 24 hours
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile: stacked cards */}
        <div className="sm:hidden flex flex-col gap-6 mx-4">
          {plans.map((plan) => {
            const priceINR = yearly ? plan.yearlyPriceINR : plan.monthlyPriceINR;
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-5 border-2 flex flex-col ${plan.highlighted
                    ? "border-blue-400 shadow-xl shadow-blue-100 pt-8"
                    : plan.isCustom
                      ? "border-slate-200 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100"
                      : "border-gray-100 shadow-sm"
                  }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between mb-1">
                  <h3 className={`text-[18px] font-black ${plan.highlighted ? "text-blue-600" : "text-gray-900"}`}>{plan.name}</h3>
                  {plan.isTrial && (
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-200 ml-2 shrink-0">30-Day Trial</span>
                  )}
                </div>
                <p className="text-[13px] text-gray-500 mb-4">{plan.desc}</p>
                <div className="mb-2">
                  {plan.isTrial ? (
                    <><span className="text-[32px] font-black text-blue-500">Free</span><p className="text-[11px] text-gray-400 mt-1">No credit card required</p></>
                  ) : plan.isCustom ? (
                    <><p className="text-[26px] font-black text-slate-700">Custom Pricing</p><p className="text-[12px] text-slate-500 mt-1">Tailored to your scale &amp; requirements</p></>
                  ) : (
                    <div translate="no"> {/* ← CHANGED: protect dynamic price block from Google Translate DOM rewrite */}
                      <p className={`text-[11px] mb-0.5 ${plan.highlighted ? "text-blue-500" : "text-gray-400"}`}>
                        {t.startsFrom} {/* ← CHANGED: was hardcoded "Starts from" */}
                      </p>
                      <div className="flex items-baseline">
                        <span className="text-[32px] font-black text-gray-900">
                          {formatPrice(priceINR, language.code)} {/* unchanged */}
                        </span>
                        <span className="text-[13px] text-gray-400 ml-1">
                          {yearly ? t.perYear : t.perMonth} {/* ← CHANGED: was hardcoded "/month" */}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {yearly && !plan.isCustom && !plan.isTrial && (
                  <span
                    className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-green-100 mb-3 w-fit"
                    translate="no" // ← CHANGED: protect from Google Translate DOM rewrite
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    {t.save}
                  </span>
                )}
                <button
                  onClick={plan.isCustom ? handleContactSales : handleGetStarted}
                  className={`w-full py-2.5 rounded-xl text-[14px] font-bold transition-all mt-3 mb-5 ${plan.highlighted ? "bg-blue-500 text-white hover:bg-blue-600" : plan.isCustom ? "bg-slate-800 text-white hover:bg-slate-900" : "border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                    }`}
                >
                  {plan.cta}
                </button>
                <hr className="border-t border-gray-100 mb-4" />
                <ul className="space-y-2.5">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-[13px] text-gray-600">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={plan.isCustom ? "#475569" : "#3b82f6"} strokeWidth="2.5" className="shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Pricing;