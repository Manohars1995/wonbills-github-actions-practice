import { useContext, useRef, useState } from "react";
import Draggable from "react-draggable";
import { evaluate } from "mathjs";
import { WonBillsContext } from "../../../store/WonBillsContext";
import { MdOutlineCancel, MdBackspace } from "react-icons/md";

const MAX_LENGTH = 30;
const OPERATORS = ["+", "-", "*", "/"];

const BillingCalculator = () => {
  const { isCalculatorOpen, setIsCalculatorOpen } =
    useContext(WonBillsContext);

  const nodeRef = useRef(null);
  const [expression, setExpression] = useState("0");

  /* ---------------- Helpers ---------------- */

  const append = (value) => {
    setExpression((prev) => {
      if (prev === "Error") return "0";

      // Replace operator if last char is operator
      if (
        OPERATORS.includes(value) &&
        OPERATORS.includes(prev.slice(-1))
      ) {
        return prev.slice(0, -1) + value;
      }

      // Prevent multiple decimals in same number
      if (value === ".") {
        const lastNumber = prev.split(/[+\-*/]/).pop();
        if (lastNumber.includes(".")) return prev;
      }

      if (prev === "0" && !isNaN(value)) return value;
      if (prev.length >= MAX_LENGTH) return prev;

      return prev + value;
    });
  };

  const clearAll = () => setExpression("0");

  const backspace = () => {
    setExpression((prev) =>
      prev.length === 1 ? "0" : prev.slice(0, -1)
    );
  };

  const toggleSign = () => {
    setExpression((prev) => {
      if (prev === "0" || prev === "Error") return prev;

      const match = prev.match(/(-?\d*\.?\d+)$/);
      if (!match) return prev;

      const number = match[1];
      const toggled = number.startsWith("-")
        ? number.slice(1)
        : "-" + number;

      return prev.slice(0, prev.length - number.length) + toggled;
    });
  };

  const percent = () => {
    try {
      const result = evaluate(expression);
      setExpression(String(result / 100));
    } catch {
      setExpression("Error");
    }
  };

  const equals = () => {
    try {
      const result = evaluate(expression);
      setExpression(
        Number(result).toFixed(2).replace(/\.00$/, "")
      );
    } catch {
      setExpression("Error");
    }
  };

  /* ---------------- UI ---------------- */

  if (!isCalculatorOpen) return null;

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".drag-handle"
      cancel=".no-drag"
    >
      <div
        ref={nodeRef}
        className="
          fixed top-28 right-10 md:right-28
          w-80 bg-white
          border-2 border-gray-400
          rounded-3xl shadow-2xl
          z-50 select-none
        "
      >
        {/* Header */}
        <div className="drag-handle cursor-move flex justify-between items-center px-3 py-2 bg-gray-100 rounded-t-3xl">
          <span className="font-semibold text-sm">
            Billing Calculator
          </span>
          <button
            onClick={() => setIsCalculatorOpen(false)}
            className="no-drag text-gray-500 hover:text-black text-2xl"
          >
            <MdOutlineCancel />
          </button>
        </div>

        {/* Display */}
        <div className="px-4 py-4 bg-gray-50 text-right text-2xl font-mono overflow-hidden">
          {expression}
        </div>

        {/* Keys */}
        <div className="grid grid-cols-4 gap-2 p-4">
          <Key label="C" onClick={clearAll} />
          <Key label={<MdBackspace size={18} />} onClick={backspace} />
          <Key label="%" onClick={percent} />
          <Key label="÷" onClick={() => append("/")} />

          <Key label="7" onClick={() => append("7")} />
          <Key label="8" onClick={() => append("8")} />
          <Key label="9" onClick={() => append("9")} />
          <Key label="×" onClick={() => append("*")} />

          <Key label="4" onClick={() => append("4")} />
          <Key label="5" onClick={() => append("5")} />
          <Key label="6" onClick={() => append("6")} />
          <Key label="-" onClick={() => append("-")} />

          <Key label="1" onClick={() => append("1")} />
          <Key label="2" onClick={() => append("2")} />
          <Key label="3" onClick={() => append("3")} />
          <Key label="+" onClick={() => append("+")} />

          <Key label="±" onClick={toggleSign} />
          <Key label="0" onClick={() => append("0")} />
          <Key label="." onClick={() => append(".")} />
          <Key label="=" onClick={equals} primary />
        </div>
      </div>
    </Draggable>
  );
};

/* ---------------- Key Button ---------------- */

const Key = ({ label, onClick, primary }) => (
  <button
    onClick={onClick}
    className={`
      py-3 rounded-xl font-semibold text-lg
      flex items-center justify-center
      ${primary
        ? "bg-black text-white hover:bg-gray-800"
        : "bg-gray-200 hover:bg-gray-300"}
    `}
  >
    {label}
  </button>
);

export default BillingCalculator;
