import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

const Accordion = ({ title, children, defaultOpen = false, place = '' }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`bg-[#F5F6FF] ${place === "top"
        ? "rounded-t-3xl"
        : place === "bottom"
          ? "rounded-b-3xl"
          : "rounded-md"
        } ${open ? "rounded-b-4xl border-b-2 border-[#F5F6FF]" : ""}
            `}
    >

      {/* HEADER */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-6 py-4 text-lg font-medium text-gray-800 rounded-t-3xl"
      >
        <span>{title}</span>

        <IoIosArrowDown
          className={`text-2xl transform transition-all duration-300 ${open ? "rotate-180" : "rotate-0"
            }`}
        />
      </button>

      {/* CONTENT */}
      <div
        className={`transition-all duration-300 overflow-hidden ${open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="p-6 bg-white rounded-b-3xl shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;
