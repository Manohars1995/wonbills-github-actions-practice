import React, { useCallback, useEffect, useState } from 'react';
import TableHeader from '../../components/UI-Components/Table/TableHeader';
import UseTable from '../../components/UI-Components/Table/useTable';
import useDebouncedSearch from '../../hooks/useDebouncedSearch';
import { showToast } from '../../components/UI-Elements/Toast';
import usePagination from '../../hooks/usePagination';
import TableSkeleton from '../../components/UI-Elements/Loaders/TableSkeleton';
import ClearBtn from '../../components/UI-Elements/ClearBtn';
import { columns } from '../../components/UI-Components/Forms/Purchase/utils';
import { getPurchases, togglePurchaseStatus } from '../../services/purchases/purchases';
import useSkeletonLoader from '../../hooks/useLoader';
import { toast } from 'sonner';
import SEO from '../../components/SEO';

const itemPerPage = 30

const Purchases = () => {
    const { query, debouncedQuery, handleQueryChange } = useDebouncedSearch("", 400);

    const [purchasesData, setPurchasesData] = useState([]);
    const [totalItems, setTotalItems] = useState(0);

    const [sorting, setSorting] = useState([]);
    const { loading, startLoading, stopLoading } = useSkeletonLoader(800);


    /* ---------------- FETCH DATA ---------------- */
    const fetchData = useCallback(async (offset = 0, limit = 20, searchText = "", currentSorting = []) => {
        startLoading();
        try {
            const response = await getPurchases({
                offset,
                limit,
                search: searchText,
                sort: JSON.stringify(currentSorting),
            });
            if (response?.data?.success) {
                setPurchasesData(response?.data?.payments || []);
                setTotalItems(response?.data?.totalPayments || 0);
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

    const onToggleStatus = async (id, current_status) => {
        //  HARD GUARD — `closed` is immutable
        if (current_status === "closed") {
            toast.warning("Cannot change status of a closed purchase");
            return;
        }

        try {
            const res = await togglePurchaseStatus(id);

            if (res?.data?.success) {
                toast.success("Status updated successfully");

                const updatedStatus = res.data.data?.status;

                // OPTIMISTIC LOCAL UPDATE (FIXED)
                setPurchasesData((prev) =>
                    prev.map((purchase) =>
                        purchase.custom_id === id
                            ? { ...purchase, status: updatedStatus }
                            : purchase
                    )
                );
            } else {
                toast.error(res?.data?.message || "Failed to update status");
            }

        } catch (err) {
            console.error("Failed to update purchase status:", err);
            toast.error("Failed to update status");
        }
    };



    return (
        <>
            <SEO
                title="Purchases"
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

                        createPath="/purchases/new"

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
                                    data={purchasesData || []}
                                    sorting={sorting}
                                    onSort={handleSort}
                                    editPath="purchases"
                                    errorMsg="No records found"
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

export default Purchases;
