// DataTable.jsx
import React, { cloneElement, useMemo, useState } from "react";
import DataPagination from "./DataPagination";

const SortIcon = ({ dir }) => {
  // simple chevrons
  return dir === "asc" ? (
    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M6 12l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ) : dir === "desc" ? (
    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ) : null;
};

export default function DataTable({
  columns = [],
  data = [],
  isFetching = false,
  skeleton = null,
  emptyMessage = "No records found",
  getRowClass,
  pagination = false,
  paginationData = {},
  page = 1,
  setPage = () => {},
  onSort,               // optional external sort handler: (key, direction) => {}
  sortConfig = null,    // optional external sort config: { key, direction }
  className = "",
  tableClassName = "",
  theadClassName = "",
  tbodyClassName = "",
}) {
  // local sort state if parent doesn't control sorting
  const [localSort, setLocalSort] = useState(sortConfig || { key: null, direction: null });
  // decide active sort
  const activeSort = sortConfig || localSort;

  const handleSort = (col) => {
    if (!col.sortable) return;
    let nextDir = "asc";
    if (activeSort.key === col.key) {
      nextDir = activeSort.direction === "asc" ? "desc" : activeSort.direction === "desc" ? null : "asc";
    }
    if (onSort) {
      onSort(col.key, nextDir);
    } else {
      setLocalSort({ key: nextDir ? col.key : null, direction: nextDir });
    }
  };

  const getSortIcon = (col) => {
    if (!col.sortable) return null;
    if (activeSort.key !== col.key) return <SortIcon dir={null} />;
    return <SortIcon dir={activeSort.direction} />;
  };

  // optionally sort data for client-side if no external sort handler used
  const displayedData = useMemo(() => {
    if (!activeSort.key || onSort) return data;
    const sorted = [...data].sort((a, b) => {
      const av = a[activeSort.key];
      const bv = b[activeSort.key];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return activeSort.direction === "asc" ? av - bv : bv - av;
      }
      const sa = String(av).toLowerCase();
      const sb = String(bv).toLowerCase();
      if (sa < sb) return activeSort.direction === "asc" ? -1 : 1;
      if (sa > sb) return activeSort.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, activeSort, onSort]);

  // fallback skeleton row
  const renderSkeletonRow = (keyIndex) => {
    if (skeleton) return cloneElement(skeleton, { key: `s-${keyIndex}` });
    return (
      <tr key={`s-${keyIndex}`} className="animate-pulse">
        {columns.map((col, i) => (
          <td key={i} className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </td>
        ))}
      </tr>
    );
  };

  return (
    <div className={`w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className={`w-full min-w-full divide-y divide-gray-200 ${tableClassName}`}>
          <thead className={`bg-gray-50 ${theadClassName}`}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  role={col.sortable ? "button" : "columnheader"}
                  tabIndex={col.sortable ? 0 : undefined}
                  onClick={() => handleSort(col)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSort(col); }}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 ${col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  style={{ width: col.width, textAlign: col.align || "left" }}
                >
                  <div className="flex items-center gap-2">
                    <span>{col.label}</span>
                    {getSortIcon(col)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className={`bg-white divide-y divide-gray-200 ${tbodyClassName}`}>
            {isFetching ? (
              Array.from({ length: 8 }).map((_, i) => renderSkeletonRow(i))
            ) : displayedData && displayedData.length > 0 ? (
              displayedData.map((row, index) => (
                <tr
                  key={row._id || row.id || index}
                  className={`transition-colors duration-150 hover:bg-gray-50 ${
                    getRowClass ? getRowClass(row, index) : index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-200"
                      style={{ textAlign: col.align || "left", width: col.width }}
                    >
                      {col.render ? col.render(row, index) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-12 text-center text-gray-500 italic border-b border-gray-200" colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                    </svg>
                    <p className="text-lg font-medium text-gray-400">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <DataPagination
            totalPages={paginationData?.totalPages || 1}
            totalDocs={paginationData?.totalDocs || 0}
            page={page}
            pageSize={paginationData?.limit || 10}
            onPageChange={setPage}
            showTotal={true}
          />
        </div>
      )}
    </div>
  );
}
