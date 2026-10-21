import React from "react";
import { useState, useEffect } from "react";

const screenshots = [
  "YOUR_SCREENSHOT_1.png",
  "YOUR_SCREENSHOT_2.png",
  "YOUR_SCREENSHOT_3.png",
  "YOUR_SCREENSHOT_4.png",
];

const LaptopFrame = () => {
  const [cur, setCur] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCur(p => (p + 1) % screenshots.length), 3500);
    return () => clearInterval(t);
  }, []);

  const go = (idx) => setCur((idx + screenshots.length) % screenshots.length);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Lid */}
      <div className="w-[96%] relative" style={{ background: "#2d2d2f", borderRadius: "14px 14px 0 0", border: "1.5px solid #1a1a1c", borderBottom: "none", padding: "10px 10px 0" }}>
        {/* Camera dot */}
        <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[7px] h-[7px] rounded-full" style={{ background: "#4a4a4c", border: "1px solid #3a3a3c" }} />
        {/* Screen bezel */}
        <div style={{ background: "#1a1a1c", borderRadius: "8px 8px 0 0", padding: "20px 8px 0" }}>
          {/* Screen */}
          <div className="relative overflow-hidden" style={{ borderRadius: "4px 4px 0 0", aspectRatio: "16/10", background: "#fff" }}>
            {/* Slides */}
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${cur * 100}%)` }}
            >
              {screenshots.map((src, i) => (
                <img key={i} src={src} alt={`Screen ${i + 1}`} className="min-w-full h-full object-cover flex-shrink-0" />
              ))}
            </div>

            {/* Badge */}
            <div className="absolute bottom-2.5 right-2.5 bg-white rounded-xl flex items-center gap-2 px-2.5 py-1.5" style={{ border: "0.5px solid #e5e7eb" }}>
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <p className="text-[8px] text-gray-400 leading-tight">Invoice Paid</p>
                <p className="text-[10px] font-bold text-gray-900 leading-tight">Rs 12,500.000</p>
              </div>
            </div>

            {/* Nav buttons */}
            <button onClick={() => go(cur - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full w-6 h-6 flex items-center justify-center text-xs text-gray-700 z-10" style={{ border: "0.5px solid #e5e7eb" }}>&#8592;</button>
            <button onClick={() => go(cur + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full w-6 h-6 flex items-center justify-center text-xs text-gray-700 z-10" style={{ border: "0.5px solid #e5e7eb" }}>&#8594;</button>
          </div>
        </div>
      </div>

      {/* Hinge bar */}
      <div className="w-[103%]" style={{ height: 12, background: "#3a3a3c", borderTop: "1.5px solid #505052", borderBottom: "1.5px solid #1a1a1c" }} />

      {/* Base + keyboard */}
      <div className="w-[96%] flex flex-col items-center">
        <div className="w-full flex items-center gap-[2px] px-2 overflow-hidden" style={{ height: 10, background: "#252527", border: "1px solid #1a1a1c", borderTop: "none" }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="flex-1 max-w-[18px]" style={{ height: 4, background: "#333335", borderRadius: 1 }} />
          ))}
        </div>
        <div className="w-full relative" style={{ height: 18, background: "#2d2d2f", borderRadius: "0 0 2px 2px", border: "1.5px solid #1a1a1c", borderTop: "none" }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: "28%", height: 4, background: "#1a1a1c", borderRadius: "3px 3px 0 0" }} />
        </div>
      </div>

      {/* Foot */}
      <div style={{ width: "108%", height: 6, background: "#222224", borderRadius: "0 0 10px 10px" }} />

      {/* Dots */}
      <div className="flex gap-1.5 mt-2.5">
        {screenshots.map((_, i) => (
          <button key={i} onClick={() => go(i)} className={`w-1.5 h-1.5 rounded-full border-none cursor-pointer p-0 transition-all ${i === cur ? "bg-blue-500 scale-125" : "bg-gray-300"}`} />
        ))}
      </div>
    </div>
  );
};

/* ─── Dashboard / Visibility Section ─── */
const DashboardSection = () => (
  <section className="w-full bg-white py-20 px-2">
    <style>{`
      .dashboard-img-wrap img {
        transition: transform 1.5s ease;
      }
      .dashboard-img-wrap:hover img {
        transform: scale(1.18);
      }
    `}</style>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

        {/* Left: Billing image */}
        <div className="flex-1 w-full max-w-lg">
          <div
            className="dashboard-img-wrap relative rounded-2xl overflow-hidden cursor-pointer"
            style={{ minHeight: "280px" }}
          >
            <img
              src="https://res.cloudinary.com/dtb4vozhy/image/upload/v1778503549/ChatGPT_Image_May_11_2026_06_15_19_PM_hzsxcx.png"
              alt="Billing Dashboard"
              className="w-full h-full object-cover rounded-2xl"
              style={{ minHeight: "300px" }}
            />

            {/* Invoice paid badge */}
            <div className="absolute bottom-5 right-5 bg-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] text-gray-400">Invoice Paid</p>
                <p className="text-[12px] font-bold text-gray-800">Rs 12,500.000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Text */}
        <div className="flex-1">
          <h2 className="text-[30px] sm:text-[36px] font-black text-gray-900 leading-tight mb-4">
            Complete visibility into your business finances
          </h2>
          <p className="text-[14px] text-gray-500 leading-relaxed mb-8">
            Our dashboard provides real-time insights into your revenue, outstanding invoices, and customer behavior.
          </p>
          <div className="space-y-6">
            {[
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Real-Time Business Insights",
    desc: "Track revenue, cash flow, expenses, and business growth instantly.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    title: "Invoice & Payment Tracking",
    desc: "Monitor invoice status, payments, dues, and transactions in real time.",
  },

  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    ),
    title: "Unified Business Dashboard",
    desc: "Access invoices, payments, clients, products, and reports from one place.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: "Faster Decision Making",
    desc: "Make smarter business decisions with accurate live business data.",
  },
].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  </section>
);

/* ─── How It Works: 3 Steps ─── */
const HowItWorks = () => {
  const steps = [
  {
    step: "1",
    title: "Setup Your Business",
    desc: "Add clients, products, services, taxes, and payment details in minutes.",
    arrowColor: "#3b82f6",
    iconBg: "#eff6ff",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="2" fill="#bfdbfe" />
        <path d="M7 8h10" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 12h6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        <circle cx="17" cy="16" r="3" fill="#3b82f6" />
      </svg>
    ),
  },
  {
    step: "2",
    title: "Generate & Schedule Invoices",
    desc: "Create professional invoices and automate billing whenever needed.",
    arrowColor: "#22c55e",
    iconBg: "#f0fdf4",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="14" height="18" rx="2" fill="#86efac" />
        <path d="M8 8h6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 12h8" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="18" r="4" fill="#22c55e" />
        <path d="M18 16v2l1.5 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    step: "3",
    title: "Get Paid Your Way",
    desc: "Accept and track UPI, card, bank transfer, cash, and cheque payments.",
    arrowColor: "#f59e0b",
    iconBg: "#fffbeb",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="6" width="20" height="12" rx="2" fill="#fde68a" />
        <rect x="2" y="9" width="20" height="3" fill="#f59e0b" />
        <circle cx="17" cy="15" r="3" fill="#f59e0b" />
        <polyline
          points="16,15 17,16 19,14"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
];
 
  return (
    <section className="w-full bg-gray-50 py-20 px-3">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
 
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[12px] font-bold text-blue-500 tracking-widest uppercase mb-3">
            How It Works
          </p>
          <h2 className="text-[28px] sm:text-[38px] font-black text-gray-900 mb-4">
            From Invoice to Income
          </h2>
          <p className="text-[15px] text-gray-500 max-w-md mx-auto">
            Start managing your billing in just a few minutes, no technical skills required.
          </p>
        </div>
 
        {/* ── Desktop ── */}
        <div className="hidden sm:block">
 
          {/* Row 1: dashed line + circles */}
          <div className="relative flex items-center mb-0" style={{ height: "88px" }}>
 
            {/* Dashed line — full width */}
            <div
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-0"
              style={{ borderTop: "2.5px dashed #93c5fd" }}
            />
 
            {/* Left dot */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-3 h-3 rounded-full bg-blue-500" />
 
            {/* Right dot */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-3 h-3 rounded-full bg-blue-500" />
 
            {/* Circles — evenly spaced at 1/6, 3/6, 5/6 of width */}
            {steps.map((item, i) => (
              <div
                key={i}
                className="absolute z-10"
                style={{
                  left: `calc(${(i * 2 + 1) * (100 / 6)}% - 40px)`,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <div className="w-20 h-20 rounded-full bg-white border-[3px] border-blue-400 flex items-center justify-center shadow-lg shadow-blue-100">
                  <span className="text-[28px] font-black text-blue-500">{item.step}</span>
                </div>
              </div>
            ))}
          </div>
 
          {/* Row 2: arrows + cards — same 3-column grid aligned to circles */}
          <div
            className="grid grid-cols-3"
            style={{ gap: "24px" }}
          >
            {steps.map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center"
                style={{
                  // Offset each column so its center aligns with the circle at 1/6, 3/6, 5/6
                  // col width = 100%/3; circle center = (2i+1)/6 * 100%
                  // They naturally align when grid is full width — just ensure text-center
                }}
              >
                {/* Arrow */}
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "10px solid transparent",
                    borderRight: "10px solid transparent",
                    borderBottom: `12px solid ${item.arrowColor}`,
                    marginBottom: "12px",
                    marginTop: "4px",
                  }}
                />
                {/* Card — full height stretch */}
                <div
                  className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center p-6"
                  style={{ flex: 1 }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 flex-shrink-0"
                    style={{ background: item.iconBg }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-[17px] font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
 
        {/* ── Mobile: stacked rows with connector ── */}
        <div className="flex sm:hidden flex-col">
          {steps.map((item, i) => (
            <div key={i} className="flex flex-col">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center" style={{ width: "56px", flexShrink: 0 }}>
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-blue-400 flex items-center justify-center shadow-sm">
                    <span className="text-[20px] font-black text-blue-500">{item.step}</span>
                  </div>
                </div>
                <div className="pt-2 flex-1">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                    style={{ background: item.iconBg }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-[17px] font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex" style={{ width: "56px" }}>
                  <div style={{ margin: "6px auto 6px", width: "2px", height: "28px", borderLeft: "2px dashed #bfdbfe" }} />
                </div>
              )}
            </div>
          ))}
        </div>
 
      </div>
    </section>
  );
};

/* ─── Combined InvoicesTemps export ─── */
const InvoicesTemps = () => (
  <>
    <DashboardSection />
    <HowItWorks />
  </>
);

export default InvoicesTemps;
