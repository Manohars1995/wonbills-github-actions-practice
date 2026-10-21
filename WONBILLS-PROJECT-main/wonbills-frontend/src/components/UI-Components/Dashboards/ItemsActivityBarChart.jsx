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

/* ---------------- Component ---------------- */
const ItemsActivityBarChart = ({ data = [] }) => {
    const chartData = useMemo(() => ({
        labels: data.map(d => d.month),
        datasets: [
            {
                label: "Items Added",
                data: data.map(d => d.added),
                backgroundColor: ctx => {
                    const { chart } = ctx;
                    const { ctx: canvas, chartArea } = chart;
                    if (!chartArea) return "#93c5fd";

                    const gradient = canvas.createLinearGradient(
                        0,
                        chartArea.top,
                        0,
                        chartArea.bottom
                    );
                    gradient.addColorStop(0, "#bfdbfe"); // light blue
                    gradient.addColorStop(1, "#93c5fd"); // soft blue
                    return gradient;
                },
                borderRadius: 8,
                barThickness: 18,
                maxBarThickness: 20
            },
            {
                label: "Items Modified",
                data: data.map(d => d.modified),
                backgroundColor: ctx => {
                    const { chart } = ctx;
                    const { ctx: canvas, chartArea } = chart;
                    if (!chartArea) return "#fbbf24";

                    const gradient = canvas.createLinearGradient(
                        0,
                        chartArea.top,
                        0,
                        chartArea.bottom
                    );
                    gradient.addColorStop(0, "#fde68a"); // light amber
                    gradient.addColorStop(1, "#fbbf24"); // soft amber
                    return gradient;
                },
                borderRadius: 8,
                barThickness: 18,
                maxBarThickness: 20
            }
        ]
    }), [data]);

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 800,
            easing: "easeOutQuart"
        },
        plugins: {
            legend: {
                position: "top",
                align: "end",
                labels: {
                    usePointStyle: true,
                    pointStyle: "rectRounded",
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
                        `${ctx.dataset.label}: ${ctx.raw} items`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 5,
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
                Items Added vs Modified
            </h2>

            <div className="relative flex-1">
                <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
        </div>
    );
};

export default ItemsActivityBarChart;
