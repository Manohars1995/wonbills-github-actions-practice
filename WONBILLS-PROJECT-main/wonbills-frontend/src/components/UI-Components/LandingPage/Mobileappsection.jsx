import { useState, useEffect } from "react";

const screenshots = [
  "https://res.cloudinary.com/dtb4vozhy/image/upload/v1779442251/1000093454_ljmnsd.jpg",
  "https://res.cloudinary.com/dtb4vozhy/image/upload/v1779442251/1000093451_np5h7h.jpg",
  "https://res.cloudinary.com/dtb4vozhy/image/upload/v1779442251/1000093453_bo89ts.jpg",
  "https://res.cloudinary.com/dtb4vozhy/image/upload/v1779442251/1000093452_rttwrl.jpg",
  "https://res.cloudinary.com/dtb4vozhy/image/upload/v1783661147/1000100030_folyxg.jpg",
  "https://res.cloudinary.com/dtb4vozhy/image/upload/v1783661147/1000100032_zltzg2.jpg",
  "https://res.cloudinary.com/dtb4vozhy/image/upload/v1778495078/WhatsApp_Image_2026-05-11_at_11.49.33_AM_1_xcr5eb.jpg"
];

const MobileAppSection = () => {
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % screenshots.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="app"
      style={{
        background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)",
        padding: isMobile ? "28px 16px" : "40px 0",
        position: "relative",
        overflow: "hidden",
        scrollMarginTop: 90,
      }}
    >
      {/* Background glows */}
      <div style={{ position: "absolute", top: -100, left: -100, width: 450, height: 450, borderRadius: "50%", background: "rgba(59,130,246,0.08)", filter: "blur(80px)" }} />
      <div style={{ position: "absolute", bottom: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(147,197,253,0.15)", filter: "blur(70px)" }} />

      {/*
        Responsive container:
        - sm/md:    px-6  (24px each side)
        - lg:       px-10 (40px each side)
        - xl:       px-16 (64px each side)
        - 2xl+:     fixed width 1400px, centered
      */}
      <div className="w-full px-6 lg:px-10 xl:px-16 2xl:px-0 2xl:w-[1400px] 2xl:mx-auto" style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: isMobile ? 16 : 40,
          }}
        >
          {/* ── LEFT: CONTENT ── */}
          <div style={{ flex: "1 1 0", minWidth: 0, textAlign: "left" }}>

            {/* Badge */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: isMobile ? "5px 12px" : "8px 18px",
              borderRadius: 999,
              fontSize: isMobile ? 10 : 11,
              fontWeight: 700,
              color: "#2563eb",
              border: "1px solid #bfdbfe",
              background: "#fff",
              letterSpacing: "0.08em",
              marginBottom: isMobile ? 10 : 28,
              boxShadow: "0 1px 4px rgba(59,130,246,0.1)",
            }}>
              📱 WONBILLS MOBILE APP
            </span>

            {/* Headline */}
            <h2 style={{
              fontSize: isMobile ? "1.8rem" : "3.5rem",
              fontWeight: 900,
              color: "#1e3a5f",
              lineHeight: 1.1,
              marginBottom: isMobile ? 8 : 22,
              letterSpacing: "-0.03em",
            }}>
              Manage Invoices<br />
              <span style={{ color: "#3b82f6" }}>Anytime, Anywhere.</span>
            </h2>

            {/* Description */}
            <p style={{
              color: "#64748b",
              fontSize: isMobile ? 12 : 15.5,
              lineHeight: isMobile ? 1.55 : 1.8,
              marginBottom: isMobile ? 24 : 36,
              maxWidth: 440,
            }}>
              Create invoices, track payments, and manage your customers right from your pocket.
              Built for business owners who are always on the move.
            </p>

            {/* Feature tags */}
            <div style={{
              display: "flex", flexWrap: "wrap",
              justifyContent: "flex-start",
              gap: isMobile ? 9 : 10,
              marginBottom: isMobile ? 16 : 36,
            }}>
              {["Instant Invoices", "Payment Tracking", "Customer Management", "PDF Export"].map((feat, i) => (
                <span key={i} style={{
                  padding: isMobile ? "3px 8px" : "7px 16px",
                  borderRadius: 999,
                  fontSize: isMobile ? 9 : 12.5,
                  fontWeight: 600,
                  color: "#2563eb",
                  background: "#fff",
                  border: "1px solid #bfdbfe",
                  boxShadow: "0 1px 4px rgba(59,130,246,0.08)",
                }}>{feat}</span>
              ))}
            </div>

            {/* ── STORE BUTTONS ── */}
            <div style={{
              display: "flex",
              flexDirection: "row",
              gap: isMobile ? 7 : 12,
              alignItems: "flex-start",
              marginTop: isMobile ? 0 : 28,
            }}>
              {/* App Store */}
              <a
                href="https://apps.apple.com/in/app/won-bills/id6746782261"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: isMobile ? 7 : 11,
                  padding: isMobile ? "7px 12px" : "10px 18px",
                  background: "#111",
                  borderRadius: 12,
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.15)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                  alt="Apple"
                  style={{ width: 18, height: 18, filter: "invert(1)", flexShrink: 0 }}
                />
                <div>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", margin: 0, fontWeight: 500 }}>Download on the</p>
                  <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", margin: "1px 0 0" }}>App Store</p>
                </div>
              </a>

              {/* Google Play */}
              <a
                href="https://play.google.com/store/apps/details?id=com.nowitservices.wonbills"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: isMobile ? 7 : 11,
                  padding: isMobile ? "7px 12px" : "10px 18px",
                  background: "#111",
                  borderRadius: 12,
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.15)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                <img
                  src="https://res.cloudinary.com/dtb4vozhy/image/upload/v1776929330/Generate__Google_Play_Store_logo_with_transparent_background__in_a_modern_vector_art_style_with_a_flat_design_aesthetic_ajq2rj.png"
                  alt="Google Play"
                  style={{ width: 20, height: 20, objectFit: "contain", flexShrink: 0 }}
                />
                <div>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", margin: 0, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>GET IT ON</p>
                  <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", margin: "1px 0 0" }}>Google Play</p>
                </div>
              </a>
            </div>
          </div>

          {/* ── RIGHT: PHONE FRAME ── */}
          <div style={{
            flexShrink: 0,
            display: "flex",
            justifyContent: isMobile ? "center" : "flex-end",
            alignItems: "center",
            width: isMobile ? "100%" : "auto",
            marginTop: isMobile ? 8 : 0,
          }}>
            <div style={{
              position: "relative",
              width: isMobile ? 180 : "clamp(200px, 22vw, 240px)",
            }}>
              {/* Glow behind phone */}
              <div style={{
                position: "absolute", inset: -25,
                background: "rgba(59,130,246,0.18)",
                borderRadius: isMobile ? "20%" : "50%",
                filter: "blur(30px)",
              }} />

              {/* Phone frame */}
              <div style={{
                background: "#000",
                border: "2.5px solid #444",
                borderRadius: isMobile ? 24 : 30,
                padding: isMobile ? "10px 6px 16px" : "6px 6px 12px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.10)",
                position: "relative",
              }}>

                {/* Notch / Camera island */}
                <div style={{
                  position: "absolute", top: 0, left: "50%",
                  transform: "translateX(-50%)",
                  width: isMobile ? 52 : 68,
                  height: isMobile ? 22 : 26,
                  background: "#000",
                  borderRadius: "0 0 14px 14px",
                  zIndex: 10,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                }}>
                  <div style={{
                    width: isMobile ? 6 : 7, height: isMobile ? 6 : 7,
                    borderRadius: "50%", background: "#1a1a1a",
                    border: "1px solid #333",
                  }} />
                </div>

                {/* Screen */}
                <div style={{
                  borderRadius: isMobile ? 18 : 24,
                  overflow: "hidden",
                  background: "#000",
                  position: "relative",
                  aspectRatio: "9 / 19.5",
                }}>
                  {/* Sliding images */}
                  <div style={{
                    display: "flex",
                    width: `${screenshots.length * 100}%`,
                    transform: `translateX(-${current * (100 / screenshots.length)}%)`,
                    transition: "transform 0.6s ease-in-out",
                  }}>
                    {screenshots.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="app"
                        style={{
                          width: `${100 / screenshots.length}%`,
                          height: "100%",
                          objectFit: "contain",
                          background: "#000",
                        }}
                      />
                    ))}
                  </div>

                  {/* Dots */}
                  <div style={{
                    position: "absolute", bottom: 8, left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex", gap: 4,
                  }}>
                    {screenshots.map((_, i) => (
                      <div
                        key={i}
                        onClick={() => setCurrent(i)}
                        style={{
                          width: 5, height: 5,
                          borderRadius: "50%",
                          background: i === current ? "#3b82f6" : "rgba(255,255,255,0.4)",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MobileAppSection;