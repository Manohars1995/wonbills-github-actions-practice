import React from "react";

const TableSkeleton = ({ rows = 15, columns = 6 }) => {
    return (
        <div className="w-full h-full overflow-hidden bg-white rounded-xl border border-black/5">
            <table className="min-w-[800px] w-full border-separate border-spacing-0">
                <thead>
                    <tr className="bg-gray-50">
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="px-4 py-3"><div className="h-4 w-20 bg-gray-200 animate-pulse rounded" /></th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-gray-50">
                            {Array.from({ length: columns }).map((_, colIdx) => (
                                <td key={colIdx} className="px-4 py-4">
                                    <div
                                        className="bg-gray-100 h-4 rounded animate-pulse"
                                        style={{ width: `${40 + Math.random() * 40}%` }}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default React.memo(TableSkeleton);
