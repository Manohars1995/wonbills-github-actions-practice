import React from 'react'
import { MdCancel, MdOutlineBlock } from "react-icons/md";


const ClearBtn = ({ sorting, onSort = (() => { }) }) => {
    return (
        <div
            className={`
                    absolute left-1/2 -translate-x-1/2 bottom-4 bg-red-200
                    w-24 flex items-center justify-center py-1 px-1 rounded-full
                    transition-all duration-300 ease-out 
                    ${sorting.length > 0
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0 pointer-events-none"
                }
                `}
        >
            <button
                type="button"
                onClick={() => onSort([])}
                className="bg-red-400 w-full rounded-full cursor-pointer flex items-center justify-center gap-1 text-white py-0.5"
            >
                <MdCancel size={18} />
                Clear
            </button>
        </div>
    )
}

export default ClearBtn
