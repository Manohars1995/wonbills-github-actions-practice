import { useState, useEffect, useRef } from "react";

const NAV_LINKS = ["Features", "Solutions", "Industries", "Pricing", "Resources", "About Us"];

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="6" width="22" height="16" rx="2" stroke="#F97316" strokeWidth="1.8"/>
        <path d="M9 14h10M14 10v8" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="14" cy="14" r="3" stroke="#F97316" strokeWidth="1.5"/>
      </svg>
    ),
    title: "Weighbridge Automation",
    desc: "Automate the entire weighing process with high accuracy and drastically reduce manual effort across all sites.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="#F97316" strokeWidth="1.8"/>
        <path d="M14 8v6l4 2" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "Real-time Monitoring",
    desc: "Monitor all weighbridges and transactions live from anywhere — full operational visibility 24/7.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="4" width="20" height="20" rx="2" stroke="#F97316" strokeWidth="1.8"/>
        <path d="M9 10h10M9 14h6M9 18h8" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Vehicle & Driver Management",
    desc: "Manage vehicles, drivers and vendors seamlessly with complete records and digital logs.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 22L10 12l5 6 4-8 5 12" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="3" y="3" width="22" height="22" rx="2" stroke="#F97316" strokeWidth="1.8"/>
      </svg>
    ),
    title: "Reports & Analytics",
    desc: "Get accurate, drill-down reports and powerful analytics to make smarter business decisions.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4C9 4 5 8 5 13c0 6 9 11 9 11s9-5 9-11c0-5-4-9-9-9z" stroke="#F97316" strokeWidth="1.8"/>
        <path d="M14 10v4l2 2" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "Cloud Storage",
    desc: "Secure, reliable cloud backup ensures your data is always safe, accessible and redundant.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="10" r="5" stroke="#F97316" strokeWidth="1.8"/>
        <path d="M6 24c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M20 4l2 2-6 6" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Role-based Access",
    desc: "Control user access with granular roles and permissions for better security across your organization.",
  },
];

const STATS = [
  { value: "500+", label: "Happy Customers" },
  { value: "10,000+", label: "Weighments Per Day" },
  { value: "99.99%", label: "Weighing Accuracy" },
  { value: "25+", label: "States Covered" },
];

const INDUSTRIES = [
  { label: "Mining & Quarries", active: true },
  { label: "Cement" },
  { label: "Steel" },
  { label: "Construction" },
  { label: "Aggregates" },
  { label: "Power Plants" },
];

const WHY = [
  "Advanced automation for error-free operations",
  "Real-time insights to improve efficiency",
  "Secure, reliable and scalable cloud platform",
  "Expert support whenever you need it",
];

const TESTIMONIALS = [
  {
    quote:
      "WeighMine has transformed our operations. Real-time data, accurate weighing and easy reporting have improved our productivity and transparency.",
    name: "Ramesh Kumar",
    title: "Operations Head, Superior Mining",
    initials: "RK",
  },
  {
    quote:
      "The automation and cloud backup features alone saved us weeks of manual reconciliation. Highly recommend for any mining operation.",
    name: "Priya Nair",
    title: "IT Director, Coromandel Cement",
    initials: "PN",
  },
  {
    quote:
      "Accurate, reliable and easy to deploy. WeighMine is now the backbone of our weighbridge network across 12 sites.",
    name: "Suresh Reddy",
    title: "COO, Andhra Aggregates Ltd.",
    initials: "SR",
  },
];

function useInView(ref, threshold = 0.15) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return inView;
}

function AnimatedSection({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function WeighMineLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeIndustry, setActiveIndustry] = useState(0);
  const [activeTesti, setActiveTesti] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Barlow', 'DM Sans', sans-serif", background: "#ffffff", color: "#1a1a1a", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Barlow+Condensed:wght@700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        .orange { color: #F97316; }
        .btn-primary {
          background: #F97316;
          color: #fff;
          border: none;
          padding: 14px 30px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s, transform 0.15s;
          font-family: inherit;
          letter-spacing: 0.01em;
        }
        .btn-primary:hover { background: #ea6b05; transform: translateY(-1px); }
        .btn-outline {
          background: transparent;
          color: #1a1a1a;
          border: 1.5px solid #d1d5db;
          padding: 13px 28px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: border-color 0.2s, background 0.2s;
          font-family: inherit;
        }
        .btn-outline:hover { border-color: #F97316; color: #F97316; background: #fff7f2; }
        .feature-card {
          background: #fff;
          border: 1px solid #f0f0f0;
          border-radius: 16px;
          padding: 32px 28px;
          transition: box-shadow 0.25s, transform 0.25s, border-color 0.25s;
        }
        .feature-card:hover {
          box-shadow: 0 12px 40px rgba(249,115,22,0.10);
          transform: translateY(-4px);
          border-color: #fed7aa;
        }
        .stat-card {
          background: #fff;
          border: 1px solid #f0efe8;
          border-radius: 16px;
          padding: 36px 20px;
          text-align: center;
          transition: box-shadow 0.2s;
        }
        .stat-card:hover { box-shadow: 0 8px 32px rgba(249,115,22,0.10); }
        .industry-pill {
          padding: 12px 24px;
          border-radius: 50px;
          border: 1.5px solid #e5e7eb;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          background: #fff;
          color: #374151;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .industry-pill.active, .industry-pill:hover {
          background: #fff7f2;
          border-color: #F97316;
          color: #F97316;
        }
        .why-item { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 22px; }
        .check-circle {
          width: 24px; height: 24px; border-radius: 50%;
          background: #fff7f2; border: 2px solid #F97316;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 2px;
        }
        .testi-card {
          background: #fff;
          border: 1px solid #f0efe8;
          border-radius: 20px;
          padding: 40px 36px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.06);
        }
        .testi-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: #d1d5db; border: none; cursor: pointer;
          transition: background 0.2s, transform 0.2s;
          padding: 0;
        }
        .testi-dot.active { background: #F97316; transform: scale(1.3); }
        .contact-input {
          width: 100%; padding: 13px 16px; border: 1.5px solid #e5e7eb;
          border-radius: 8px; font-size: 15px; font-family: inherit;
          color: #1a1a1a; background: #fff; outline: none;
          transition: border-color 0.2s;
        }
        .contact-input:focus { border-color: #F97316; }
        .nav-link {
          font-size: 15px; font-weight: 500; color: #374151;
          text-decoration: none; transition: color 0.2s;
          padding: 4px 0;
        }
        .nav-link:hover { color: #F97316; }
        .section-label {
          font-size: 12px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #F97316; margin-bottom: 12px;
        }
        .section-title {
          font-family: 'Barlow Condensed', 'Barlow', sans-serif;
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 900;
          line-height: 1.08;
          color: #111827;
        }
        .hero-title {
          font-family: 'Barlow Condensed', 'Barlow', sans-serif;
          font-size: clamp(44px, 7vw, 88px);
          font-weight: 900;
          line-height: 1.0;
          letter-spacing: -0.02em;
        }
        .grid-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }
        .grid-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 48px;
          align-items: center;
        }
        .grid-contact {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr repeat(4, 1fr);
          gap: 40px;
        }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .hide-mobile { display: none !important; }
        }
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr; }
        }
        .trust-strip {
          display: flex; gap: 40px; flex-wrap: wrap;
          align-items: center; justify-content: flex-start;
        }
        .trust-item { display: flex; align-items: center; gap: 10px; }
        .orange-line { width: 40px; height: 3px; background: #F97316; border-radius: 2px; margin-top: 10px; }
        .mobile-menu {
          position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
          background: #fff; z-index: 200; padding: 80px 32px 40px;
          display: flex; flex-direction: column; gap: 24px;
          transform: translateX(100%); transition: transform 0.3s ease;
        }
        .mobile-menu.open { transform: translateX(0); }
        .progress-bar {
          position: absolute; bottom: 0; left: 0; height: 3px;
          background: linear-gradient(90deg, #F97316, #fb923c);
          border-radius: 2px; transition: width 0.3s ease;
        }
        .diagonal-bg {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #fff7f2 0%, #ffffff 50%, #fff 100%);
          z-index: 0;
          clip-path: ellipse(100% 80% at 50% 20%);
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff7f2; border: 1px solid #fed7aa;
          border-radius: 50px; padding: 6px 16px 6px 8px;
          font-size: 13px; font-weight: 600; color: #9a3412;
          margin-bottom: 28px;
        }
        .badge-dot { width: 8px; height: 8px; border-radius: 50%; background: #F97316; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.2)} }
        .floating-card {
          background: #fff; border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.10);
          padding: 20px 24px;
          animation: float 4s ease-in-out infinite;
        }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .decorative-dots {
          display: grid; grid-template-columns: repeat(6,1fr); gap: 10px;
        }
        .d-dot { width:6px; height:6px; border-radius:50%; background:#F97316; opacity: 0.18; }
        .d-dot:nth-child(3n) { opacity: 0.35; }
        .gradient-text {
          background: linear-gradient(135deg, #F97316, #f43f5e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cta-section {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d1a0a 100%);
          border-radius: 24px;
          position: relative;
          overflow: hidden;
        }
        .cta-section::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(249,115,22,0.25) 0%, transparent 70%);
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #f3f4f6" : "none",
        transition: "all 0.3s ease",
        padding: "0 5%",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", height: 70, gap: 48 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, background: "#F97316", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="8" width="16" height="8" rx="2" fill="white"/>
                <circle cx="6" cy="12" r="2" fill="#F97316"/>
                <circle cx="14" cy="12" r="2" fill="#F97316"/>
                <path d="M6 8V5a4 4 0 018 0v3" stroke="white" strokeWidth="1.5"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: 0.5, lineHeight: 1 }}>WeighMine</div>
              <div style={{ fontSize: 9, color: "#9ca3af", letterSpacing: "0.15em", fontWeight: 600, textTransform: "uppercase" }}>Measure. Manage. Move.</div>
            </div>
          </div>

          {/* Nav links */}
          <div className="hide-mobile" style={{ display: "flex", gap: 32, flex: 1 }}>
            {NAV_LINKS.map(l => <a key={l} href="#" className="nav-link">{l}</a>)}
          </div>

          <button className="btn-primary hide-mobile" style={{ marginLeft: "auto", padding: "10px 22px", fontSize: 14 }}>
            Book a Demo <span>→</span>
          </button>

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4, marginLeft: "auto" }} className="hamburger">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
              {menuOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <><path d="M4 6h16M4 12h16M4 18h16"/></>}
            </svg>
          </button>
        </div>
        <style>{`.hamburger { display: none !important; } @media(max-width:900px){ .hamburger { display: flex !important; } }`}</style>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <button onClick={() => setMenuOpen(false)} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        {NAV_LINKS.map(l => <a key={l} href="#" className="nav-link" style={{ fontSize: 22, fontWeight: 700 }} onClick={() => setMenuOpen(false)}>{l}</a>)}
        <button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16 }}>Book a Demo →</button>
      </div>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 70, overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 60% 30%, #fff7ed 0%, #fff 60%)",
          zIndex: 0,
        }}/>
        {/* Decorative dots */}
        <div style={{ position: "absolute", top: 120, right: "8%", zIndex: 1 }}>
          <div className="decorative-dots">
            {Array.from({length: 30}).map((_, i) => <div key={i} className="d-dot"/>)}
          </div>
        </div>

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 5%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", position: "relative", zIndex: 2, width: "100%" }}>
          <div>
            <div className="hero-badge">
              <div className="badge-dot"/>
              Mining & Weighbridge Management App
            </div>
            <h1 className="hero-title">
              Weigh Every Load.<br/>
              <span className="orange">Drive Every Decision.</span>
            </h1>
            <p style={{ fontSize: 18, color: "#6b7280", marginTop: 24, lineHeight: 1.7, maxWidth: 480 }}>
              Smart weighbridge and mining management solution to streamline operations, ensure accuracy and boost productivity across your entire fleet.
            </p>
            <div style={{ display: "flex", gap: 16, marginTop: 36, flexWrap: "wrap" }}>
              <button className="btn-primary" style={{ fontSize: 16, padding: "16px 36px" }}>Book a Demo →</button>
              <button className="btn-outline" style={{ fontSize: 16, padding: "15px 32px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h10M4 18h6"/></svg>
                Explore Features
              </button>
            </div>

            {/* Trust strip */}
            <div className="trust-strip" style={{ marginTop: 48, paddingTop: 36, borderTop: "1px solid #f3f4f6" }}>
              {[
                { icon: "📡", label: "Real-time Data Visibility" },
                { icon: "✅", label: "100% Accurate Weighing" },
                { icon: "☁️", label: "Secure Cloud Backup" },
                { icon: "🌐", label: "Easy to Use Anywhere" },
              ].map(t => (
                <div key={t.label} className="trust-item">
                  <span style={{ fontSize: 18 }}>{t.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", lineHeight: 1.3 }}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            {/* Big orange blob */}
            <div style={{
              position: "absolute",
              width: 420, height: 420,
              borderRadius: "50%",
              background: "radial-gradient(circle, #ffedd5 0%, #fff7ed 60%, transparent 100%)",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 0,
            }}/>

            {/* Phone mockup */}
            <div style={{
              width: 260, height: 480,
              background: "#1a1a1a",
              borderRadius: 36,
              padding: 12,
              boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
              position: "relative",
              zIndex: 2,
            }}>
              <div style={{ background: "#fff", borderRadius: 26, height: "100%", overflow: "hidden", padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#9ca3af" }}>Welcome,</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>Operations Manager</div>
                  </div>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#fff7f2", border: "1.5px solid #fed7aa", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                  </div>
                </div>

                <div style={{ background: "#F97316", borderRadius: 14, padding: 16, color: "#fff", marginBottom: 16 }}>
                  <div style={{ fontSize: 11, opacity: .85, marginBottom: 10 }}>Today's Summary</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[["125", "Trips"], ["3,620 t", "Total Weight"], ["18", "Vehicles"], ["4", "Weighbridges"]].map(([v, l]) => (
                      <div key={l}>
                        <div style={{ fontSize: 18, fontWeight: 800 }}>{v}</div>
                        <div style={{ fontSize: 10, opacity: .8 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  Recent Transactions
                  <span style={{ color: "#F97316", fontWeight: 600 }}>View All</span>
                </div>
                {[
                  { id: "KA 01 AB 1234", w: "38.40 t", t: "10:24 AM" },
                  { id: "KA 01 CD 5678", w: "12.60 t", t: "09:58 AM" },
                  { id: "KA 01 EF 9012", w: "15.80 t", t: "09:43 AM" },
                ].map(r => (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 11 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.id}</div>
                      <div style={{ color: "#9ca3af" }}>Net: {r.w}</div>
                    </div>
                    <div style={{ color: "#9ca3af" }}>{r.t}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating stat cards */}
            <div className="floating-card" style={{ position: "absolute", top: 60, right: -20, zIndex: 3, minWidth: 140 }}>
              <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Efficiency Boost</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#F97316" }}>+30%</div>
              <div style={{ display: "flex", gap: 3, marginTop: 6 }}>
                {[30, 50, 40, 70, 60, 90].map((h, i) => (
                  <div key={i} style={{ width: 8, borderRadius: 4, background: i === 5 ? "#F97316" : "#ffedd5", height: h * 0.5 }}/>
                ))}
              </div>
            </div>

            <div className="floating-card" style={{ position: "absolute", bottom: 80, left: -30, zIndex: 3, minWidth: 150, animationDelay: "2s" }}>
              <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Weighing Accuracy</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#111827", marginTop: 4 }}>99.99%</div>
              <div style={{ display: "flex", gap: 4, marginTop: 6, alignItems: "center" }}>
                <div style={{ width: "95%", height: 6, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: "99.99%", height: "100%", background: "#F97316", borderRadius: 4 }}/>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`@media(max-width:900px){ section > div > div { grid-template-columns: 1fr !important; } section > div > div > div:last-child { display: none; } }`}</style>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "100px 5%", background: "#fafafa" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <AnimatedSection>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <div className="section-label">Features</div>
              <h2 className="section-title">Powerful Features for <span className="orange">Smarter Operations</span></h2>
              <p style={{ color: "#6b7280", marginTop: 16, fontSize: 17, maxWidth: 560, margin: "16px auto 0" }}>
                Everything you need to run your weighbridge and mining operations at peak efficiency.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid-features">
            {FEATURES.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 80}>
                <div className="feature-card">
                  <div style={{ marginBottom: 20 }}>{f.icon}</div>
                  <div className="orange-line" style={{ marginBottom: 16 }}/>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontSize: 14.5, color: "#6b7280", lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "80px 5%", background: "#fff" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="grid-stats">
            {STATS.map((s, i) => (
              <AnimatedSection key={s.label} delay={i * 60}>
                <div className="stat-card">
                  <div style={{ fontSize: 44, fontWeight: 900, color: "#F97316", fontFamily: "'Barlow Condensed',sans-serif", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 600, marginTop: 8 }}>{s.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section style={{ padding: "100px 5%", background: "#fafafa" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <AnimatedSection>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div className="section-label">Industries We Serve</div>
              <h2 className="section-title">Built for Mining.<br/>Trusted Across Industries.</h2>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 60 }}>
              {INDUSTRIES.map((ind, i) => (
                <button
                  key={ind.label}
                  className={`industry-pill ${activeIndustry === i ? "active" : ""}`}
                  onClick={() => setActiveIndustry(i)}
                >
                  {ind.label}
                </button>
              ))}
            </div>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <div style={{
              background: "#fff",
              border: "1px solid #f0efe8",
              borderRadius: 24,
              padding: "60px 5%",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 60,
              alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#F97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
                  {INDUSTRIES[activeIndustry].label}
                </div>
                <h3 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, fontFamily: "'Barlow Condensed',sans-serif", marginBottom: 20 }}>
                  Purpose-built for {INDUSTRIES[activeIndustry].label}
                </h3>
                <p style={{ color: "#6b7280", fontSize: 16, lineHeight: 1.75 }}>
                  WeighMine delivers precision weighing, automated record-keeping, and real-time insights tailored for {INDUSTRIES[activeIndustry].label.toLowerCase()} operations. From single-site setups to multi-location enterprise deployments.
                </p>
                <button className="btn-primary" style={{ marginTop: 32 }}>Learn More →</button>
              </div>
              <div style={{ background: "linear-gradient(135deg, #fff7f2, #ffedd5)", borderRadius: 20, padding: 40, display: "flex", flexDirection: "column", gap: 16 }}>
                {["Automated weighment logs", "GPS-linked vehicle tracking", "Instant digital receipts", "Multi-site dashboard", "Role-based operator access"].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#F97316", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
        <style>{`@media(max-width:700px){ section > div > div:last-child { grid-template-columns:1fr !important; } }`}</style>
      </section>

      {/* WHY WEIGHMINE */}
      <section style={{ padding: "100px 5%", background: "#fff" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="grid-2">
            <AnimatedSection>
              <div>
                <div className="section-label">Why Choose WeighMine?</div>
                <h2 className="section-title">
                  Accuracy you can <span className="orange">measure.</span><br/>
                  Control you can <span className="orange">trust.</span>
                </h2>
                <div style={{ marginTop: 40 }}>
                  {WHY.map((w, i) => (
                    <div key={w} className="why-item" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="check-circle">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span style={{ fontSize: 16, color: "#374151", fontWeight: 500 }}>{w}</span>
                    </div>
                  ))}
                </div>
                <button className="btn-primary" style={{ marginTop: 16 }}>Get Started Today →</button>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <div style={{ position: "relative" }}>
                <div style={{
                  background: "linear-gradient(135deg, #1a1a1a, #2d1a0a)",
                  borderRadius: 24,
                  padding: 40,
                  color: "#fff",
                }}>
                  <div style={{ fontSize: 13, opacity: .6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                    Increase in Operational Efficiency
                  </div>
                  <div style={{ fontSize: 64, fontWeight: 900, color: "#F97316", fontFamily: "'Barlow Condensed',sans-serif" }}>30%</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 24, alignItems: "flex-end", height: 80 }}>
                    {[35, 50, 42, 65, 58, 80, 100].map((h, i) => (
                      <div key={i} style={{ flex: 1, borderRadius: 6, background: i === 6 ? "#F97316" : "rgba(249,115,22,0.3)", height: `${h}%`, transition: "height 0.5s ease" }}/>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 12, opacity: .5, display: "flex", justifyContent: "space-between" }}>
                    {["Jan","Feb","Mar","Apr","May","Jun","Jul"].map(m => <span key={m}>{m}</span>)}
                  </div>
                </div>

                <div style={{
                  position: "absolute", top: -20, right: -20,
                  background: "#fff",
                  borderRadius: 16,
                  padding: "16px 20px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                }}>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>Daily Weighments</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#111" }}>10,247</div>
                  <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 700 }}>↑ 12% vs yesterday</div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "100px 5%", background: "#fafafa" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <AnimatedSection>
            <div className="section-label">What Our Customers Say</div>
            <h2 className="section-title" style={{ marginBottom: 48 }}>Trusted by Operations Leaders</h2>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <div className="testi-card">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ margin: "0 auto 20px" }}>
                <path d="M6 22c0-6 4-10 10-12v4c-3 1-5 4-5 6h5v8H6v-6zM20 22c0-6 4-10 10-12v4c-3 1-5 4-5 6h5v8H20v-6z" fill="#fed7aa"/>
              </svg>
              <p style={{ fontSize: 18, color: "#374151", lineHeight: 1.8, fontStyle: "italic", marginBottom: 32 }}>
                "{TESTIMONIALS[activeTesti].quote}"
              </p>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#ffedd5", border: "2px solid #F97316", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#F97316", fontSize: 16 }}>
                  {TESTIMONIALS[activeTesti].initials}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{TESTIMONIALS[activeTesti].name}</div>
                  <div style={{ fontSize: 13, color: "#9ca3af" }}>{TESTIMONIALS[activeTesti].title}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 28 }}>
              {TESTIMONIALS.map((_, i) => (
                <button key={i} className={`testi-dot ${activeTesti === i ? "active" : ""}`} onClick={() => setActiveTesti(i)}/>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: "80px 5%" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <AnimatedSection>
            <div className="cta-section" style={{ padding: "72px 8%", textAlign: "center", position: "relative" }}>
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(32px,5vw,60px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 20 }}>
                  Ready to Transform Your<br/><span style={{ color: "#F97316" }}>Weighbridge Operations?</span>
                </h2>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 17, marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
                  Join 500+ companies using WeighMine to drive accuracy, efficiency and growth.
                </p>
                <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="btn-primary" style={{ fontSize: 16, padding: "16px 40px" }}>Book a Free Demo →</button>
                  <button style={{ background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)", padding: "15px 32px", borderRadius: 8, fontWeight: 600, fontSize: 16, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.target.style.borderColor = "#F97316"; e.target.style.color = "#F97316"; }}
                    onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.3)"; e.target.style.color = "#fff"; }}>
                    View Pricing
                  </button>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: "100px 5%", background: "#fafafa" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="grid-2">
            <AnimatedSection>
              <div>
                <div className="section-label">Let's Connect</div>
                <h2 className="section-title">Get in Touch with<br/>Our Experts</h2>
                <p style={{ color: "#6b7280", fontSize: 16, marginTop: 16, lineHeight: 1.7 }}>
                  Have questions or want to know more? Fill out the form and our team will get back to you shortly.
                </p>
                <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 20 }}>
                  {[
                    { icon: "📞", label: "Phone", val: "+91 98765 43210" },
                    { icon: "✉️", label: "Email", val: "info@weighmine.com" },
                    { icon: "📍", label: "Address", val: "No. 123, Mining Avenue, Bengaluru, Karnataka – 560001" },
                  ].map(c => (
                    <div key={c.label} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <div style={{ width: 44, height: 44, background: "#fff7f2", border: "1px solid #fed7aa", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                        {c.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>{c.label}</div>
                        <div style={{ fontSize: 15, color: "#374151", fontWeight: 500, marginTop: 2 }}>{c.val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <div style={{ background: "#fff", border: "1px solid #f0efe8", borderRadius: 24, padding: 40 }}>
                <div className="grid-contact" style={{ marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Full Name *</label>
                    <input className="contact-input" type="text" placeholder="Enter your full name"/>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Email Address *</label>
                    <input className="contact-input" type="email" placeholder="Enter your email"/>
                  </div>
                </div>
                <div className="grid-contact" style={{ marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Phone Number</label>
                    <input className="contact-input" type="tel" placeholder="Enter your phone number"/>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Company Name</label>
                    <input className="contact-input" type="text" placeholder="Enter your company name"/>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Subject</label>
                  <select className="contact-input" style={{ appearance: "none", background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5'/%3E%3C/svg%3E\") no-repeat right 16px center / 12px, #fff" }}>
                    <option value="">Select a subject</option>
                    <option>Product Demo</option>
                    <option>Pricing Inquiry</option>
                    <option>Technical Support</option>
                    <option>Partnership</option>
                  </select>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" }}>Message *</label>
                  <textarea className="contact-input" rows={4} placeholder="Tell us about your requirements..." style={{ resize: "vertical" }}/>
                </div>
                <button className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: 16, padding: "16px" }}>
                  Send Message →
                </button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#111827", color: "#fff", padding: "72px 5% 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="footer-grid">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, background: "#F97316", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="8" width="16" height="8" rx="2" fill="white"/>
                    <circle cx="6" cy="12" r="2" fill="#F97316"/>
                    <circle cx="14" cy="12" r="2" fill="#F97316"/>
                    <path d="M6 8V5a4 4 0 018 0v3" stroke="white" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: 0.5 }}>WeighMine</div>
                  <div style={{ fontSize: 9, color: "#6b7280", letterSpacing: "0.15em", fontWeight: 600, textTransform: "uppercase" }}>Measure. Manage. Move.</div>
                </div>
              </div>
              <p style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1.75, maxWidth: 280 }}>
                Smart weighbridge and mining management solution to streamline operations and drive growth.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                {["in", "fb", "tw", "yt"].map(s => (
                  <div key={s} style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af" }}>{s.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>

            {[
              { heading: "Product", links: ["Features", "Pricing", "Updates"] },
              { heading: "Solutions", links: ["Mining", "Weighbridge Automation", "Fleet Management"] },
              { heading: "Resources", links: ["Blog", "Case Studies", "Help Center"] },
              { heading: "Company", links: ["About Us", "Careers", "Contact Us"] },
            ].map(col => (
              <div key={col.heading}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>{col.heading}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {col.links.map(l => (
                    <a key={l} href="#" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={e => e.target.style.color = "#F97316"}
                      onMouseLeave={e => e.target.style.color = "#9ca3af"}>
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 60, paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 13, color: "#6b7280" }}>© 2024 WeighMine. All rights reserved.</div>
            <div style={{ display: "flex", gap: 24 }}>
              {["Privacy Policy", "Terms & Conditions"].map(l => (
                <a key={l} href="#" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "#F97316"}
                  onMouseLeave={e => e.target.style.color = "#6b7280"}>
                  {l}
                </a>
              ))}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>Made with ♥ for the Mining Industry</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
