import React from "react";

const featuresData = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
        <path d="M3 3h18v18H3z" />
        <path d="M8 12h8" />
        <path d="M12 8v8" />
      </svg>
    ),
    title: "80% Less Manual Work",
    desc: "Automate invoices, payments, expenses, and client management from one platform.",
    tag: "Automation",
    tagBg: "#dbeafe",
    tagColor: "#1d4ed8",
    cardBg: "#eff6ff",
    cardBorder: "#bfdbfe",
    iconBg: "#dbeafe",
    iconHoverBg: "#bfdbfe",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: "3X Faster Operations",
    desc: "Manage billing, clients, payments, and business workflows from one dashboard.",
    tag: "Efficiency",
    tagBg: "#dcfce7",
    tagColor: "#15803d",
    cardBg: "#f0fdf4",
    cardBorder: "#bbf7d0",
    iconBg: "#dcfce7",
    iconHoverBg: "#bbf7d0",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "90% Fewer Billing Errors",
    desc: "Avoid duplicate entries, missed invoices, and manual calculation mistakes.",
    tag: "Reliable",
    tagBg: "#fae8ff",
    tagColor: "#7e22ce",
    cardBg: "#fdf4ff",
    cardBorder: "#f0abfc",
    iconBg: "#fae8ff",
    iconHoverBg: "#f0abfc",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
    title: "2X Faster Payments",
    desc: "Accept UPI, cards, net banking, cheque, cash, and online payments seamlessly.",
    tag: "Payments",
    tagBg: "#fef9c3",
    tagColor: "#a16207",
    cardBg: "#fff7ed",
    cardBorder: "#fed7aa",
    iconBg: "#fef9c3",
    iconHoverBg: "#fed7aa",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "70% Better Financial Visibility",
    desc: "Track revenue, expenses, due invoices, and business growth in real time.",
    tag: "Insights",
    tagBg: "#ede9fe",
    tagColor: "#6d28d9",
    cardBg: "#f0f9ff",
    cardBorder: "#bae6fd",
    iconBg: "#e0f2fe",
    iconHoverBg: "#bae6fd",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      </svg>
    ),
    title: "Future-Ready Platform",
    desc: "Built for digital payments, cloud workflows, and scalable business growth.",
    tag: "2026 Ready",
    tagBg: "#fce7f3",
    tagColor: "#be185d",
    cardBg: "#fdf2f8",
    cardBorder: "#fbcfe8",
    iconBg: "#fce7f3",
    iconHoverBg: "#fbcfe8",
  },
];

const Features = () => {
  return (
    <section id="solutions" className="w-full bg-gray-50 py-20 px-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[12px] font-bold text-blue-500 tracking-widest uppercase mb-3">
            Features
          </p>
          <h2 className="text-[32px] sm:text-[38px] font-black text-gray-900 leading-tight mb-4">
            Everything you need to manage billing
          </h2>
          <p className="text-[15px] text-gray-500 max-w-md mx-auto">
            Powerful tools to simplify your billing process and grow your business.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresData.map((f, i) => (
            <div
              key={i}
              className="rounded-2xl p-7 border hover:shadow-lg transition-shadow duration-300 group relative"
              style={{ backgroundColor: f.cardBg, borderColor: f.cardBorder }}
            >
              {/* Tag - top right corner */}
              <span
                className="absolute top-4 right-4 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: f.tagBg, color: f.tagColor }}
              >
                {f.tag}
              </span>

              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors"
                style={{ backgroundColor: f.iconBg }}
              >
                {f.icon}
              </div>
              <h3 className="text-[16px] font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;