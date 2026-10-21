import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

/* ---------------- Helpers ---------------- */
const formatCurrency = (value) =>
  `₹${Number(value).toLocaleString("en-IN")}`;

/* ---------------- Component ---------------- */
const PaymentsYearlyBarChart = ({ data = [] }) => {
  const chartData = useMemo(() => ({
    labels: data.map(d => d.month),
    datasets: [
      {
        label: "Requested",
        data: data.map(d => d.requested),
        backgroundColor: ctx => {
          const { chart } = ctx;
          const { ctx: canvas, chartArea } = chart;
          if (!chartArea) return "#F59E9E";

          const gradient = canvas.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );
          gradient.addColorStop(0, "#FBC4C4"); // soft coral (top)
          gradient.addColorStop(1, "#F59E9E"); // muted rose (bottom)
          return gradient;
        },
        borderRadius: 8,
        barThickness: 20,
        maxBarThickness: 22
      },
      {
        label: "Received",
        data: data.map(d => d.received),
        backgroundColor: ctx => {
          const { chart } = ctx;
          const { ctx: canvas, chartArea } = chart;
          if (!chartArea) return "#7FD1C6";

          const gradient = canvas.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );
          gradient.addColorStop(0, "#BFE6E1"); // light aqua (top)
          gradient.addColorStop(1, "#7FD1C6"); // soft teal (bottom)
          return gradient;
        },
        borderRadius: 8,
        barThickness: 20,
        maxBarThickness: 22
      }

    ]
  }), [data]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 900,
      easing: "easeOutQuart"
    },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          pointStyle: "rectRounded",
          boxHeight: 8,
          boxWidth: 8,
          padding: 16,
          color: "#374151",
          font: {
            size: 12,
            weight: "500"
          }
        }
      },
      tooltip: {
        backgroundColor: "#111827",
        padding: 12,
        titleFont: { size: 13, weight: "600" },
        bodyFont: { size: 12 },
        displayColors: false,
        callbacks: {
          label: ctx =>
            `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: formatCurrency,
          color: "#6b7280",
          font: { size: 11 }
        },
        grid: {
          color: "#f3f4f6",
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: "#6b7280",
          font: { size: 11 }
        },
        grid: {
          display: false
        }
      }
    }
  }), []);

  return (
    <div className="w-full h-full border-2 border-gray-300 rounded-2xl shadow-sm p-4 flex flex-col">
      <h2 className="text-sm sm:text-base font-bold text-gray-800 mb-2">
        Payments Requested vs Received (Yearly)
      </h2>

      <div className="relative flex-1">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PaymentsYearlyBarChart;
