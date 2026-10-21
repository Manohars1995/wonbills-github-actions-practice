import { useState, useEffect } from "react";

const usePagination = ({
  totalItems,
  itemsPerPage = 20,
  initialPage = 1,
  onPageChange,
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const updatePage = (page) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    const offset = (validPage - 1) * itemsPerPage;

    setCurrentPage(validPage);

    if (typeof onPageChange === "function") {
      onPageChange(validPage, offset, itemsPerPage);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) updatePage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) updatePage(currentPage - 1);
  };

  const firstPage = () => updatePage(1);

  const lastPage = () => updatePage(totalPages);

  /* ---------------- INITIAL FETCH ---------------- */
  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    if (typeof onPageChange === "function") {
      onPageChange(currentPage, offset, itemsPerPage);
    }
  }, [currentPage, itemsPerPage, onPageChange]);

  return {
    currentPage,
    totalPages,
    itemsPerPage,

    nextPage,
    prevPage,
    firstPage,
    lastPage,
    goToPage: updatePage,

    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
  };
};

export default usePagination;