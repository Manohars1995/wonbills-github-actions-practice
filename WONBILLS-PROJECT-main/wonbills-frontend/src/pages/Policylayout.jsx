import { Link } from "react-router-dom";
import { IoIosMail } from "react-icons/io";
import { IoCall } from "react-icons/io5";
import { FaLocationDot, FaHouse } from "react-icons/fa6";
import { RiLoginBoxLine } from "react-icons/ri";
import { PiCopyright } from "react-icons/pi";
import PropTypes from "prop-types";

const BORDER_BLUE = "rgba(21,101,192,0.25)";

const SOCIALS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/NowITServices?_rdr",
    d: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/_nowitservices_/profilecard/",
    d: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z M17.5 6.5h.01 M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/nowitservices/",
    d: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z M2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@nowitservicesltd",
    d: "M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z M9.75 15.02V8.98L15.5 12l-5.75 3.02z",
  },
];


const SvgIcon = ({ d, size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const BLUE = "#1565C0";
const BLUE_BG = "rgba(21,101,192,0.08)";

const PolicyLayout = ({ title, children }) => {
  return (
    <div translate="no" className=" notranslate min-h-screen w-full flex flex-col bg-gray-50">

      {/* ===== Header ===== */}
      <header className="w-full sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="w-full px-6 h-14 flex items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            {/* Logo only */}
            <Link to="/" className="flex items-center">
              <img
                src="/public/logo.png"
                className="h-9 w-9 rounded-sm"
                alt="WON Bills Logo"
              />
              {/* <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600">
                <span className="text-white font-extrabold text-[13px] leading-none">W</span>
              </div> */}
            </Link>
            <p className="text-md sm:text-lg font-bold text-gray-900">
              WON Bills
            </p>
          </div>

          {/* Nav Links with icons */}
          <nav className="flex items-center gap-1">
            <Link to="/">
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600 px-3 py-1.5 rounded-lg cursor-pointer transition-all hover:bg-blue-50 hover:text-[#1565C0]">
                <FaHouse size={13} />
                Home
              </span>
            </Link>
            <Link to="/login">
              <span
                className="flex items-center gap-1.5 text-sm font-medium text-white px-3 py-1.5 rounded-lg cursor-pointer transition-opacity hover:opacity-90"
                style={{ backgroundColor: BLUE }}
              >
                <RiLoginBoxLine size={14} />
                Login
              </span>
            </Link>
          </nav>
        </div>
      </header>

      {/* ===== Main Content ===== */}
      <main className="flex-grow w-full px-4 sm:px-6 lg:px-10 py-6">

        {/* Page Title */}
        {title && (
          <p className="text-md sm:text-lg! font-bold text-gray-900 pb-3">
            {title}
          </p>
        )}

        {/* Content Card */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

          <div className="p-2 sm:p-5! overflow-auto max-h-[68vh]">
            <style>{`
              ::-webkit-scrollbar { width: 4px; height: 8px; }
              ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
              ::-webkit-scrollbar-thumb { background-color: #1565C0; border-radius: 4px; }
              ::-webkit-scrollbar-thumb:hover { background-color: #0D47A1; }
            `}</style>
            <div className="text-sm leading-relaxed text-gray-700">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* ===== Footer ===== */}
      <footer className="w-full bg-white border-t border-gray-200 px-6 pt-1 pb-0">

        <p className="text-sm font-semibold mb-4">
          By NOWIT SERVICES Pvt Ltd
        </p>

        <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-2">

          {/* Call */}
          <div className="flex items-center gap-2">
            <IoCall size={20} color={BLUE} />
            <div>
              <p className="text-xs text-gray-500">Call us</p>
              <p className="text-sm font-medium text-gray-800">+91 7893536373</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2">
            <IoIosMail size={20} color={BLUE} />
            <div>
              <p className="text-xs text-gray-500">Email us</p>
              <p className="text-sm font-medium text-gray-800">testmail@nowitservices.com</p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2">
            <FaLocationDot size={18} color={BLUE} className="mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-800 leading-snug">
              17-6-284-1, Uma Shankar Nagar,<br />
              Vijayawada, Andhra Pradesh, India - 520007
            </p>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-gray-500 font-medium" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>Follow Us On</p>
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ label, href, d }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: BLUE_BG,
                    border: `1px solid ${BORDER_BLUE}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: BLUE, textDecoration: "none",
                    transition: "all 0.2s", flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(21,101,192,0.22)";
                    e.currentTarget.style.borderColor = BLUE;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = BLUE_BG;
                    e.currentTarget.style.borderColor = BORDER_BLUE;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <SvgIcon d={d} size={13} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 py-2.5 flex justify-center items-center gap-1 text-gray-400">
          <PiCopyright size={13} />
          <span className="text-xs">2024 All Rights Reserved</span>
        </div>
      </footer>
    </div>
  );
};

PolicyLayout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default PolicyLayout;