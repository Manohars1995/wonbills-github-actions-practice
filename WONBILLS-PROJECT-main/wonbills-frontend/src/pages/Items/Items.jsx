import React, { useCallback, useEffect, useState } from "react";
import TableHeader from "../../components/UI-Components/Table/TableHeader";
import UseTable from "../../components/UI-Components/Table/useTable";
import useDebouncedSearch from "../../hooks/useDebouncedSearch";
import { showToast } from "../../components/UI-Elements/Toast";
import { downloadItemExcelTemp, getItems, importItemsExcelData, toggleItemStatus } from "../../services/items/items";
import usePagination from "../../hooks/usePagination";
import TableSkeleton from "../../components/UI-Elements/Loaders/TableSkeleton";
import { columns, convertExcelDate } from "../../components/UI-Components/Forms/Item/utils";
import ClearBtn from "../../components/UI-Elements/ClearBtn";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import UploadProgressBar from "../../components/UI-Elements/Loaders/UploadProgressBar";
import useSkeletonLoader from "../../hooks/useLoader";
import SEO from "../../components/SEO";

const itemPerPage = 30;

const Items = () => {
  const { query, debouncedQuery, handleQueryChange } =
    useDebouncedSearch("", 400);

  const [itemsData, setItemsData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  const [sorting, setSorting] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { loading, startLoading, stopLoading } = useSkeletonLoader(800);


  /* ---------------- FETCH DATA ---------------- */
  const fetchData = useCallback(
    async (offset = 0, limit = itemPerPage, searchText = "", currentSorting = []) => {
      startLoading();
      try {
        const response = await getItems({
          offset,
          limit,
          search: searchText,
          sort: JSON.stringify(currentSorting),
        });

        if (response?.data?.success) {
          setItemsData(response.data.items || []);
          setTotalItems(response.data.totalItems || 0);
        }
      } catch (err) {
        console.error("Failed to fetch items", err);
        showToast.error("Something went wrong.");
      } finally {
        stopLoading();
      }
    },
    []
  );

  /* ---------------- SORT HANDLER ---------------- */
  const handleSort = (field, isMultiSort, sortable) => {
    if (!sortable) return;

    setSorting((prev) => {
      const existingIndex = prev.findIndex((s) => s.column === field);
      const existing = prev[existingIndex];

      if (isMultiSort) {
        if (!existing) return [...prev, { column: field, order: "asc" }];
        if (existing.order === "asc") {
          const updated = [...prev];
          updated[existingIndex] = { ...existing, order: "desc" };
          return updated;
        }
        return prev.filter((s) => s.column !== field);
      } else {
        if (!existing) return [{ column: field, order: "asc" }];
        if (existing.order === "asc") return [{ column: field, order: "desc" }];
        return [];
      }
    });
  };

  /* ---------------- SEARCH & SORT SYNC ---------------- */
  useEffect(() => {
    fetchData(0, itemPerPage, debouncedQuery, sorting);
  }, [debouncedQuery, sorting, fetchData]);

  /* ---------------- PAGINATION HANDLER (FIXED) ---------------- */
  const handlePageChange = useCallback(
    (page, offset, limit) => {
      fetchData(offset, limit, debouncedQuery, sorting);
    },
    [fetchData, debouncedQuery, sorting]
  );

  const {
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
  } = usePagination({
    totalItems,
    itemsPerPage: itemPerPage,
    onPageChange: handlePageChange,
  });

  const excelDownloadHandler = async () => {
    try {
      const response = await downloadItemExcelTemp();

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Item_Template.xlsx";

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting Excel:", err);
    }
  };

  const excelImportHandler = (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      if (!workbook.SheetNames.length) {
        toast.error("Excel file is empty.");
        return;
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const sheetJson = XLSX.utils.sheet_to_json(worksheet, {
        defval: "" // 👈 ensures empty cells are empty strings
      });

      if (!sheetJson.length) {
        toast.error("Excel sheet is empty.");
        return;
      }

      /* ---------------- FORMAT + FILTER ---------------- */
      const formattedData = sheetJson
        .map((row) => ({
          item_name: row["ITEM NAME"]?.toString().trim() || "",
          category: row["CATEGORY"]?.toString().trim() || "",
          description: row["DESCRIPTION"] || "",
          serial_number: row["SERIAL NUMBER"]?.toString().trim() || "",

          //  NUMERIC FIELDS (DEFAULT 0)
          value: Number(row["VALUE"] || 0),
          discount: Number(row["DISCOUNT"] || 0),
          taxation: Number(row["TAXATION"] || 0),
          price: Number(row["PRICE"] || 0),
          total_stock: Number(row["TOTAL STOCK"] || 0),
          in_stock: Number(row["IN STOCK"] || 0),

          // DATE FIELDS
          valid_from: row["VALID FROM"]
            ? convertExcelDate(row["VALID FROM"])
            : null,
          valid_until: row["VALID UNTIL"]
            ? convertExcelDate(row["VALID UNTIL"])
            : null,

          notes: row["NOTES"] || "",
        }))
        /* ---------------- REMOVE EMPTY ROWS ---------------- */
        .filter((row) => {
          return (
            row.item_name &&
            row.category &&
            row.serial_number
          );
        });

      if (!formattedData.length) {
        toast.error("No valid item records found in Excel.");
        return;
      }

      uploadData(formattedData);
      event.target.value = "";
    };

    reader.readAsArrayBuffer(file);
  };

  const uploadData = async (formattedData) => {
    if (!formattedData.length) {
      toast.error("No data to upload!");
      return;
    }

    try {
      // Ensure progress bar appears
      setUploadProgress(1);

      const response = await importItemsExcelData(
        formattedData,
        (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );

            // Cap until backend confirms
            setUploadProgress(Math.min(percent, 95));
          }
        }
      );

      if (response.data.success) {
        // Completion state
        setUploadProgress(100);

        toast.success("Items uploaded successfully!");
        fetchData();

        //  Auto-download duplicate Excel
        if (response.data.duplicateExcel) {
          const binary = atob(response.data.duplicateExcel);
          const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
          const blob = new Blob([bytes], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });

          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "Duplicate_Items.xlsx";
          link.click();
          URL.revokeObjectURL(url);
        }


        // Allow user to see 100%
        setTimeout(() => setUploadProgress(0), 900);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload items!");

      // Error animation
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 700);
    }
  };

  const onToggleStatus = async (id, current_status) => {
    try {
      const res = await toggleItemStatus(id);

      if (res?.data?.success) {
        toast.success("Status updated successfully");

        const updatedStatus = res.data.data?.status;

        // OPTIMISTIC LOCAL UPDATE (custom_id)
        setItemsData((prev) =>
          prev.map((item) =>
            item.custom_id === id
              ? { ...item, status: updatedStatus }
              : item
          )
        );
      } else {
        toast.error(res?.data?.message || "Failed to update status");
      }

    } catch (err) {
      console.error("Failed to update item status:", err);
      toast.error("Failed to update status");
    }
  };

  return (
    <>
      <SEO
        title="Items"
        noIndex={true}
      />
      <div className="h-full w-full flex flex-col min-h-0 overflow-hidden relative">
        <div className="flex-shrink-0 w-full">
          <TableHeader
            currentPage={currentPage}
            searchText={query}
            onSearch={handleQueryChange}
            totalItems={totalItems}
            totalPages={totalPages}
            itemsPerPage={itemPerPage}
            onFirst={firstPage}
            onLast={lastPage}
            createPath="/items/new"
            onPrev={prevPage}
            onNext={nextPage}
            operationsActive={true}
            onDownload={excelDownloadHandler}
            onImport={excelImportHandler}
          />
        </div>

        <UploadProgressBar
          progress={uploadProgress}
          visible={uploadProgress > 0 && uploadProgress < 100}
        />

        {/* TABLE WRAPPER  */}
        <div className="flex-1 min-h-0 w-full relative">
          <div className="w-full h-full overflow-x-auto overflow-y-hidden">
            <div className="h-full overflow-y-auto">
              {loading ? (
                <TableSkeleton />
              ) : (
                <UseTable
                  columns={columns}
                  data={itemsData}
                  sorting={sorting}
                  onSort={handleSort}
                  editPath="items"
                  onToggleStatus={onToggleStatus}
                />
              )}
            </div>
          </div>
        </div>



        <div className="flex-shrink-0">
          <ClearBtn sorting={sorting} onSort={setSorting} />
        </div>
      </div>
    </>
  );
};

export default Items;
