import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { postRequestDemoWonBills } from "../../../services/shared/shared";

/* ─── Brand tokens ─── */
const B = "#3b82f6";
const BDARK = "#1d4ed8";
const BLIGHT = "rgba(59,130,246,0.08)";

/* ─── Timezone options ─── */
const TIMEZONE_OPTIONS = [
  { label: "IST – India (UTC+5:30)", value: "Asia/Kolkata" },
  { label: "GST – Dubai (UTC+4:00)", value: "Asia/Dubai" },
  { label: "GMT – London (UTC+0:00)", value: "Europe/London" },
  { label: "CET – Central Europe (UTC+1)", value: "Europe/Paris" },
  { label: "EST – New York (UTC-5:00)", value: "America/New_York" },
  { label: "CST – Chicago (UTC-6:00)", value: "America/Chicago" },
  { label: "PST – Los Angeles (UTC-8:00)", value: "America/Los_Angeles" },
  { label: "SGT – Singapore (UTC+8:00)", value: "Asia/Singapore" },
  { label: "AEST – Sydney (UTC+10:00)", value: "Australia/Sydney" },
];

/* ─── Hear About Us options ─── */
const HEAR_OPTIONS = [
  { label: "Google Search", value: "google" },
  { label: "Social Media", value: "social_media" },
  { label: "Referral", value: "referral" },
  { label: "Advertisement", value: "advertisement" },
  { label: "Trade Show / Event", value: "trade_show" },
  { label: "Other", value: "other" },
];

/* ─── Validation helper ─── */
// NOTE: contact is passed in explicitly so we always validate the PhoneInput value,
// not the raw DOM e.target.value (which PhoneInput doesn't expose correctly).
function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "* Name is required";

  // Strip everything except digits, then check length
  const digitsOnly = (values.contact || "").replace(/\D/g, "");
  if (!values.contact || digitsOnly.length < 7)
    errors.contact = "* Enter a valid contact number";

  if (!values.email.trim()) errors.email = "* Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = "* Invalid email address";
  if (!values.organization.trim()) errors.organization = "* Organization name is required";
  if (!values.time) errors.time = "* Please select a time";
  if (!values.timezone) errors.timezone = "* Please select a timezone";
  if (!values.source) errors.source = "* Please select an option";
  // if (!values.matter.trim()) errors.matter = "* Please describe what you are looking for";
  return errors;
}

/* ─── Field wrapper ─── */
function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", letterSpacing: "-0.01em" }}>
        {label}
      </label>
      {children}
      {error && <span style={{ fontSize: 11, color: "#ef4444", marginTop: -2 }}>{error}</span>}
    </div>
  );
}

/* ─── Styled input ─── */
function StyledInput({ hasError, icon, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      {icon && (
        <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: focused ? B : "#9ca3af", display: "flex", alignItems: "center", pointerEvents: "none", transition: "color 0.2s" }}>
          {icon}
        </span>
      )}
      <input
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        style={{
          borderRadius: 14,
          padding: icon ? "11px 14px 11px 40px" : "11px 14px",
          fontSize: 14,
          border: `1.5px solid ${hasError ? "#fca5a5" : focused ? B : "#e5e7eb"}`,
          boxShadow: focused ? `0 0 0 3px rgba(59,130,246,0.10)` : "none",
          outline: "none",
          background: focused ? "#fff" : "#f8fafc",
          color: "#0a0a0a",
          transition: "all 0.2s",
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

/* ─── Styled textarea ─── */
function StyledTextarea({ hasError, icon, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      {icon && (
        <span style={{ position: "absolute", left: 13, top: 13, color: focused ? B : "#9ca3af", display: "flex", pointerEvents: "none", transition: "color 0.2s" }}>
          {icon}
        </span>
      )}
      <textarea
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        style={{
          borderRadius: 14,
          padding: icon ? "11px 14px 11px 40px" : "11px 14px",
          fontSize: 14,
          border: `1.5px solid ${hasError ? "#fca5a5" : focused ? B : "#e5e7eb"}`,
          boxShadow: focused ? `0 0 0 3px rgba(59,130,246,0.10)` : "none",
          outline: "none",
          background: focused ? "#fff" : "#f8fafc",
          color: "#0a0a0a",
          transition: "all 0.2s",
          width: "100%",
          resize: "vertical",
          minHeight: 120,
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />
      {props.maxLength && (
        <span style={{ position: "absolute", bottom: 10, right: 12, fontSize: 11, color: "#9ca3af" }}>
          {(props.value || "").length}/{props.maxLength}
        </span>
      )}
    </div>
  );
}

/* ─── 12-Hour Time Input (from WON Pulse) ─── */
function TimeInput12hr({ value, onChange, onBlur, hasError }) {
  const [focused, setFocused] = useState(false);

  const parse = (val) => {
    if (!val) return { h: "", m: "", ampm: "AM" };
    const match = val.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (!match) return { h: "", m: "", ampm: "AM" };
    return { h: match[1], m: match[2], ampm: match[3].toUpperCase() };
  };

  const [parts, setParts] = useState(() => parse(value));
  const mRef = useRef(null);

  const emit = (next) => {
    if (next.h && next.m && next.ampm) {
      const hh = next.h.padStart(2, "0");
      const mm = next.m.padStart(2, "0");
      onChange(`${hh}:${mm} ${next.ampm}`);
    } else {
      onChange("");
    }
  };

  const handleH = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 2) v = v.slice(-1);
    if (parseInt(v) > 12) v = "12";
    if (parseInt(v) === 0) v = "1";
    const next = { ...parts, h: v };
    setParts(next); emit(next);
    if (v.length === 2) mRef.current?.focus();
  };

  const handleM = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 2) v = v.slice(-1);
    if (parseInt(v) > 59) v = "59";
    const next = { ...parts, m: v };
    setParts(next); emit(next);
  };

  const toggleAmPm = () => {
    const next = { ...parts, ampm: parts.ampm === "AM" ? "PM" : "AM" };
    setParts(next); emit(next);
  };

  const border = `1.5px solid ${hasError ? "#fca5a5" : focused ? B : "#e5e7eb"}`;
  const shadow = focused ? `0 0 0 3px rgba(59,130,246,0.10)` : "none";

  return (
    <div
      style={{
        display: "flex", alignItems: "center",
        borderRadius: 14, border, boxShadow: shadow,
        background: focused ? "#fff" : "#f8fafc",
        overflow: "hidden", transition: "all 0.2s",
      }}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setFocused(false);
          onBlur?.();
        }
      }}
    >
      {/* Clock icon */}
      <span style={{
        padding: "0 4px 0 13px", color: focused ? B : "#9ca3af",
        display: "flex", alignItems: "center", flexShrink: 0,
        transition: "color 0.2s",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      </span>

      {/* Hour */}
      <input
        type="text" inputMode="numeric" placeholder="00"
        value={parts.h} onChange={handleH}
        style={{
          width: 32, flexShrink: 0, border: "none", outline: "none", background: "transparent",
          fontSize: 14, color: "#0a0a0a", fontFamily: "inherit",
          padding: "11px 2px", textAlign: "center",
        }}
      />

      <span style={{ fontSize: 16, color: "#9ca3af", fontWeight: 600, userSelect: "none", flexShrink: 0 }}>:</span>

      {/* Minute */}
      <input
        ref={mRef}
        type="text" inputMode="numeric" placeholder="00"
        value={parts.m} onChange={handleM}
        style={{
          width: 32, flexShrink: 0, border: "none", outline: "none", background: "transparent",
          fontSize: 14, color: "#0a0a0a", fontFamily: "inherit",
          padding: "11px 2px", textAlign: "center",
        }}
      />

      {/* Spacer — pushes AM/PM to the right */}
      <div style={{ flex: 1 }} />

      {/* AM/PM toggle */}
      <button
        type="button"
        onClick={toggleAmPm}
        style={{
          marginLeft: 6, marginRight: 8,
          padding: "4px 10px",
          background: B, color: "#fff",
          border: "none", borderRadius: 8,
          fontSize: 12, fontWeight: 700, cursor: "pointer",
          flexShrink: 0, fontFamily: "inherit",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = BDARK; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = B; }}
      >
        {parts.ampm || "AM"}
      </button>
    </div>
  );
}

/* ─── Custom Dropdown ─── */
function CustomDropdown({ value, onChange, onTouch, hasError, icon, placeholder, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen((p) => !p); onTouch?.(); }}
        style={{
          width: "100%",
          borderRadius: 14,
          padding: "11px 40px 11px 40px",
          fontSize: 14,
          border: `1.5px solid ${hasError ? "#fca5a5" : open ? B : "#e5e7eb"}`,
          boxShadow: open ? `0 0 0 3px rgba(59,130,246,0.10)` : "none",
          outline: "none",
          background: open ? "#fff" : "#f8fafc",
          color: selected ? "#0a0a0a" : "#9ca3af",
          cursor: "pointer",
          textAlign: "left",
          transition: "all 0.2s",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          fontFamily: "inherit",
        }}
      >
        <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: open ? B : "#9ca3af", display: "flex", pointerEvents: "none", transition: "color 0.2s" }}>
          {icon}
        </span>
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected ? selected.label : placeholder}
        </span>
        <span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {open && (
        <div style={{ position: "absolute", zIndex: 99999, marginTop: 6, width: "100%", background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", overflow: "hidden", maxHeight: 220, overflowY: "auto" }}>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: "10px 16px",
                fontSize: 14,
                cursor: "pointer",
                color: value === opt.value ? B : "#374151",
                background: value === opt.value ? BLIGHT : "transparent",
                fontWeight: value === opt.value ? 600 : 400,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (value !== opt.value) e.currentTarget.style.background = "rgba(59,130,246,0.05)"; }}
              onMouseLeave={(e) => { if (value !== opt.value) e.currentTarget.style.background = "transparent"; }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── SVG Icons ─── */
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 010 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
  </svg>
);
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconBuilding = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconChat = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconGlobe = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
  </svg>
);
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" />
  </svg>
);

/* ─── Left panel info items ─── */
const INFO_ITEMS = [
  { icon: <IconMail />, label: "Email Us", value: "sales@nowitservices.com" },
  { icon: <IconPhone />, label: "Call Us", value: "+91 7893536373\nMon–Sat, 10 AM – 6 PM (IST)" },
  { icon: <IconChat />, label: "Support", value: "Within 24 Hours" },
];

/* ─── Invoice illustration ─── */
const InvoiceIllustration = () => (
  <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", margin: "0 auto" }}>
    <ellipse cx="110" cy="200" rx="75" ry="12" fill="rgba(59,130,246,0.08)" />
    <g opacity="0.18" transform="translate(28, 80)">
      <path d="M0 70 C-22 35,-15 0,0-15 C15 0,22 35,0 70Z" fill="#3b82f6" />
      <path d="M0 70 C-10 42,-3 15,0-15" stroke="#3b82f6" strokeWidth="1.2" fill="none" />
      <path d="M-10 48 C-3 44,0 40,7 37" stroke="#3b82f6" strokeWidth="0.9" fill="none" />
      <path d="M-13 30 C-5 27,0 22,8 19" stroke="#3b82f6" strokeWidth="0.9" fill="none" />
      <path d="M-11 14 C-3 11,2 7,8 4" stroke="#3b82f6" strokeWidth="0.9" fill="none" />
    </g>
    <g transform="rotate(10, 110, 110)">
      <rect x="85" y="30" width="100" height="135" rx="10" fill="#3b82f6" opacity="0.85" />
      <path d="M157 30 L185 58 L157 58Z" fill="#1d4ed8" opacity="0.6" />
      <rect x="96" y="74" width="62" height="7" rx="3.5" fill="white" opacity="0.3" />
      <rect x="96" y="88" width="50" height="7" rx="3.5" fill="white" opacity="0.3" />
      <rect x="96" y="102" width="56" height="7" rx="3.5" fill="white" opacity="0.3" />
      <rect x="96" y="116" width="40" height="7" rx="3.5" fill="white" opacity="0.3" />
      <rect x="96" y="130" width="48" height="7" rx="3.5" fill="white" opacity="0.3" />
    </g>
    <rect x="30" y="25" width="110" height="155" rx="11" fill="white" stroke="#dbeafe" strokeWidth="1.5" />
    <path d="M112 25 L140 53 L112 53Z" fill="#eff6ff" stroke="#dbeafe" strokeWidth="1" />
    <circle cx="76" cy="72" r="24" fill="#3b82f6" />
    <text x="76" y="80" textAnchor="middle" fill="white" fontSize="22" fontWeight="800" fontFamily="Arial, sans-serif">%</text>
    <rect x="45" y="112" width="72" height="7" rx="3.5" fill="#dbeafe" />
    <rect x="45" y="126" width="58" height="7" rx="3.5" fill="#e5e7eb" />
    <rect x="45" y="140" width="65" height="7" rx="3.5" fill="#e5e7eb" />
    <rect x="45" y="154" width="48" height="7" rx="3.5" fill="#dbeafe" />
  </svg>
);

/* ═══════════════════════════════════
   Contact Component — WON Bills
═══════════════════════════════════ */
export default function Contact() {
  const [values, setValues] = useState({
    name: "",
    contact: "+91",
    email: "",
    organization: "",
    time: "",
    timezone: "Asia/Kolkata",
    source: "",
    matter: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...values, [name]: value };
    setValues(updated);
    if (touched[name]) {
      setErrors(validate(updated));
    }
  };

  // For text inputs only — PhoneInput handled separately via onChange
  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate(values));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await postRequestDemoWonBills({
        name: values.name,
        contact: values.contact,
        email: values.email,
        organization: values.organization,
        time: `${values.time}  ${values.timezone}`,
        source: values.source,
        matter: values.matter,
      });
      setSubmitted(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success state ── */
  if (submitted) {
    return (
      <section id="support" style={sectionStyle}>
        <div style={containerStyle}>
          <div style={{ background: BLIGHT, border: `1.5px solid rgba(59,130,246,0.25)`, borderRadius: 24, padding: "56px 32px", textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
            <div style={{ fontSize: 56, marginBottom: 18 }}>🎉</div>
            <h3 style={{ color: B, fontWeight: 900, fontSize: 22, marginBottom: 10 }}>Message Sent!</h3>
            <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.7 }}>Our team will get back to you within 24 hours.</p>
            <button
              onClick={() => {
                setSubmitted(false);
                setValues({ name: "", contact: "+91", email: "", organization: "", time: "", timezone: "Asia/Kolkata", source: "", matter: "" });
                setTouched({});
                setErrors({});
              }}
              style={{ marginTop: 24, padding: "10px 28px", background: B, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
              Send Another
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="support" style={sectionStyle}>
      <div style={containerStyle}>
        <div className="contact-layout">

          {/* ── Left Panel ── */}
          <div className="contact-left">
            <div style={{ background: "linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)", borderRadius: 24, padding: "36px 32px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
              <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 900, color: "#0f172a", marginBottom: 10, lineHeight: 1.2 }}>
                Let&apos;s Talk <span style={{ color: B }}>Billing</span>
              </h2>
              <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
                Have a question about an invoice, payment, or your account? We&apos;re here to help.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 36 }}>
                {INFO_ITEMS.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", color: B, flexShrink: 0, boxShadow: "0 2px 8px rgba(59,130,246,0.12)" }}>
                      {item.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{item.label}</p>
                      <p style={{ fontSize: 13, color: "#6b7280", whiteSpace: "pre-line", lineHeight: 1.5 }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "auto" }} className="hidden lg:block">
                <InvoiceIllustration />
              </div>
            </div>
          </div>

          {/* ── Right Panel: Form ── */}
          <div className="contact-right" style={{
            background: "#fff",
            border: "1.5px solid #e5e7eb",
            borderRadius: 24,
            padding: "36px 32px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}>
            <form onSubmit={handleSubmit} noValidate>
              <div className="contact-grid">

                {/* Name */}
                <Field label="Name" error={touched.name && errors.name}>
                  <StyledInput
                    name="name" type="text" placeholder="Your full name"
                    value={values.name} onChange={handleChange}
                    onBlur={() => handleBlur("name")}
                    hasError={touched.name && !!errors.name} icon={<IconUser />}
                  />
                </Field>

                {/* Contact — PhoneInput, onChange drives validation */}
                <Field label="Contact" error={touched.contact && errors.contact}>
                  <div style={{
                    borderRadius: 14,
                    border: `1.5px solid ${touched.contact && errors.contact ? "#fca5a5" : "#e5e7eb"}`,
                    background: "#f8fafc",
                    transition: "border-color 0.2s",
                  }}>
                    <PhoneInput
                      country="in"
                      value={values.contact}
                      onChange={(val) => {
                        const updated = { ...values, contact: val };
                        setValues(updated);
                        // Always re-validate contact on change so errors clear immediately
                        if (touched.contact) setErrors(validate(updated));
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, contact: true }));
                        setErrors(validate(values));
                      }}
                      countryCodeEditable={true}
                      disableDropdown={false}
                      containerStyle={{ width: "100%" }}
                      inputStyle={{
                        width: "100%", height: "44px",
                        border: "none", borderRadius: 14,
                        background: "transparent",
                        fontSize: 14, color: "#0a0a0a", paddingLeft: "52px",
                        fontFamily: "inherit",
                      }}
                      dropdownStyle={{
                        maxHeight: 200, overflowY: "auto",
                        zIndex: 99999, borderRadius: 12,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                      }}
                    />
                  </div>
                </Field>

                {/* Email */}
                <Field label="Email" error={touched.email && errors.email}>
                  <StyledInput
                    name="email" type="email" placeholder="you@example.com"
                    value={values.email} onChange={handleChange}
                    onBlur={() => handleBlur("email")}
                    hasError={touched.email && !!errors.email} icon={<IconMail />}
                  />
                </Field>

                {/* Organization */}
                <Field label="Organization Name" error={touched.organization && errors.organization}>
                  <StyledInput
                    name="organization" type="text" placeholder="Your organization name"
                    value={values.organization} onChange={handleChange}
                    onBlur={() => handleBlur("organization")}
                    hasError={touched.organization && !!errors.organization} icon={<IconBuilding />}
                  />
                </Field>

                {/* Preferred Time — 12hr custom input */}
                <Field label="Preferred Time" error={touched.time && errors.time}>
                  <TimeInput12hr
                    value={values.time}
                    onChange={(val) => {
                      const updated = { ...values, time: val };
                      setValues(updated);
                      if (touched.time) setErrors(validate(updated));
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, time: true }));
                      setErrors(validate(values));
                    }}
                    hasError={touched.time && !!errors.time}
                  />
                </Field>

                {/* Timezone */}
                <Field label="Time Zone" error={touched.timezone && errors.timezone}>
                  <CustomDropdown
                    value={values.timezone}
                    onChange={(val) => {
                      const updated = { ...values, timezone: val };
                      setValues(updated);
                      setErrors(validate(updated));
                    }}
                    onTouch={() => setTouched((prev) => ({ ...prev, timezone: true }))}
                    hasError={touched.timezone && !!errors.timezone}
                    icon={<IconGlobe />}
                    placeholder="Select timezone"
                    options={TIMEZONE_OPTIONS}
                  />
                </Field>

                {/* How Did You Hear About Us */}
                <Field label="How Did You Hear About Us?" error={touched.source && errors.source}>
                  <CustomDropdown
                    value={values.source}
                    onChange={(val) => {
                      const updated = { ...values, source: val };
                      setValues(updated);
                      setErrors(validate(updated));
                    }}
                    onTouch={() => setTouched((prev) => ({ ...prev, source: true }))}
                    hasError={touched.source && !!errors.source}
                    icon={<IconSearch />}
                    placeholder="Select an option"
                    options={HEAR_OPTIONS}
                  />
                </Field>

                {/* Spacer to keep grid balanced */}
                <div className="contact-spacer" />

                {/* Message — full width */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="For What Are You Looking For?" error={touched.matter && errors.matter}>
                    <StyledTextarea
                      name="matter"
                      placeholder="How can we help you with billing?"
                      value={values.matter} onChange={handleChange}
                      onBlur={() => handleBlur("matter")}
                      hasError={touched.matter && !!errors.matter} maxLength={500} icon={<IconChat />}
                    />
                  </Field>
                </div>
              </div>

              {/* Privacy note */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f8fafc", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "12px 16px", marginTop: 20, marginBottom: 20 }}>
                <IconShield />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>Your information is safe with us.</p>
                  <p style={{ fontSize: 12, color: "#6b7280" }}>We only use your details to respond to your inquiry.</p>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                onMouseEnter={(e) => { if (!submitting) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 14px 40px rgba(59,130,246,0.40)`; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(59,130,246,0.30)`; }}
                style={{
                  width: "100%", padding: "14px 20px",
                  background: submitting ? "#9ca3af" : `linear-gradient(135deg, ${B}, ${BDARK})`,
                  color: "#fff", fontWeight: 800, fontSize: 15,
                  borderRadius: 16, border: "none",
                  cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: submitting ? "none" : `0 8px 24px rgba(59,130,246,0.30)`,
                  transition: "all 0.2s", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  gap: 10, letterSpacing: "-0.01em",
                }}
              >
                {submitting ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "contact-spin 1s linear infinite" }}>
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0110 10" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes contact-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .contact-layout {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 40px;
          align-items: stretch;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .contact-spacer { display: block; }
        @media (max-width: 900px) {
          .contact-layout { grid-template-columns: 1fr; }
          .contact-left { max-width: 100%; }
        }
        @media (max-width: 540px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .contact-spacer { display: none !important; }
        }
        .react-tel-input .flag-dropdown {
          background: transparent !important; border: none !important;
          border-right: 1.5px solid #e5e7eb !important;
          border-radius: 14px 0 0 14px !important;
        }
        .react-tel-input .flag-dropdown.open { background: transparent !important; border-radius: 14px 0 0 14px !important; }
        .react-tel-input .flag-dropdown.open .selected-flag { background: transparent !important; border-radius: 14px 0 0 14px !important; }
        .react-tel-input .selected-flag { border-radius: 14px 0 0 14px !important; background: transparent !important; }
        .react-tel-input .selected-flag:hover, .react-tel-input .selected-flag:focus { background: rgba(59,130,246,0.06) !important; }
        .react-tel-input .country-list {
          position: absolute !important; z-index: 99999 !important; max-height: 200px !important;
          border-radius: 12px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important;
          border: 1.5px solid #e5e7eb !important; margin-top: 4px !important; left: 0 !important;
        }
        .react-tel-input .country-list .country:hover { background: rgba(59,130,246,0.08) !important; }
        .react-tel-input .country-list .country.highlight { background: rgba(59,130,246,0.12) !important; }
      `}</style>
    </section>
  );
}

/* ─── Section styles ─── */
const sectionStyle = { width: "100%", background: "#fff", padding: "10px 0 80px 0" };
const containerStyle = { maxWidth: 1120, margin: "0 auto", padding: "0 24px" };

/* ─── PropTypes ─── */
Field.propTypes = {
  label: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  children: PropTypes.node,
};
StyledInput.propTypes = {
  hasError: PropTypes.bool, icon: PropTypes.node,
  onFocus: PropTypes.func, onBlur: PropTypes.func,
};
StyledTextarea.propTypes = {
  hasError: PropTypes.bool, icon: PropTypes.node,
  value: PropTypes.string, maxLength: PropTypes.number,
  onFocus: PropTypes.func, onBlur: PropTypes.func,
};
TimeInput12hr.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  hasError: PropTypes.bool,
};
CustomDropdown.propTypes = {
  value: PropTypes.string, onChange: PropTypes.func,
  onTouch: PropTypes.func, hasError: PropTypes.bool,
  icon: PropTypes.node, placeholder: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.string })),
};