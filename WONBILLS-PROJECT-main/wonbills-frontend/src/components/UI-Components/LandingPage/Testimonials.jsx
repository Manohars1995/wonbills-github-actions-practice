/* ─── Testimonials ─── */
export const Testimonials = () => {
  const reviews = [
    {
      text: "Billing App has completely transformed how we manage our invoicing. It's fast, reliable, and incredibly easy to use.",
      name: "Budi Santoso",
      role: "Operations Manager, PT. Logam",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      initials: "BS",
      color: "#3b82f6",
    },
    {
      text: "The real-time reports and analytics help us make better business decisions every single day. Highly recommend.",
      name: "Sari Dewi",
      role: "Founder, Griyata, Surabaya",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      initials: "SD",
      color: "#8b5cf6",
    },
    {
      text: "Multi-terminal support is a game changer for our operations across different locations. It just works flawlessly.",
      name: "Rizky Pratama",
      role: "CEO, Nusantara Firm",
      image: "https://randomuser.me/api/portraits/men/76.jpg",
      initials: "RP",
      color: "#06b6d4",
    },
  ];

  return (
    <section className="w-full bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[12px] font-bold text-blue-500 tracking-widest uppercase mb-3">
            What Our Customers Say
          </p>
          <h2 className="text-[32px] sm:text-[38px] font-black text-gray-900">
            Trusted by businesses worldwide
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <p className="text-[14px] text-gray-600 leading-relaxed mb-6 italic">
                "{r.text}"
              </p>

              <div className="flex items-center gap-3">

                {/* Avatar */}
                <div className="w-11 h-11 rounded-full overflow-hidden">
                  {r.image ? (
                    <img
                      src={r.image}
                      alt={r.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}

                  {/* Fallback Initial */}
                  <div
                    className="w-full h-full items-center justify-center text-white font-bold text-[13px] hidden"
                    style={{ background: r.color }}
                  >
                    {r.initials}
                  </div>
                </div>

                {/* Info */}
                <div>
                  <p className="text-[13px] font-bold text-gray-900">
                    {r.name}
                  </p>
                  <p className="text-[12px] text-gray-400">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};