import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";

const Filters = ({
  searchPlaceholder = "Search...",
  onSearch,
  onStatusFilter,
  statusOptions = [],
  onReset,
  extraFilters = null,   // ✅ reusable slot
  showStatusFilter = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    onStatusFilter?.(value);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    onReset?.();
  };

  return (
    <div className="bg-white rounded-lg p-4 mb-6 border border-gray-300">
      <div className="flex flex-wrap items-center justify-between gap-4">

        <div className="flex flex-wrap gap-3 items-center">

          {/* SEARCH */}
          <div className="relative flex-1 min-w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearch}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg w-full
                         focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* STATUS (optional) */}
          {showStatusFilter && statusOptions.length > 0 && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="pl-9 pr-4 py-2 border rounded-lg bg-white"
              >
                <option value="all">All Status</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* EXTRA FILTERS SLOT */}
          {extraFilters}

        </div>

        {/* RESET */}
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2
                     hover:bg-gray-50 text-gray-700"
        >
          <X className="w-4 h-4" />
          Reset
        </button>

      </div>
    </div>
  );
};

export default Filters;