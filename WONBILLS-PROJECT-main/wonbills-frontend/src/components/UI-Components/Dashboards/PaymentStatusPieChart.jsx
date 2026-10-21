import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

/* ---------------- Helpers ---------------- */
const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-IN");

/* ---------------- Component ---------------- */
const PaymentStatusPieChart = ({ data = {} }) => {

    const total =
        (data.received || 0) +
        (data.requested || 0) +
        (data.scheduled || 0) +
        (data.saved || 0);

    const hasData = total > 0;

    const chartData = useMemo(() => ({
        labels: ["Received", "Requested", "Scheduled"],
        datasets: [
            {
                data: [
                    data.received || 0,
                    data.requested || 0,
                    data.scheduled || 0,
                    // data.saved || 0
                ],
                backgroundColor: [
                    "#8B8CF0",
                    "#F2A65A",
                    "#6CBFCC",
                    // "#9CA3AF"
                ],
                hoverBackgroundColor: [
                    "#7C7DE0",
                    "#E6933F",
                    "#5AAFBF",
                    // "#6B7280"
                ],
                borderWidth: 0,
                offset: 6
            }
        ]
    }), [data]);

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        animation: hasData
            ? { duration: 900, easing: "easeOutQuart" }
            : false,
        plugins: {
            legend: hasData
                ? {
                    position: "right",
                    labels: {
                        usePointStyle: true,
                        pointStyle: "circle",
                        padding: 16,
                        color: "#374151",
                        font: { size: 12, weight: "500" }
                    }
                }
                : { display: false },
            tooltip: hasData
                ? {
                    backgroundColor: "#111827",
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (ctx) => {
                            const percent = total
                                ? ((ctx.raw / total) * 100).toFixed(1)
                                : 0;
                            return `${ctx.label}: ${formatNumber(ctx.raw)} (${percent}%)`;
                        }
                    }
                }
                : { enabled: false }
        }
    }), [hasData, total]);

    return (
        <div className="w-full h-full border-2 border-gray-300 rounded-2xl shadow-sm p-4 flex flex-col">
            <h2 className="text-sm sm:text-base font-bold text-gray-800 mb-2">
                Payment Status Distribution
            </h2>

            <div className="relative flex-1 flex items-center justify-center">
                {hasData ? (
                    <Pie data={chartData} options={options} />
                ) : (
                    <div className="text-sm text-gray-400 text-center">
                        No payment activity available
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentStatusPieChart;
