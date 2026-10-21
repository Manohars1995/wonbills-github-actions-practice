import React from "react";

const Tile = ({
  children,
  title = "Total Amount",
  amount = 400,
  tax = 200,
  styles = "",
  bg = "bg-gray-50",
  border = "border-gray-200",
  text = "text-gray-700"
}) => {
  return (
    <section
      className={`rounded-2xl border ${border} ${bg} p-4 shadow-sm flex items-center gap-4 cursor-default`}
    >
      {/* Icon */}
      <div
        className={`h-11 w-11 flex items-center justify-center rounded-full text-xl ${styles}`}
      >
        {children}
      </div>

      {/* Content */}
      <div className="flex flex-col">
        <p className={`text-sm font-medium ${text}`}>{title}</p>

        <h3 className="text-xl font-bold text-gray-800">
          ₹ {Number(amount).toLocaleString("en-IN")}
        </h3>

        {tax !== undefined && (
          <p className="text-xs font-medium text-red-500">
            ₹ {Number(tax).toLocaleString("en-IN")} (Tax)
          </p>
        )}
      </div>
    </section>
  );
};

export default Tile;
