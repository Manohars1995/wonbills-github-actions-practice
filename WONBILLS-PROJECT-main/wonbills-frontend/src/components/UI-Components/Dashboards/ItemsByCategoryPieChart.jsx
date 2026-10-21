import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

/* ---------------- Helpers ---------------- */
const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

/** * Expected data format: * { * product: 120, * service: 45, * expense: 30 * } */

/* ---------------- Component ---------------- */
const ItemsByCategoryPieChart = ({ data = {} }) => {
  const total = (data.product || 0) + (data.service || 0) + (data.expense || 0);

  const hasData = total > 0;

  const chartData = useMemo(
    () => ({
      labels: ["Products", "Services", "Expenses"],
      datasets: [
        {
          data: [data.product || 0, data.service || 0, data.expense || 0],
          backgroundColor: ["#94a3b8", "#a7f3d0", "#fca5a5"],
          hoverBackgroundColor: ["#64748b", "#6ee7b7", "#f87171"],
          borderWidth: 0,
          offset: 6,
          cutout: "0%"
        }
      ]
    }),
    [data]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 16,
            color: "#374151",
            font: { size: 12, weight: "500" }
          }
        },
        tooltip: {
          backgroundColor: "#111827",
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (ctx) => {
              const percent = total ? ((ctx.raw / total) * 100).toFixed(1) : 0;
              return `${ctx.label}: ${formatNumber(ctx.raw)} (${percent}%)`;
            }
          }
        }
      }
    }),
    [total]
  );

  return (
    <div className="w-full h-full border-2 border-gray-300 rounded-2xl shadow-sm p-4 flex flex-col">
      <h2 className="text-sm sm:text-base font-bold text-gray-800 mb-2">
        Items by Category
      </h2>

      <div className="relative flex-1 flex items-center justify-center">
        {hasData ? (
          <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        ) : (
          <div className="text-sm text-gray-400 text-center">
            No items available
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemsByCategoryPieChart;
