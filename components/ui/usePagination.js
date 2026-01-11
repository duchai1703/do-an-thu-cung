/**
 * usePagination Hook - Custom React Hook for Pagination Logic
 * 
 * Simplifies pagination state management and data slicing
 * 
 * Usage:
 * const {
 *   currentPage,
 *   itemsPerPage,
 *   totalPages,
 *   paginatedData,
 *   setCurrentPage,
 *   setItemsPerPage,
 * } = usePagination(data, 10);
 */

"use client";
import { useState, useMemo } from "react";

export default function usePagination(data = [], initialItemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(data.length / itemsPerPage) || 1;
  }, [data.length, itemsPerPage]);

  // Get paginated data for current page
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  // Reset to page 1 when data changes
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [data.length, totalPages]);

  // Handler for page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handler for items per page change
  const handleItemsPerPageChange = (size) => {
    setItemsPerPage(size);
    setCurrentPage(1); // Reset to first page
  };

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems: data.length,
    paginatedData,
    setCurrentPage: handlePageChange,
    setItemsPerPage: handleItemsPerPageChange,
  };
}
