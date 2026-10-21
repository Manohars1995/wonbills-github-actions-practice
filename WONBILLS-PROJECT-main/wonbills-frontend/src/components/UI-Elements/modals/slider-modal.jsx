import React from "react";
import ReactModal from "react-modal";
import { IoMdCloseCircleOutline } from "react-icons/io";

ReactModal.setAppElement("#root");

const SlideModal = ({ isOpen, onClose, children, title }) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="
        fixed inset-0
        bg-black/40
        backdrop-blur-[1px]
      "
      className={`
        fixed z-50
        top-3 bottom-3 right-2
        w-[calc(100%-1rem)]
        sm:w-[22rem]
        md:w-[26rem]
        lg:w-[28rem]

        bg-gray-200
        border border-black/20
        rounded-2xl
        shadow-xl
        p-3
        flex flex-col
        outline-none

        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
      style={{
        overlay: { zIndex: 1000 },
        content: { zIndex: 1001 }
      }}
      closeTimeoutMS={300}
    >
      {/* ---------------- HEADER ---------------- */}
      <div className="flex items-center justify-between shrink-0 pb-2 border-b border-dashed border-black/10">
        <h4 className="text-base sm:text-lg font-semibold truncate">
          {title}
        </h4>

        <button
          className="text-gray-600 text-2xl hover:text-black"
          onClick={onClose}
          aria-label="Close"
        >
          <IoMdCloseCircleOutline />
        </button>
      </div>

      {/* ---------------- BODY ---------------- */}
      <div className="flex-1 min-h-0 pt-2 overflow-hidden">
        {children}
      </div>
    </ReactModal>
  );
};

export default SlideModal;
