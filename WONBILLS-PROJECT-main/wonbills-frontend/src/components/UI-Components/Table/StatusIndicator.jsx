import React from "react";
import { GrStatusGood } from "react-icons/gr";
import { MdCancel, MdOutlineBlock } from "react-icons/md";
import Tooltip from "../../UI-Elements/Tooltip";

const STATUS_CONFIG = {
  true: {
    tooltip: "Active",
    className: "text-green-500 hover:text-green-800 hover:bg-green-100",
    icon: <GrStatusGood />,
    clickable: true
  },
  false: {
    tooltip: "Inactive",
    className: "text-red-500 hover:text-red-800 hover:bg-red-100",
    icon: <MdCancel />,
    clickable: true
  },
  active: {
    tooltip: "Active",
    className: "text-green-500 hover:text-green-800 hover:bg-green-100",
    icon: <GrStatusGood />,
    clickable: true
  },
  inactive: {
    tooltip: "Inactive",
    className: "text-red-500 hover:text-red-800 hover:bg-red-100",
    icon: <MdCancel />,
    clickable: true
  },
  initiated: {
    tooltip: "Initiated",
    className: "text-blue-500 bg-blue-50 cursor-not-allowed",
    icon: <GrStatusGood />,
    clickable: false
  },
  closed: {
    tooltip: "Closed",
    className: "text-gray-400 bg-gray-100 cursor-not-allowed",
    icon: <MdOutlineBlock />,
    clickable: false
  },
  default: {
    tooltip: "Unknown",
    className: "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
    icon: <MdOutlineBlock />,
    clickable: false
  }
};

const normalizeKey = (value) => {
  if (value === null || value === undefined) return "default";
  if (typeof value === "boolean") return String(value);
  if (typeof value === "string") return value.toLowerCase();
  return "default";
};

const StatusIndicator = ({ value, onClick }) => {
  const key = normalizeKey(value);
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.default;

  const isClickable = cfg.clickable && typeof onClick === "function";

  return (
    <Tooltip tooltip={cfg.tooltip} position="top">
      <span
        role={isClickable ? "button" : "status"}
        tabIndex={isClickable ? 0 : -1}
        aria-label={`Status: ${cfg.tooltip}`}
        onClick={isClickable ? onClick : undefined}
        onKeyDown={
          isClickable
            ? (e) => e.key === "Enter" && onClick?.()
            : undefined
        }
        className={`
          w-8 h-8
          flex items-center justify-center
          rounded-full
          transition focus:outline-none focus:ring-2 focus:ring-offset-1
          ${cfg.className}
        `}
      >
        {React.cloneElement(cfg.icon, { size: 18 })}
      </span>
    </Tooltip>
  );
};

export default React.memo(StatusIndicator);
