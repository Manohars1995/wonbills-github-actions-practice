import React, { useEffect, useRef, useState } from 'react'
import { FaSearch } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import { TbCircleDashedPlus } from "react-icons/tb";
import Tooltip from '../../UI-Elements/Tooltip';
import { HiOutlineDotsVertical } from "react-icons/hi";
import { TbCloudDownload } from "react-icons/tb";
import { TbDatabaseImport } from "react-icons/tb";
import { IoInformationCircleSharp } from "react-icons/io5";
import {
  MdDeleteSweep,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight
} from "react-icons/md";

import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight
} from "react-icons/md";
import ConfirmModal from '../../UI-Elements/modals/ConfirmModal';
import { getSubsDetails } from '../../../services/auth/auth';
import { useNavigate } from 'react-router-dom';

const TableHeader = ({
  searchText = '',
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 50,
  createPath,

  onPrev = () => { },
  onNext = () => { },
  onLast = () => { },
  onFirst = () => { },

  operationsActive = false,
  onSearch = () => { },
  onDownload = () => { },
  onImport = () => { },
}) => {

  const navigate = useNavigate();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const [openOptionsMenu, setOpenOptionsMenu] = useState(false);
  const optionsRef = useRef(null);

  const [showConfirm, setShowConfirm] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setOpenOptionsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const onCreateHandler = async () => {
    navigate(createPath);
    // const status = await getSubsDetails();

    // if (status?.success && createPath) {
    //     navigate(createPath);
    //     return;
    // }

    // Show your custom modal
    // setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    // await handleSubscribe(); //  renew logic
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };


  return (
    <div className="w-full px-2 py-2 flex flex-col gap-2
                  lg:flex-row lg:items-center lg:justify-between">

      {/* LEFT: Search */}
      <div className="flex items-center gap-2 w-full lg:w-auto">
        <div
          className="relative h-10 w-full sm:w-80
                   border-2 border-black/30 rounded-2xl
                   flex items-center gap-2 px-2"
        >
          <FaSearch className="text-lg text-black/30 shrink-0" />
          <input
            type="search"
            className="h-full w-full border-none outline-none bg-transparent"
            value={searchText}
            onChange={onSearch}
            placeholder="Search…"
          />
        </div>

        {/* Tooltip hidden on mobile */}
        <div className="hidden sm:block">
          <Tooltip tooltip='Use "Shift + Click" for multi-sort.' position="right">
            <span
              className="inline-flex items-center justify-center
                       h-6 w-6 text-gray-600 cursor-pointer
                       bg-gray-300 rounded-full"
            >
              <IoInformationCircleSharp className="h-4 w-4" />
            </span>
          </Tooltip>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center justify-between
                    gap-2 w-full lg:w-auto">

        {/* Pagination */}
        <div className="flex items-center gap-2">
          {/* Hide text on small screens */}
          <h3 className="hidden sm:block px-2 py-1 text-sm font-semibold text-black/70">
            {`${startItem}-${endItem} of ${totalItems}`}
          </h3>

          <div className="flex items-center gap-1 bg-black/5 h-10 rounded-2xl px-2 text-lg">
            <button
              className={`p-1 rounded-full hover:bg-black/15
              ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              onClick={onFirst}
              disabled={currentPage === 1}
            >
              <MdOutlineKeyboardDoubleArrowLeft />
            </button>

            <button
              className={`p-1 rounded-full hover:bg-black/15
              ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              onClick={onPrev}
              disabled={currentPage === 1}
            >
              <MdKeyboardArrowLeft />
            </button>

            <button
              className={`p-1 rounded-full hover:bg-black/15
              ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              onClick={onNext}
              disabled={currentPage === totalPages}
            >
              <MdKeyboardArrowRight />
            </button>

            <button
              className={`p-1 rounded-full hover:bg-black/15
              ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              onClick={onLast}
              disabled={currentPage === totalPages}
            >
              <MdOutlineKeyboardDoubleArrowRight />
            </button>
          </div>
        </div>

        {/* Options + Create */}
        <div className="flex items-center gap-2">
          {operationsActive && (
            <div className="relative" ref={optionsRef}>
              <button
                onClick={() => setOpenOptionsMenu(!openOptionsMenu)}
                className="h-10 w-10 rounded-2xl
                         bg-[#3965FF] text-white
                         flex items-center justify-center
                         hover:bg-[#1447F7]"
              >
                <HiOutlineDotsVertical />
              </button>

              {openOptionsMenu && (
                <div
                  className="absolute right-0 mt-2 z-50
                           bg-white border border-black/10
                           rounded-2xl shadow-xl w-44 p-1"
                >
                  <ul className="space-y-1 text-sm">
                    <li
                      onClick={() => {
                        onDownload()
                        setOpenOptionsMenu(false)
                      }}
                      className="flex items-center gap-2 px-2 py-2
                               rounded-xl hover:bg-gray-200 cursor-pointer"
                    >
                      <TbCloudDownload className="text-xl text-gray-600" />
                      Download
                    </li>

                    <li
                      onClick={() => document.getElementById("excelImport").click()}
                      className="flex items-center gap-2 px-2 py-2
                               rounded-xl hover:bg-gray-200 cursor-pointer"
                    >
                      <TbDatabaseImport className="text-xl text-gray-600" />
                      Import
                    </li>
                  </ul>

                  <input
                    id="excelImport"
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={(e) => {
                      onImport(e)
                      setOpenOptionsMenu(false)
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Create button shrinks on mobile */}
          <button
            onClick={onCreateHandler}
            className="h-10 px-4 rounded-2xl
                     bg-[#3965FF] text-white
                     flex items-center gap-2
                     hover:bg-[#1447F7] cursor-pointer"
          >
            <span className="hidden sm:inline font-semibold">Create</span>
            <TbCircleDashedPlus className="text-2xl" />
          </button>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Please renew your subscription."
          confirmText="Renew"
          cancelText="OK"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  )

}

export default React.memo(TableHeader);