import React, { useCallback, useContext, useEffect, useState } from 'react';
import { createRoot } from "react-dom/client";
import TableHeader from '../../components/UI-Components/Table/TableHeader';
import UseTable from '../../components/UI-Components/Table/useTable';
import useDebouncedSearch from '../../hooks/useDebouncedSearch';
import { showToast } from '../../components/UI-Elements/Toast';
import usePagination from '../../hooks/usePagination';
import { getClientVenderDetails, getInvoices, toggleInvoiceStatus } from '../../services/invoices/invoices';
import TableSkeleton from '../../components/UI-Elements/Loaders/TableSkeleton';
import { columns } from '../../components/UI-Components/Forms/Invoice/utils';
import ClearBtn from '../../components/UI-Elements/ClearBtn';
import { WonBillsContext } from '../../store/WonBillsContext';
import PDFGenerator from '../../components/UI-Components/PDFTemplates/utils/PDFGenerator';
import useSkeletonLoader from '../../hooks/useLoader';
import { toast } from 'sonner';
import SEO from '../../components/SEO';

const itemPerPage = 30

const Invoices = () => {
  const { query, debouncedQuery, handleQueryChange } = useDebouncedSearch("", 400);
  const { selectedTemplate } = useContext(WonBillsContext);

  const [invoicesData, setInvoicesData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  const [sorting, setSorting] = useState([]);
  const { loading, startLoading, stopLoading } = useSkeletonLoader(800);


  /* ---------------- FETCH DATA ---------------- */
  const fetchData = useCallback(async (offset = 0, limit = 20, searchText = "", currentSorting = []) => {
    startLoading();
    try {
      const response = await getInvoices({
        offset,
        limit,
        search: searchText,
        sort: JSON.stringify(currentSorting),
      });
      if (response?.data?.success) {
        setInvoicesData(response?.data?.invoices || []);
        setTotalItems(response?.data?.totalInvoices || 0);
      }
    } catch (err) {
      console.error("failed to fetch clients", err);
      showToast.error("Something went wrong.");
    } finally {
      stopLoading();
    }
  }, []);

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

  const downloadInvoice = async (invoiceId) => {
    try {
      const res = await getClientVenderDetails(invoiceId);

      const { invoice, items, client, vendor } = res.data.data;

      const container = document.createElement("div");
      document.body.appendChild(container);
      const root = createRoot(container);

      root.render(
        <PDFGenerator
          templateKey={selectedTemplate}
          id={invoice.custom_id}
          items={items}
          clientVendorDetails={{
            ...client,
            ...vendor,
          }}
          currency={vendor.currency_preference}
          dueDate={invoice.due_date}
          generateAndDownload
        />
      );

      setTimeout(() => {
        root.unmount();
        document.body.removeChild(container);
      }, 4000);
    } catch (err) {
      console.error("DownloadIVC failed:", err);
      showToast.error("Failed to download invoice");
    }
  };

  const onToggleStatus = async (id, current_status) => {
    //  HARD GUARD — cannot toggle these
    if (current_status === "initiated" || current_status === "closed") {
      toast.warning(
        `Cannot change status of a ${current_status} invoice`
      );
      return;
    }

    try {
      const res = await toggleInvoiceStatus(id);

      if (res?.data?.success) {
        toast.success("Status updated successfully");

        const updatedStatus = res.data.data?.status;

        // OPTIMISTIC LOCAL UPDATE (STRING SAFE)
        setInvoicesData((prev) =>
          prev.map((invoice) =>
            invoice.custom_id === id
              ? { ...invoice, status: updatedStatus }
              : invoice
          )
        );
      } else {
        toast.error(res?.data?.message || "Failed to update status");
      }

    } catch (err) {
      console.error("Failed to update invoice status:", err);
      toast.error("Failed to update status");
    }
  };



  return (
    <>
      <SEO
        title="Invoices"
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
            createPath="/invoices/new"
            onPrev={prevPage}
            onNext={nextPage}
          />
        </div>

        {/* TABLE WRAPPER  */}
        <div className="flex-1 min-h-0 w-full relative">
          <div className="w-full h-full overflow-x-auto overflow-y-hidden">
            <div className="h-full overflow-y-auto">
              {loading ? (
                <TableSkeleton />
              ) : (
                <UseTable
                  columns={columns}
                  data={invoicesData}
                  sorting={sorting}
                  onSort={handleSort}
                  editPath="invoices"
                  errorMsg="No records found"
                  download={true}
                  onDownload={downloadInvoice}
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
  )
}

export default Invoices
