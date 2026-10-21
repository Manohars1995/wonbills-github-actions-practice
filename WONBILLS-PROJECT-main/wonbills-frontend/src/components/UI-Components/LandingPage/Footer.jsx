import React from "react";

const Footer = () => {
  const siteMap = [
    { label: "Home", id: "home" },
    { label: "Features", id: "features" },
    { label: "Pricing", id: "pricing" },
    { label: "Support", id: "support" },
  ];

  const resources = [
    { label: "Help Center", href: "https://nowitservices.com" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Refund Policy", href: "/refund" },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    const container = document.querySelector(".slot-scroll");
    if (el && container) {
      const top = el.getBoundingClientRect().top + container.scrollTop - 72;
      container.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <footer style={{ background: "#0a172a" }} className="py-0 px-3">
      <div className="relative overflow-hidden">
        {/* Diagonal pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #ffffff 0px, #ffffff 1px, transparent 1px, transparent 60px)",
          }}
        />

        <div className=" mx-auto px-4 sm:px-6 lg:px-8 2xl:px-20 py-14 lg:py-8 relative">
          {/* Main grid */}
          <div className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-8 md:gap-12 pb-10 border-b border-white/[0.08]">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                  <img
                    src="https://res.cloudinary.com/dtb4vozhy/image/upload/v1778133397/R6TSM14_dstwcn.png"
                    alt="WON Bills Logo"
                    className="w-full h-full object-contain"
                  />
                  {/* <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-600">
                    <span className="text-white font-extrabold text-[13px] leading-none">W</span>
                  </div> */}
                </div>
                <span className="font-black text-[17px] text-white tracking-wide">
                  WON Bills
                </span>
              </div>

              <p className="text-[14px] text-white/50 leading-relaxed max-w-[360px] mb-5">
                The most powerful all-in-one billing ecosystem for managing invoices, tracking payments, handling expenses, and growing your business.
              </p>

              {/* Social icons */}
              <div className="flex gap-2">
                {[
                  {
                    title: "Facebook",
                    link: "https://www.facebook.com/p/NOWIT-Services-61559601166623/",
                    d: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
                  },
                  {
                    title: "Instagram",
                    link: "https://www.instagram.com/_nowitservices_/",
                    d: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z",
                  },
                  {
                    title: "LinkedIn",
                    link: "https://www.linkedin.com/company/nowitservices/",
                    d: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z",
                  },
                  {
                    title: "YouTube",
                    link: "https://www.youtube.com/@nowitservicesltd",
                    d: "M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z",
                  },
                ].map((s, i) => (
                  <a
                    key={i}
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.title}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:bg-white/20"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255,255,255,0.75)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={s.d} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Site Map */}
            <div>
              <p className="text-sm font-extrabold text-white mb-2">Site Map</p>
              <div className="w-10 h-[3px] bg-blue-600 rounded mb-4" />
              <ul className="space-y-1.5" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {siteMap.map(({ label, id }) => (
                  <li key={label}>
                    <button
                      onClick={() => scrollTo(id)}
                      style={{
                        fontSize: 14,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        textAlign: "left",
                        transition: "color 0.2s",
                        color: "rgba(255,255,255,0.6)",
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,1)"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <p className="text-sm font-extrabold text-white mb-2">Resources</p>
              <div className="w-10 h-[3px] bg-blue-600 rounded mb-4" />
              <ul className="space-y-1.5" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {resources.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : "_self"}
                      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                      style={{
                        fontSize: 14,
                        color: "rgba(255,255,255,0.6)",
                        textDecoration: "none",
                        transition: "color 0.2s",
                        display: "inline-block",
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,1)"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* ISO badge — desktop only */}
            <div className="hidden md:flex items-start justify-start">
              <img
                src="https://res.cloudinary.com/dca9sij3n/image/upload/f_auto,q_auto/fuubxxty3ih0f9wmjkdr"
                alt="ISO 20000-1:2018 Certified"
                className="w-30 h-30 object-contain"
              />
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/40 tracking-wide">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-white/60">WON Bills</span>. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;