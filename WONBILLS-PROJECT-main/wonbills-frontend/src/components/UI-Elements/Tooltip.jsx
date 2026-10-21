"use client";
import React, { useState, useRef } from "react";
import { twMerge } from "tailwind-merge";

const Tooltip = ({
  children,
  tooltip,
  className = "",
  position = "top",
  delayShow = 300,
  delayHide = 150,
}) => {
  const [visible, setVisible] = useState(false);
  const showTimer = useRef(null);
  const hideTimer = useRef(null);

  const handleMouseEnter = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => setVisible(true), delayShow);
  };

  const handleMouseLeave = () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), delayHide);
  };

  const getPositionClass = () => {
    switch (position) {
      case "bottom":
        return "top-full mt-1 left-1/2 -translate-x-1/2";
      case "left":
        return "right-full mr-2 top-1/2 -translate-y-1/2";
      case "right":
        return "left-full ml-2 top-1/2 -translate-y-1/2";
      case "top":
      default:
        return "-top-7 left-1/2 -translate-x-1/2";
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {visible && tooltip && (
        <span
          className={twMerge(
            `absolute text-[9px] whitespace-nowrap bg-white text-black px-2 py-1 rounded-xl shadow-md transition-all duration-200 z-50`,
            getPositionClass(),
            className
          )}
        >
          {tooltip}
        </span>
      )}
    </div>
  );
};

export default Tooltip;
