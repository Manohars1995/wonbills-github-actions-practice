import React, { useState, useEffect, useCallback } from "react";
import { FaApple } from "react-icons/fa";

const slides = [
  {
    badge: "All-in-one Billing & Payment Platform",
    titleDark: "Easy Billing.\nEasy Payments.",
    titleBlue: "More Time for\nGrowth.",
    subtitle: "Create invoices, manage clients and get paid faster with",
    slideImg: "https://res.cloudinary.com/dtb4vozhy/image/upload/v1779433302/ChatGPT_Image_May_22_2026_12_30_08_PM_eyd7n6.png",
  },
  {
    badge: "Smart Invoicing Made Simple",
    titleDark: "Send Invoices.\nGet Paid Fast.",
    titleBlue: "Zero Hassle,\nFull Control.",
    subtitle: "Create professional invoices and track payments instantly with",
    slideImg: "https://res.cloudinary.com/dtb4vozhy/image/upload/v1778499570/Untitled_design_37_nescl4.png",
  },
  {
    badge: "Analytics & Reports",
    titleDark: "Real-time Data.\nSmarter Decisions.",
    titleBlue: "Grow Faster\nWith Insights.",
    subtitle: "Track revenue, monitor cash flow and understand your business with",
    slideImg: "https://res.cloudinary.com/dtb4vozhy/image/upload/v1777717489/ChatGPT_Image_May_2_2026_02_25_26_PM_x5diiv.png",
  },
];

const LAPTOP_BG = "https://res.cloudinary.com/dtb4vozhy/image/upload/v1777722526/ChatGPT_Image_May_2_2026_05_18_34_PM_uymngr.png";
const PHONE_BG = "https://res.cloudinary.com/dtb4vozhy/image/upload/v1777722538/ChatGPT_Image_May_2_2026_05_17_31_PM_lowz6t.png";

const preloadImages = () => {
  slides.forEach((s) => {
    const img = new Image();
    img.src = s.slideImg;
  });
};


const Hero = () => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);

  useEffect(() => {
    preloadImages();
    const img = new Image();
    img.onload = () => setImagesReady(true);
    img.src = slides[0].slideImg;
  }, []);

  const goTo = useCallback((idx) => {
    if (animating || idx === current) return;
    setAnimating(true);
    setTimeout(() => { setCurrent(idx); setAnimating(false); }, 350);
  }, [animating, current]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const s = slides[current];

  return (
    <>
      <section
        id="home"
        className="relative w-full overflow-hidden"
        style={{ height: "100dvh", minHeight: "600px", background: "#eef2ff" }}
      >
        {/* BG images */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img src={PHONE_BG} alt="" className="block lg:hidden w-full h-full object-cover" />
          <img src={LAPTOP_BG} alt="" className="hidden lg:block w-full h-full object-cover" />
        </div>

        {/* DESKTOP layout — lg and above only */}
        <div
          className="hidden lg:flex relative z-10 h-full max-w-7xl 2xl:max-w-[1800px] mx-auto px-6 lg:px-12 2xl:px-20 items-center justify-between gap-8 2xl:gap-16"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(8px)" : "translateY(0)",
            transition: "opacity 0.35s ease, transform 0.35s ease",
          }}
        >
          {/* Left col */}
          <div className="flex-1 max-w-[520px] 2xl:max-w-[680px] pt-16 pb-10 flex flex-col justify-between h-full">
            <div className="flex flex-col pt-8">
              <div className="absolute top-14 left-2/7 z-10 grid grid-cols-6 gap-2.5 opacity-30">
                {Array.from({ length: 30 }).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400" />)}
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 2xl:px-5 2xl:py-2 rounded-full bg-white border border-blue-100 text-gray-700 text-[12px] 2xl:text-[15px] font-semibold mb-5 2xl:mb-7 shadow-sm self-start">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#3b82f6" className="2xl:w-4 2xl:h-4">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                </svg>
                {s.badge}
              </div>

              {/* Heading */}
              <h1 className="text-[28px] lg:text-[36px] xl:text-[46px] 2xl:text-[64px] font-black leading-[1.08] tracking-tight mb-4 2xl:mb-6">
                <span className="text-gray-900" style={{ whiteSpace: "pre-line" }}>{s.titleDark}</span>
                <br />
                <span className="text-blue-500" style={{ whiteSpace: "pre-line" }}>{s.titleBlue}</span>
              </h1>

              {/* Subtitle */}
              <p className="text-[14px] 2xl:text-[18px] text-gray-500 leading-relaxed mb-6 2xl:mb-8 max-w-[400px] 2xl:max-w-[520px]">
                {s.subtitle} <span className="text-blue-500 font-semibold">WON Bills.</span>
              </p>

              {/* Get Started CTA */}
              <div className="mb-6 2xl:mb-8">
                <a
                  href="#support"
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 2xl:px-8 2xl:py-3.5 rounded-xl font-bold text-[14px] 2xl:text-[17px] transition-colors shadow-md"
                >
                  Get Started
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="2xl:w-5 2xl:h-5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Store buttons at bottom */}
            <div className="flex items-center gap-3 2xl:gap-5 mb-8">
              {/* App Store */}
              <a
                href="https://apps.apple.com/in/app/won-bills/id6746782261"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 2xl:gap-3.5 bg-gray-900 hover:bg-gray-800 text-white px-4 2xl:px-6 py-2.5 2xl:py-4 rounded-xl transition-colors shadow-md"
              >
                <FaApple size={20} color="white" className="2xl:!w-8 2xl:!h-8" style={{ fontSize: "clamp(20px, 2vw, 32px)" }} />
                <div>
                  <p className="text-[9px] 2xl:text-[12px] text-gray-300 leading-none">Download on the</p>
                  <p className="text-[13px] 2xl:text-[18px] font-bold leading-tight">App Store</p>
                </div>
              </a>

              {/* Google Play */}
              <a
                href="https://play.google.com/store/apps/details?id=com.nowitservices.wonbills"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 2xl:gap-3.5 bg-white hover:bg-gray-50 text-gray-900 px-4 2xl:px-6 py-2.5 2xl:py-4 rounded-xl border border-gray-200 transition-colors shadow-md"
              >
                <img
                  src="https://res.cloudinary.com/dtb4vozhy/image/upload/v1776929330/Generate__Google_Play_Store_logo_with_transparent_background__in_a_modern_vector_art_style_with_a_flat_design_aesthetic_ajq2rj.png"
                  alt="Google Play"
                  className="w-5 h-5 2xl:w-8 2xl:h-8 object-contain"
                />
                <div>
                  <p className="text-[9px] 2xl:text-[12px] text-gray-400 leading-none">GET IT ON</p>
                  <p className="text-[13px] 2xl:text-[18px] font-bold leading-tight">Google Play</p>
                </div>
              </a>

              <div className="absolute bottom-10 right-0 z-10 grid grid-cols-5 gap-2 opacity-20">
                {Array.from({ length: 20 }).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500" />)}
              </div>
            </div>
          </div>

          {/* Carousel controls — absolute bottom center */}
          <div className="absolute bottom-6 2xl:bottom-10 left-0 right-0 flex items-center justify-center gap-2 2xl:gap-3 z-20">
            <button onClick={prev} className="w-8 h-8 2xl:w-11 2xl:h-11 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:border-blue-400 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" className="2xl:w-4 2xl:h-4"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === current ? "22px" : "8px",
                  height: "8px",
                  background: i === current ? "#3b82f6" : "#d1d5db",
                }}
              />
            ))}
            <button onClick={next} className="w-8 h-8 2xl:w-11 2xl:h-11 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:border-blue-400 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" className="2xl:w-4 2xl:h-4"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          {/* Right: slide image — BIGGER on 2xl */}
          <div className="flex-1 relative flex items-center justify-end h-full max-w-[600px] 2xl:max-w-[820px] xl:mt-10">
            <img
              key={`desk-${current}`}
              src={s.slideImg}
              alt="WON Bills preview"
              className="relative z-20 object-contain drop-shadow-2xl rounded-2xl"
              style={{
                maxHeight: "92vh",
                maxWidth: "115%",
                opacity: animating ? 0 : 1,
                transform: animating ? "scale(0.97)" : "scale(1)",
                transition: "opacity 0.35s ease, transform 0.35s ease",
              }}
            />
          </div>
        </div>

        {/* MOBILE + TABLET layout — below lg */}
        <div
          className="flex lg:hidden flex-col relative z-10 h-full px-5 pt-19 pb-6"
          style={{
            opacity: animating ? 0 : 1,
            transition: "opacity 0.35s ease",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          {/* Text block */}
          <div className="flex flex-col items-center text-center w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-blue-100 text-gray-700 text-[11px] font-semibold mb-3 shadow-sm">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#3b82f6">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
              </svg>
              {s.badge}
            </div>

            <p className="text-[25px] sm:text-[28px] md:text-[36px] font-black leading-[1.1] tracking-tight mb-3 max-w-[320px] md:max-w-[500px]">
              <span className="text-gray-900">{s.titleDark}</span>
              <br />
              <span className="text-blue-500">{s.titleBlue}</span>
            </p>

            <p className="text-[10px] sm:text-[12px] md:text-[14px] text-gray-500 leading-relaxed mb-2 max-w-[350px] md:max-w-[480px]">
              {s.subtitle} <span className="text-blue-500 font-semibold">WON Bills.</span>
            </p>

            <a href="#support" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-[13px] transition-colors shadow-md mb-1">
              Get Started
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </a>
          </div>

          {/* Image */}
          <div className="relative flex items-center justify-center w-full rounded-xl h-[34vh] sm:h-[38vh]" >
            <div className="absolute top-0 left-0 z-10 grid grid-cols-5 gap-2 opacity-25">
              {Array.from({ length: 15 }).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400" />)}
            </div>
            {!imagesReady && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ borderRadius: "12px", background: "rgba(219,234,254,0.4)" }}>
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}
            <img
              key={`mob-${current}`}
              src={s.slideImg}
              alt="WON Bills preview"
              className="relative z-20 object-contain drop-shadow-xl"
              style={{
                width: "100%", height: "100%",
                opacity: (animating || !imagesReady) ? 0 : 1,
                transform: animating ? "scale(0.97)" : "scale(1)",
                transition: "opacity 0.35s ease, transform 0.35s ease",
              }}
              onLoad={() => setImagesReady(true)}
            />
          </div>

          {/* Store buttons */}
          <div className="flex gap-2.5 justify-center pb-4">
            <a href="https://apps.apple.com/in/app/won-bills/id6746782261" target="_blank" className="flex items-center gap-2 bg-gray-900 text-white px-3.5 py-2.5 rounded-xl shadow-md">
              <FaApple size={18} color="white" />
              <div>
                <p className="text-[8px] text-gray-300 leading-none">Download on the</p>
                <p className="text-[12px] font-bold leading-tight">App Store</p>
              </div>
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.nowitservices.wonbills" className="flex items-center gap-2 bg-white text-gray-900 px-3.5 py-2.5 rounded-xl border border-gray-200 shadow-md">
              <img src="https://res.cloudinary.com/dtb4vozhy/image/upload/v1776929330/Generate__Google_Play_Store_logo_with_transparent_background__in_a_modern_vector_art_style_with_a_flat_design_aesthetic_ajq2rj.png" alt="Google Play" className="w-4 h-4 object-contain" />
              <div>
                <p className="text-[8px] text-gray-400 leading-none">GET IT ON</p>
                <p className="text-[12px] font-bold leading-tight">Google Play</p>
              </div>
            </a>
          </div>

          {/* Dots + Prev/Next */}
          <div className="flex items-center justify-center gap-2">
            <button onClick={prev} className="w-8 h-8 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:border-blue-400 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className="rounded-full transition-all duration-300"
                style={{ width: i === current ? "20px" : "7px", height: "7px", background: i === current ? "#3b82f6" : "#d1d5db" }} />
            ))}
            <button onClick={next} className="w-8 h-8 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:border-blue-400 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;