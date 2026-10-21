import React from "react";

const stats = [
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
        value: "50K+",
        label: "Invoices generated",
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
            </svg>
        ),
        value: "₹100M+",
        label: "Payments processed",
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
        ),
        value: "3X Faster",
        label: "Business operations",
    },
    {
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
        value: "99.9%",
        label: "Secure platform uptime",
    },
];

const StatsBar = () => {
    return (
        <div className="relative z-10 border-0 border-gray-200 mx-4 sm:mx-6 lg:mx-8 rounded-2xl bg-white mt-16 mb-12">
            <div className="max-w-6xl 2xl:max-w-9xl mx-auto px-6 py-6">
                {/* <p className="text-center text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-6">
          Powered by Real Numbers
        </p> */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x-0 sm:divide-x divide-gray-100">
                    {stats.map((stat, i) => (
                        <div key={i} className="flex flex-col items-center text-center px-4">
                            <div className="mb-2">{stat.icon}</div>
                            <p className="text-[22px] font-black text-gray-900">{stat.value}</p>
                            <p className="text-[12px] text-gray-400 mt-0.5">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatsBar;