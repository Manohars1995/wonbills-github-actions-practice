import React, { useCallback, useState, useEffect } from "react";
import TableHeader from "../../components/UI-Components/Table/TableHeader";
import UseTable from "../../components/UI-Components/Table/useTable";
import TableSkeleton from "../../components/UI-Elements/Loaders/TableSkeleton";
import useDebouncedSearch from "../../hooks/useDebouncedSearch";
import usePagination from "../../hooks/usePagination";
import SEO from "../../components/SEO";

import {
  downloadExcelTemp,
  getClients,
  importClientExcelData,
  toggleClientStatus
} from "../../services/clients/client";

import { showToast } from "../../components/UI-Elements/Toast";
import { columns, normalizePhone } from "../../components/UI-Components/Forms/Client/utils";
import ClearBtn from "../../components/UI-Elements/ClearBtn";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import UploadProgressBar from "../../components/UI-Elements/Loaders/UploadProgressBar";
import useSkeletonLoader from "../../hooks/useLoader";

const itemPerPage = 30;

const Clients = () => {
  const { query, debouncedQuery, handleQueryChange } =
    useDebouncedSearch("", 400);

  const [clientData, setClientData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [sorting, setSorting] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { loading, startLoading, stopLoading } = useSkeletonLoader(800);


  /* ---------------- FETCH DATA ---------------- */
  const fetchData = useCallback(
    async (offset = 0, limit = itemPerPage, searchText = "", currentSorting = []) => {
      startLoading();
      try {
        const response = await getClients({
          offset,
          limit,
          search: searchText,
          sort: JSON.stringify(currentSorting),
        });

        if (response?.data?.success) {
          setClientData(response.data.clients || []);
          setTotalItems(response.data.totalClients || 0);
        }
      } catch (err) {
        console.error("Failed to fetch clients", err);
        showToast.error("Something went wrong.");
      } finally {
        stopLoading();
      }
    },
    []
  );

  /* ---------------- SEARCH & SORT ---------------- */
  useEffect(() => {
    fetchData(0, itemPerPage, debouncedQuery, sorting);
  }, [debouncedQuery, sorting, fetchData]);


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

  /* ---------------- PAGINATION ---------------- */
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

  /* ---------------- DOWNLOAD TEMPLATE ---------------- */
  const excelDownloadHandler = async () => {
    try {
      const response = await downloadExcelTemp();

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Client_Template.xlsx";

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting Excel:", err);
    }
  };

  /* ---------------- IMPORT EXCEL ---------------- */
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
      const sheetJson = XLSX.utils.sheet_to_json(worksheet);

      if (!sheetJson.length) {
        toast.error("Excel sheet is empty.");
        return;
      }

      const formattedData = sheetJson.map((row) => {
        const workNumberRaw = row["WORK NUMBER DIALCODE"]
          ? `${row["WORK NUMBER DIALCODE"]}${row["WORK NUMBER"] || ""}`
          : row["WORK NUMBER"] || "";

        const mobileNumberRaw = row["MOBILE NUMBER DIALCODE"]
          ? `${row["MOBILE NUMBER DIALCODE"]}${row["MOBILE NUMBER"] || ""}`
          : row["MOBILE NUMBER"] || "";

        return {
          client_name: row["CLIENT NAME"] || "",
          trading_name: row["TRADING NAME"] || "",
          registration_number: row["REGISTRATION NUMBER"] || "",
          email: row["EMAIL"] || "",
          gst_reference: row["GST REFERENCE"] || "",
          notes: row["NOTES"] || "",

          //  CLEAN STRING PHONE NUMBERS
          work_number: normalizePhone(workNumberRaw),
          mobile_number: normalizePhone(mobileNumberRaw),

          // FIXED: use `state`, not `province`
          office_address: {
            flat_no: row["OFFICE ADDRESS FLAT NO"] || "",
            street_name: row["OFFICE ADDRESS STREET NAME"] || "",
            zip_code: row["OFFICE ADDRESS ZIP CODE"] || "",
            city: row["OFFICE ADDRESS CITY"] || "",
            state: row["OFFICE ADDRESS PROVINCE"] || "",
            country: row["OFFICE ADDRESS COUNTRY"] || "",
          },

          billing_address: {
            flat_no: row["BILLING ADDRESS FLAT NO"] || "",
            street_name: row["BILLING ADDRESS STREET NAME"] || "",
            zip_code: row["BILLING ADDRESS ZIP CODE"] || "",
            city: row["BILLING ADDRESS CITY"] || "",
            state: row["BILLING ADDRESS PROVINCE"] || "",
            country: row["BILLING ADDRESS COUNTRY"] || "",
          },
        };
      });

      uploadData(formattedData);
      event.target.value = "";
    };

    reader.readAsArrayBuffer(file);
  };

  /* ----------------  UPLOAD EXCEL DATA ---------------- */
  const uploadData = async (data) => {
    if (!data.length) {
      toast.error("No data to upload!");
      return;
    }

    try {
      // Ensure bar becomes visible immediately
      setUploadProgress(1);

      const response = await importClientExcelData(
        data,
        (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );

            // Cap at 95% until server confirms success
            setUploadProgress(Math.min(percent, 95));
          }
        }
      );

      if (response.data.success) {
        // Show completion state
        setUploadProgress(100);
        toast.success("Records uploaded successfully!");
        fetchData();

        //  Auto-download duplicate Excel
        if (response.data.duplicateExcel) {
          const binary = atob(response.data.duplicateExcel);
          const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
          const blob = new Blob([bytes], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });

          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "Duplicate_Clients.xlsx";
          link.click();
          URL.revokeObjectURL(url);
        }

        // Allow user to see 100% before sliding down
        setTimeout(() => setUploadProgress(0), 900);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload data!");

      // Show error state briefly, then slide down
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 700);
    }
  };

  const onToggleStatus = async (id, current_status) => {
    try {
      const res = await toggleClientStatus(id);

      if (res?.data?.success) {
        toast.success("Status updated successfully");

        // OPTIMISTIC LOCAL UPDATE
        setClientData((prev) =>
          prev.map((client) =>
            client.custom_id === id
              ? { ...client, status: !client.status }
              : client
          )
        );
      } else {
        toast.error(res?.data?.message || "Failed to update status");
      }

    } catch (err) {
      console.error("Failed to update client status:", err);
      toast.error("Failed to update status");
    }
  };




  return (
    <>
      <SEO
        title="Clients"
        noIndex={true}
      />
      <div className="h-full w-full flex flex-col min-h-0 overflow-hidden relative">
        <div className="shrink-0 w-full">
          <TableHeader
            currentPage={currentPage}
            searchText={query}
            onSearch={handleQueryChange}
            totalItems={totalItems}
            totalPages={totalPages}
            itemsPerPage={itemPerPage}
            onFirst={firstPage}
            onLast={lastPage}
            onPrev={prevPage}
            onNext={nextPage}
            operationsActive={true}
            onDownload={excelDownloadHandler}
            onImport={excelImportHandler}
            createPath="/clients/new"
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
                  data={clientData}
                  sorting={sorting}
                  onSort={handleSort}
                  editPath="clients"
                  onToggleStatus={onToggleStatus}
                />
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <ClearBtn sorting={sorting} onSort={setSorting} />
        </div>
      </div>
    </>
  );

};

export default Clients;
