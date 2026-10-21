import React, { useState } from "react";
import { HiArrowNarrowDown, HiArrowNarrowUp } from "react-icons/hi";
import { LuArrowDownUp } from "react-icons/lu";
import { TbEdit } from "react-icons/tb";
import { GrStatusGood } from "react-icons/gr";
import { MdCancel, MdOutlineBlock } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Tooltip from "../../UI-Elements/Tooltip";
import StatusIndicator from "./StatusIndicator";
import { HiCloudDownload } from "react-icons/hi";
import ConfirmModal from "../../UI-Elements/modals/ConfirmModal";

/* =======================
   DISPLAY HELPERS
======================= */

const isValidDate = (value) => {
  if (!value) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

const normalizeLabel = (value) =>
  value
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

/* =======================
   ID DETECTION (STRICT)
======================= */

const isMongoId = (value) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

const isUUID = (value) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const isStructuredId = (value) =>
  typeof value === "string" &&
  /^[A-Z]{2,10}-[A-Z0-9]{3,20}$/i.test(value);

const looksLikeId = (value) =>
  isMongoId(value) || isUUID(value) || isStructuredId(value);

/* =======================
   SINGLE DISPLAY PIPELINE
   (COLUMN-DRIVEN)
======================= */

const getDisplayValue = (value, column) => {
  if (value === null || value === undefined) return "--";

  // DATE — only when column explicitly declares it
  if (column?.type === "date") {
    if (!isValidDate(value)) return "--";
    return formatDate(value);
  }

  if (typeof value === "string") {
    // IDs must NEVER be normalized
    if (looksLikeId(value)) return value;

    // Already readable
    if (value.includes(" ")) return value;

    return normalizeLabel(value);
  }

  return value;
};

/* =======================
   STATUS CONFIG
======================= */

const INVOICE_STATUS_CONFIG = {
  true: {
    tooltip: "Active",
    className: "text-green-500 hover:text-green-800 hover:bg-green-100",
    icon: <GrStatusGood />
  },
  false: {
    tooltip: "Inactive",
    className: "text-red-500 hover:text-red-800 hover:bg-red-100",
    icon: <MdCancel />
  },
  active: {
    tooltip: "Active",
    className: "text-green-500 hover:text-green-800 hover:bg-green-100",
    icon: <GrStatusGood />
  },
  inactive: {
    tooltip: "Inactive",
    className: "text-red-500 hover:text-red-800 hover:bg-red-100",
    icon: <MdCancel />
  },
  initiated: {
    tooltip: "Initiated",
    className: "text-blue-500 hover:text-blue-800 hover:bg-blue-100",
    icon: <GrStatusGood />
  },
  closed: {
    tooltip: "Closed",
    className: "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
    icon: <MdOutlineBlock />
  },
  default: {
    tooltip: "Unknown",
    className: "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
    icon: <MdOutlineBlock />
  }
};

/* =======================
   TABLE
======================= */

const Table = ({
  columns,
  data,
  sortFields,
  onSort,
  editPath,
  errorMsg = "No records found",
  download = false,
  onDownload = () => { },
  onToggleStatus = () => { }
}) => {
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(false);

  const getSortState = (field) =>
    sortFields?.find((s) => s.column === field) || null;

  const onEdit = (id) => navigate(`/${editPath}/${id}`);


  const openConfirm = (row) => {
    setSelectedRow(row);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedRow) return;

    setLoading(true);
    try {
      await onToggleStatus(selectedRow.custom_id, selectedRow.status);
      setConfirmOpen(false);
      setSelectedRow(null);
    } catch (err) {
      console.error("Status update failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="overflow-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 text-xs sm:text-sm">
        <table
          className="
              w-full
            "
        >
          <thead className="sticky top-0 z-30 bg-gray-100">
            <tr>
              {columns.map((col, i) => {
                const sortState = getSortState(col.field);

                return (
                  <th
                    key={i}
                    onClick={(e) => onSort(col.field, e.shiftKey, col.sort)}
                    className={`px-4 py-2 font-bold text-[#2B3674] select-none group ${i === 0 ? "rounded-tl-xl" : ''} ${col.sort ? "cursor-pointer" : ""
                      }`}
                    style={{ width: col.width }}
                  >
                    <div className="flex items-center gap-1 min-w-0">
                      <span
                        className="truncate text-xs sm:text-sm"
                        title={col.headerName}
                      >
                        {col.headerName}
                      </span>

                      {col.sort && (
                        <span
                          className={`h-6 w-6 flex items-center justify-center rounded-full transition
                      ${sortState
                              ? "bg-blue-100 text-blue-600"
                              : "bg-black/5 opacity-0 group-hover:opacity-100"
                            }
                    `}
                        >
                          {!sortState ? (
                            <LuArrowDownUp size={12} />
                          ) : sortState.order === "asc" ? (
                            <HiArrowNarrowUp size={14} />
                          ) : (
                            <HiArrowNarrowDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}

              <th className="px-4 py-2 rounded-tr-xl text-[#2B3674] text-center">
                <span className="truncate text-xs sm:text-sm" title="Actions">
                  Actions
                </span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-10 text-gray-400 w-fit"
                >
                  <span className="text-xs sm:text-sm truncate ">
                    {errorMsg || 'No records found'}
                  </span>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-black/5 hover:bg-gray-50/80 transition"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-4 py-2 whitespace-nowrap"
                    >
                      {col.field === "custom_id" ? (
                        <button
                          type="button"
                          onClick={() => onEdit(row.custom_id)}
                          className="
                      block
                      max-w-full
                      truncate
                      text-blue-600
                      font-medium
                      text-xs sm:text-sm
                      hover:underline
                      hover:text-blue-800
                      transition
                    "
                          title={row.custom_id}
                        >
                          {getDisplayValue(row.custom_id, col)}
                        </button>
                      ) : (
                        <span
                          className="
                      block
                      max-w-full
                      truncate
                      text-xs sm:text-sm
                    "
                          title={String(getDisplayValue(row[col.field], col))}
                        >
                          {getDisplayValue(row[col.field], col)}
                        </span>
                      )}
                    </td>
                  ))}

                  <td className="px-2 py-1 flex items-center justify-center gap-2 text-lg min-w-[150px]">
                    <Tooltip tooltip="Edit" position="top">
                      <button
                        type="button"
                        onClick={() => onEdit(row?.custom_id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center 
                    text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition"
                      >
                        <TbEdit size={18} />
                      </button>
                    </Tooltip>

                    <span className="h-5 w-px bg-gray-300" />

                    {download && (
                      <>
                        <Tooltip tooltip="Download pdf" position="top">
                          <button
                            type="button"
                            onClick={() => onDownload(row?.custom_id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center  
                        text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition"
                          >
                            <HiCloudDownload size={18} />
                          </button>
                        </Tooltip>
                        <span className="h-5 w-px bg-gray-300" />
                      </>
                    )}

                    <StatusIndicator
                      value={row.status}
                      onClick={() => openConfirm(row)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>



      {confirmOpen && (
        <ConfirmModal
          title="Confirm Status Change"
          confirmText="Yes, Update"
          cancelText="Cancel"
          loading={loading}
          onCancel={() => !loading && setConfirmOpen(false)}
          onConfirm={handleConfirm}
        >
          Are you sure you want to{" "}
          <strong>
            {selectedRow?.status === true ||
              String(selectedRow?.status).toLowerCase() === "active"
              ? "deactivate"
              : "activate"}
          </strong>{" "}
          this record?
        </ConfirmModal>
      )}
    </>
  );
};


//  WRAPPER

const UseTable = ({
  columns = [],
  data = [],
  sorting,
  onSort,
  editPath = "",
  errorMsg = "",
  download = false,
  onDownload = () => { },
  onToggleStatus = () => { }
}) => (
  <div className="relative max-w-full rounded-xl flex flex-col border border-black/10 bg-white min-h-0 ">
    <Table
      columns={columns}
      data={data}
      sortFields={sorting}
      onSort={onSort}
      editPath={editPath}
      errorMsg={errorMsg}
      download={download}
      onDownload={onDownload}
      onToggleStatus={onToggleStatus}
    />
  </div>
);

export default React.memo(UseTable);
