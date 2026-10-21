import React from "react";

const UploadProgressBar = ({ progress = 0, visible = false }) => {
  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50
        w-72 bg-blue-200 p-3 rounded-2xl shadow-lg
        transition-all duration-500 ease-in-out
        ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0 pointer-events-none"
        }
      `}
    >
      <div className="flex justify-between text-xs text-gray-700 mb-1">
        <span>Uploading…</span>
        <span>{progress}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default UploadProgressBar;
