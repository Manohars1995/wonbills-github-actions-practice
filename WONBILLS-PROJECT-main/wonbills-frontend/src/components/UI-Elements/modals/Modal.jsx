import React from "react";
import ReactModal from "react-modal";
import { IoMdCloseCircleOutline } from "react-icons/io";

ReactModal.setAppElement("#root");

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  centered = false,
}) => {
  const positionClasses = centered
    ? `
        top-1/2 left-1/2
        -translate-x-1/2 -translate-y-1/2
      `
    : `
        top-4 bottom-4 left-1/2
        -translate-x-1/2
      `;

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black/40 z-40"
      className={`
        absolute
        ${positionClasses}
        w-[95vw] sm:w-[85vw] md:w-[70vw] lg:w-[55vw]
        max-h-[90vh]
        bg-gray-200 border border-black/20
        rounded-2xl sm:rounded-3xl
        shadow-xl
        outline-none
        flex flex-col
        overflow-hidden
        p-1
      `}
    >
      {/* ---------- HEADER ---------- */}
      <div className="
        flex justify-between items-center
        px-3 sm:px-4
        py-2
        border-b border-dashed border-gray-400
        bg-gray-200
        sticky top-0 z-10
      ">
        <h4 className="text-base sm:text-lg font-bold truncate">
          {title}
        </h4>

        <button
          type="button"
          className="
            text-gray-600
            text-xl sm:text-2xl
            hover:text-black
            cursor-pointer
            flex-shrink-0
          "
          onClick={onClose}
        >
          <IoMdCloseCircleOutline />
        </button>
      </div>

      {/* ---------- BODY ---------- */}
      <div className="
        flex-1
        overflow-y-auto
        p-2 sm:p-3
      ">
        {children}
      </div>
    </ReactModal>
  );
};

export default React.memo(Modal);
