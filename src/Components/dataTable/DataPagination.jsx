import React from 'react';

const DataPagination = ({
  totalPages = 1,
  totalDocs = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  showTotal = false,
  className = ""
}) => {
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange?.(newPage);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalDocs);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {showTotal && (
        <div className="text-sm text-gray-600">
          Showing {startItem} to {endItem} of {totalDocs} results
        </div>
      )}
      
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors duration-150 ${
            page <= 1
              ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
              : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          Previous
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors duration-150 ${
              pageNum === page
                ? 'bg-gray-600 text-white border-gray-600'
                : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            {pageNum}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors duration-150 ${
            page >= totalPages
              ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
              : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          Next
        </button>
      </div>

      {!showTotal && (
        <div className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </div>
      )}
    </div>
  );
};

export default DataPagination;