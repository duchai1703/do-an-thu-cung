/**
 * Pagination Component - Cute & Beautiful Design
 * 
 * Features:
 * - Page navigation with emoji icons
 * - Items per page selector
 * - Responsive design
 * - Gradient buttons
 * - Smooth animations
 * 
 * Usage:
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   totalItems={100}
 *   itemsPerPage={10}
 *   onPageChange={(page) => setCurrentPage(page)}
 *   onItemsPerPageChange={(size) => setItemsPerPage(size)}
 * />
 */

"use client";
import React from "react";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [5, 10, 20, 50, 100],
  showPageInfo = true,
  showPageSizeSelector = true,
  className = "",
}) {
  // Calculate displayed items range
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Maximum visible page numbers

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination with ellipsis
      if (currentPage <= 3) {
        // Near start
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near end
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Middle
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    onItemsPerPageChange?.(newSize);
    // Reset to page 1 when changing page size
    onPageChange?.(1);
  };

  if (totalPages <= 1 && !showPageSizeSelector) {
    return null; // Don't show pagination if only 1 page and no size selector
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Left: Page Info */}
      {showPageInfo && (
        <div className="text-sm text-gray-600">
          Hiển thị <span className="font-semibold text-gray-900">{startItem}</span> -{" "}
          <span className="font-semibold text-gray-900">{endItem}</span> trong tổng số{" "}
          <span className="font-semibold text-gray-900">{totalItems}</span> mục
        </div>
      )}

      {/* Center: Page Navigation */}
      <div className="flex items-center gap-2">
        {/* First Page Button */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg font-medium transition-all ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white shadow-md hover:shadow-lg"
          }`}
          title="Trang đầu"
        >
          ⏮️
        </button>

        {/* Previous Page Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg font-medium transition-all ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:text-white shadow-md hover:shadow-lg"
          }`}
          title="Trang trước"
        >
          ◀️
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                  •••
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all ${
                  currentPage === page
                    ? "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white shadow-lg scale-110"
                    : "bg-white text-gray-700 hover:bg-gradient-to-r hover:from-amber-400 hover:to-orange-400 hover:text-white shadow-md hover:shadow-lg hover:scale-105"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg font-medium transition-all ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:text-white shadow-md hover:shadow-lg"
          }`}
          title="Trang sau"
        >
          ▶️
        </button>

        {/* Last Page Button */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg font-medium transition-all ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white shadow-md hover:shadow-lg"
          }`}
          title="Trang cuối"
        >
          ⏭️
        </button>
      </div>

      {/* Right: Items Per Page Selector */}
      {showPageSizeSelector && (
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-sm text-gray-600 whitespace-nowrap">
            📊 Hiển thị:
          </label>
          <select
            id="pageSize"
            value={itemsPerPage}
            onChange={handlePageSizeChange}
            className="px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-gray-700 font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer hover:border-purple-300"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} mục/trang
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
