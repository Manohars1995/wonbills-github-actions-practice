import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleTranslate from "./GoogleTranslate";


const Header = () => {
  const navigate = useNavigate();


  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");

  useEffect(() => {
    const sectionIds = ["home", "features", "pricing", "support"];

    // Target the actual scrolling container, not window
    const scrollContainer = document.querySelector(".slot-scroll");

    const handleScroll = () => {
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 80 && rect.bottom > 80) {
            setActiveLink(id.charAt(0).toUpperCase() + id.slice(1));
            break;
          }
        }
      }
    };

    const target = scrollContainer || window;
    target.addEventListener("scroll", handleScroll, { passive: true });
    return () => target.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    {
      label: "Home",
      href: "#home",
      path: "/",
    },
    {
      label: "Features",
      href: "#features",
      path: "/features",
    },
    {
      label: "Pricing",
      href: "#pricing",
      path: "/pricing",
    },
    {
      label: "Support",
      href: "#support",
      path: "/support",
    },
  ];

  return (
    <>
      <header className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl 2xl:max-w-7xl">
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-lg shadow-gray-200/60 px-6">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <div
              className="flex items-center gap-1.5 cursor-pointer"
              onClick={() => {
                setActiveLink("Home");
                const container = document.querySelector(".slot-scroll");
                if (location.pathname === "/") {
                  // Already on home — just scroll up directly
                  container?.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  navigate("/");
                }
              }}
            >
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                <img
                  src="https://res.cloudinary.com/dtb4vozhy/image/upload/v1778133397/R6TSM14_dstwcn.png"
                  alt="WON Bills Logo"
                  className="w-full h-full object-contain "
                />
                {/* <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-600">
                    <span className="text-white font-extrabold text-[13px] leading-none">W</span>
                  </div> */}
              </div>
              <span className="font-extrabold text-[17px] text-gray-900 tracking-tight">WON Bills</span>
            </div>

            {/* Desktop Nav — lg and above */}
            <nav className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveLink(link.label);
                    navigate(link.path);
                  }} className={`relative text-[15px] font-medium transition-colors pb-1 ${activeLink === link.label
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  {link.label}
                  {activeLink === link.label && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-full" />
                  )}
                </a>
              ))}
            </nav>

            {/* Desktop Auth buttons — lg and above */}
            <div className="hidden lg:flex items-center gap-3">
              <GoogleTranslate />

              <Link
                to="/signup"
                className="text-[14px] font-semibold text-gray-700 hover:text-gray-900 px-4 py-2 transition-colors"
              >
                Sign Up
              </Link>
              <Link
                to="/signin"
                className="text-[14px] font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg transition-colors"
              >
                Login
              </Link>
            </div>

            {/* Mobile + Tablet hamburger — below lg */}
            <button
              className="lg:hidden p-2 rounded-lg text-gray-600"
              onClick={() => setMenuOpen(true)}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile + Tablet Fullscreen Overlay */}
      {menuOpen && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-100 w-[calc(100%-2rem)] bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col px-6 pt-4 pb-1">
          {/* Top row: Logo + Close */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1.5">
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                <img
                  src="https://res.cloudinary.com/dtb4vozhy/image/upload/v1778133397/R6TSM14_dstwcn.png"
                  alt="WON Bills Logo"
                  className="w-full h-full object-contain "
                />
                {/* <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-600">
                    <span className="text-white font-extrabold text-[13px] leading-none">W</span>
                  </div> */}
              </div>
              <span className="font-extrabold text-[17px] text-gray-900 tracking-tight">WON Bills</span>
            </div>
            <div className="flex items-center gap-1">
              <GoogleTranslate />

              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1 flex-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveLink(link.label);
                  setMenuOpen(false);
                  navigate(link.path);
                }}
                className={`text-[14px] md:text-[15px] font-medium py-2 border-b border-gray-100 transition-colors ${activeLink === link.label
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
                  }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Bottom Buttons */}
          <div className="flex gap-3 mt-2 mb-2">

            <Link
              to="/signup"
              className="flex-1 text-center text-[14px] md:text-[15px] font-semibold text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors"
            >
              Sign Up
            </Link>

            <Link
              to="/signin"
              className="flex-1 text-center text-[14px] md:text-[15px] font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;