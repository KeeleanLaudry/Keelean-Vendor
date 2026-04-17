// src/vendor/PricingSpreadsheet.jsx
// Excel-like vendor pricing UI — connects to real backend
// ✨ NEW: Item filter dropdown added (4-level cascading filters)

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";

// ─── API Hooks ───
import {
  useGetSpreadsheetViewQuery,
  useGetPricingStatsQuery,
  useCreatePricingMutation,
  useUpdatePricingMutation,
  useBulkUpdatePricingMutation,
  useBulkDeletePricingMutation,
  useImportCSVMutation,
  useLazyExportCSVQuery,
} from "@/api/vendorPricingApi";

import {
  useGetServicesQuery,
  useGetCategoriesQuery,
  useGetSubcategoriesQuery,
  useGetItemsQuery, // ✨ NEW
} from "@/api/catalogApi";

// ─── Inline SVG Icons ───
const Icon = ({ name, size = 16, className = "", style = {} }) => {
  const paths = {
    search: (
      <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    ),
    check: <path d="M4.5 12.75l6 6 9-13.5" />,
    x: <path d="M6 18L18 6M6 6l12 12" />,
    trash: (
      <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    ),
    upload: (
      <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    ),
    download: (
      <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    ),
    chevDown: <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" />,
    edit: (
      <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    ),
    filter: (
      <path d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    ),
    sparkle: (
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    ),
    table: (
      <path d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12h-7.5" />
    ),
  };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      width={size}
      height={size}
      className={className}
      style={{ flexShrink: 0, ...style }}
    >
      {paths[name]}
    </svg>
  );
};

// ══════════════════════════════════════════════════ EDITABLE PRICE CELL
function EditableCell({ value, row, onSave }) {
  const [editing, setEditing] = useState(false);
  const [tempVal, setTempVal] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setTempVal(value ?? "");
  }, [value]);
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const save = async () => {
    const num = parseFloat(tempVal);
    if (isNaN(num) || num <= 0) {
      setTempVal(value ?? "");
      setEditing(false);
      return;
    }
    if (num === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(row, num);
      setFlash(true);
      setTimeout(() => setFlash(false), 1200);
    } catch {
      setTempVal(value ?? "");
    }
    setSaving(false);
    setEditing(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") {
      setTempVal(value ?? "");
      setEditing(false);
    }
    if (e.key === "Tab") {
      e.preventDefault();
      save();
    }
  };

  if (editing) {
    return (
      <div style={styles.cellEditing}>
        <span style={styles.currencyTag}>AED</span>
        <input
          ref={inputRef}
          type="number"
          step="0.01"
          min="0"
          value={tempVal}
          onChange={(e) => setTempVal(e.target.value)}
          onBlur={save}
          onKeyDown={handleKey}
          disabled={saving}
          style={styles.priceInput}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "F2") setEditing(true);
      }}
      tabIndex={0}
      style={{
        ...styles.cellDisplay,
        ...(value == null ? styles.cellEmpty : {}),
        ...(flash ? styles.cellFlash : {}),
      }}
    >
      {value != null ? (
        <>
          <span style={styles.cellCurrency}>AED</span>
          <span style={styles.cellPrice}>{parseFloat(value).toFixed(2)}</span>
          <span style={styles.editHint}>
            <Icon name="edit" size={12} />
          </span>
        </>
      ) : (
        <span style={styles.noPrice}>Click to set price</span>
      )}
      {flash && <span style={styles.saveFlash}>Saved</span>}
    </div>
  );
}

// ══════════════════════════════════════════════════ FILTER DROPDOWN (with optional search)
function FilterDropdown({
  label,
  options = [],
  value,
  onChange,
  disabled = false,
  allLabel = "All",
  searchable = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && searchable && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open, searchable]);

  const selected = options.find((o) => String(o.id) === String(value));

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.name?.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        style={{
          ...styles.filterBtn,
          ...(value ? styles.filterBtnActive : {}),
          ...(disabled ? styles.filterBtnDisabled : {}),
        }}
      >
        <span style={styles.filterLabel}>{label}</span>
        <span style={styles.filterValue}>
          {selected ? selected.name : allLabel}
        </span>
        <Icon
          name="chevDown"
          size={14}
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </button>
      {open && (
        <div style={styles.filterMenu}>
          {searchable && (
            <div style={styles.filterSearchWrap}>
              <Icon name="search" size={13} style={{ color: "#A8A29E" }} />
              <input
                ref={searchRef}
                type="text"
                placeholder={`Search ${label.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.filterSearchInput}
              />
            </div>
          )}
          <div
            style={{
              ...styles.filterOption,
              ...(!value ? styles.filterOptionSelected : {}),
            }}
            onClick={() => {
              onChange(null);
              setOpen(false);
              setSearch("");
            }}
          >
            {allLabel}
          </div>
          {filteredOptions.length === 0 ? (
            <div style={styles.filterEmpty}>No {label.toLowerCase()} found</div>
          ) : (
            filteredOptions.map((opt) => (
              <div
                key={opt.id}
                style={{
                  ...styles.filterOption,
                  ...(String(value) === String(opt.id)
                    ? styles.filterOptionSelected
                    : {}),
                }}
                onClick={() => {
                  onChange(String(opt.id));
                  setOpen(false);
                  setSearch("");
                }}
              >
                {opt.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════ BULK PRICE MODAL
function BulkPriceModal({ count, onApply, onClose }) {
  const [price, setPrice] = useState("");
  const inputRef = useRef(null);
  useEffect(() => inputRef.current?.focus(), []);

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <Icon name="sparkle" size={20} />
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
            Set Bulk Price
          </h3>
        </div>
        <p style={styles.modalDesc}>
          Apply a single price to <strong>{count}</strong> selected item
          {count !== 1 ? "s" : ""}.
        </p>
        <div style={styles.modalInputWrap}>
          <span style={styles.modalCurrency}>AED</span>
          <input
            ref={inputRef}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && price) onApply(parseFloat(price));
            }}
            style={styles.modalInput}
          />
        </div>
        <div style={styles.modalActions}>
          <button style={styles.btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button
            style={{
              ...styles.btnPrimary,
              ...(!price || parseFloat(price) <= 0
                ? { opacity: 0.5, cursor: "not-allowed" }
                : {}),
            }}
            onClick={() =>
              price && parseFloat(price) > 0 && onApply(parseFloat(price))
            }
            disabled={!price || parseFloat(price) <= 0}
          >
            Apply to {count} item{count !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════ STATS BAR
function StatsBar({ stats, isLoading }) {
  if (isLoading || !stats) {
    return (
      <div style={styles.statsBar}>
        <span style={{ color: "#A8A29E", fontSize: 13 }}>Loading stats...</span>
      </div>
    );
  }
  return (
    <div style={styles.statsBar}>
      <StatItem number={stats.total_rules} label="Total Rules" />
      <div style={styles.statDivider} />
      <StatItem
        number={`${stats.coverage_percentage}%`}
        label="Coverage"
        color="#16A34A"
      />
      <div style={styles.statDivider} />
      <StatItem
        number={stats.missing_items_count}
        label="Missing"
        color="#D97706"
      />
      <div style={styles.statDivider} />
      <StatItem number={`AED ${stats.average_price}`} label="Avg Price" />
      {stats.pricing_by_level && (
        <>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(stats.pricing_by_level).map(([level, count]) => (
                <span key={level} style={styles.levelPill(level)}>
                  {level}: {count}
                </span>
              ))}
            </div>
            <span style={styles.statLabel}>By Level</span>
          </div>
        </>
      )}
    </div>
  );
}

function StatItem({ number, label, color }) {
  return (
    <div style={styles.statItem}>
      <span style={{ ...styles.statNumber, ...(color ? { color } : {}) }}>
        {number}
      </span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════ MAIN COMPONENT
export default function PricingSpreadsheet() {
  // Filters
  const [serviceFilter, setServiceFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [subcategoryFilter, setSubcategoryFilter] = useState(null);
  const [itemFilter, setItemFilter] = useState(null); // ✨ NEW
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyUnpriced, setShowOnlyUnpriced] = useState(false);

  // Selection & UI
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, dir: "asc" });
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const fileInputRef = useRef(null);

  // API: Catalog
  const { data: services = [] } = useGetServicesQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: subcategories = [] } = useGetSubcategoriesQuery();
  const { data: items = [] } = useGetItemsQuery(); // ✨ NEW

  // API: Spreadsheet
  const {
    data: spreadsheetData,
    isLoading,
    isFetching,
  } = useGetSpreadsheetViewQuery({
    serviceId: serviceFilter || undefined,
    categoryId: categoryFilter || undefined,
    subcategoryId: subcategoryFilter || undefined,
    itemId: itemFilter || undefined, // ✨ NEW
  });

  const { data: stats, isLoading: statsLoading } = useGetPricingStatsQuery();

  // Mutations
  const [createPricing] = useCreatePricingMutation();
  const [updatePricing] = useUpdatePricingMutation();
  const [bulkUpdate] = useBulkUpdatePricingMutation();
  const [bulkDelete] = useBulkDeletePricingMutation();
  const [importCSV] = useImportCSVMutation();
  const [triggerExport] = useLazyExportCSVQuery();

  const rawRows = spreadsheetData?.results || [];

  const getRowKey = useCallback(
    (row) =>
      `${row.service_id}-${row.category_id}-${row.subcategory_id}-${row.item_id}`,
    [],
  );

  // Cascading filter options
  const filteredCategories = useMemo(() => {
    if (!serviceFilter) return categories;
    return categories.filter((cat) =>
      cat.services?.some((s) => String(s.id) === String(serviceFilter)),
    );
  }, [serviceFilter, categories]);

  const filteredSubcategories = useMemo(() => {
    if (!categoryFilter) return subcategories;
    return subcategories.filter(
      (sub) => String(sub.category) === String(categoryFilter),
    );
  }, [categoryFilter, subcategories]);

  // ✨ NEW: Items filtered by what's actually in the current rows
  const filteredItems = useMemo(() => {
    if (!serviceFilter && !categoryFilter && !subcategoryFilter) return items;
    const itemIdsInRows = new Set(rawRows.map((r) => r.item_id));
    return items.filter((item) => itemIdsInRows.has(item.id));
  }, [items, rawRows, serviceFilter, categoryFilter, subcategoryFilter]);

  // Client-side search/sort/unpriced
  const processedRows = useMemo(() => {
    let rows = [...rawRows];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.item_name?.toLowerCase().includes(q) ||
          r.service_name?.toLowerCase().includes(q) ||
          r.category_name?.toLowerCase().includes(q) ||
          r.subcategory_name?.toLowerCase().includes(q),
      );
    }
    if (showOnlyUnpriced) rows = rows.filter((r) => !r.has_price);
    if (sortConfig.key) {
      rows.sort((a, b) => {
        const aVal = a[sortConfig.key] ?? "";
        const bVal = b[sortConfig.key] ?? "";
        if (typeof aVal === "number" && typeof bVal === "number")
          return sortConfig.dir === "asc" ? aVal - bVal : bVal - aVal;
        return sortConfig.dir === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }
    return rows;
  }, [rawRows, searchQuery, showOnlyUnpriced, sortConfig]);

  const totalPages = Math.ceil(processedRows.length / pageSize);
  const pagedRows = processedRows.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
    setSelectedKeys(new Set());
  }, [
    serviceFilter,
    categoryFilter,
    subcategoryFilter,
    itemFilter,
    searchQuery,
    showOnlyUnpriced,
  ]);

  const handleSavePrice = useCallback(
    async (row, newPrice) => {
      if (row.pricing_id) {
        await updatePricing({
          id: row.pricing_id,
          base_price: newPrice,
        }).unwrap();
      } else {
        await createPricing({
          service_id: row.service_id,
          category_id: row.category_id,
          subcategory_id: row.subcategory_id,
          item_id: row.item_id,
          base_price: newPrice,
        }).unwrap();
      }
    },
    [updatePricing, createPricing],
  );

  const handleSelectAll = useCallback(() => {
    if (selectedKeys.size === pagedRows.length) setSelectedKeys(new Set());
    else setSelectedKeys(new Set(pagedRows.map((r) => getRowKey(r))));
  }, [pagedRows, selectedKeys, getRowKey]);

  const handleSelectRow = useCallback(
    (row) => {
      const key = getRowKey(row);
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [getRowKey],
  );

  const getSelectedRows = useCallback(() => {
    return rawRows.filter((r) => selectedKeys.has(getRowKey(r)));
  }, [rawRows, selectedKeys, getRowKey]);

  const handleBulkApply = useCallback(
    async (price) => {
      const selected = getSelectedRows();
      const withPricing = selected.filter((r) => r.pricing_id);
      const withoutPricing = selected.filter((r) => !r.pricing_id);

      try {
        if (withPricing.length > 0) {
          await bulkUpdate({
            ids: withPricing.map((r) => r.pricing_id),
            base_price: price,
          }).unwrap();
        }
        for (const row of withoutPricing) {
          await createPricing({
            service_id: row.service_id,
            category_id: row.category_id,
            subcategory_id: row.subcategory_id,
            item_id: row.item_id,
            base_price: price,
          }).unwrap();
        }
        setSelectedKeys(new Set());
        setShowBulkModal(false);
      } catch (error) {
        console.error("Bulk update failed:", error);
        alert("Failed to update some prices. Please try again.");
      }
    },
    [getSelectedRows, bulkUpdate, createPricing],
  );

  const handleBulkDelete = useCallback(async () => {
    const selected = getSelectedRows();
    const pricingIds = selected
      .filter((r) => r.pricing_id)
      .map((r) => r.pricing_id);
    if (pricingIds.length === 0) {
      alert("Selected rows don't have any prices to remove.");
      return;
    }
    if (!window.confirm(`Remove prices from ${pricingIds.length} items?`))
      return;
    try {
      await bulkDelete({ ids: pricingIds }).unwrap();
      setSelectedKeys(new Set());
    } catch (error) {
      console.error("Bulk delete failed:", error);
      alert("Failed to delete prices.");
    }
  }, [getSelectedRows, bulkDelete]);

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleCSVImport = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      try {
        const result = await importCSV(formData).unwrap();
        alert(
          `Import complete: ${result.created} created, ${result.updated} updated` +
            (result.errors?.length
              ? `\n${result.errors.length} errors occurred.`
              : ""),
        );
      } catch (error) {
        console.error("CSV import failed:", error);
        alert("Failed to import CSV.");
      }
      event.target.value = "";
    },
    [importCSV],
  );

  const handleCSVExport = useCallback(async () => {
    try {
      const blob = await triggerExport().unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vendor_pricing_${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV export failed:", error);
      alert("Failed to export CSV.");
    }
  }, [triggerExport]);

  // ✨ NEW: Clear all filters
  const handleClearFilters = () => {
    setServiceFilter(null);
    setCategoryFilter(null);
    setSubcategoryFilter(null);
    setItemFilter(null);
    setSearchQuery("");
    setShowOnlyUnpriced(false);
  };

  const hasActiveFilters =
    serviceFilter ||
    categoryFilter ||
    subcategoryFilter ||
    itemFilter ||
    searchQuery ||
    showOnlyUnpriced;

  const isGroupStart = (row, idx) => {
    if (idx === 0) return true;
    const prev = pagedRows[idx - 1];
    return (
      prev.service_name !== row.service_name ||
      prev.category_name !== row.category_name
    );
  };

  const levelStyle = (level) => {
    const map = {
      item: { background: "#DCFCE7", color: "#16A34A" },
      subcategory: { background: "#DBEAFE", color: "#1D4ED8" },
      category: { background: "#F3E8FF", color: "#7C3AED" },
      service: { background: "#FEF3C7", color: "#D97706" },
      all: { background: "#F5F5F4", color: "#78716C" },
    };
    return { ...styles.levelBadge, ...(map[level] || map.all) };
  };

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Vendor Pricing</h1>
          <p style={styles.subtitle}>
            Click any price cell to edit &middot; Select rows for bulk actions
          </p>
        </div>
        <div style={styles.headerActions}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleCSVImport}
          />
          <button
            style={styles.btnIcon}
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon name="upload" size={15} /> Import CSV
          </button>
          <button style={styles.btnIcon} onClick={handleCSVExport}>
            <Icon name="download" size={15} /> Export CSV
          </button>
        </div>
      </div>

      <StatsBar stats={stats} isLoading={statsLoading} />

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <FilterDropdown
            label="Service"
            options={services}
            value={serviceFilter}
            onChange={(v) => {
              setServiceFilter(v);
              setCategoryFilter(null);
              setSubcategoryFilter(null);
              setItemFilter(null);
            }}
          />
          <FilterDropdown
            label="Category"
            options={filteredCategories}
            value={categoryFilter}
            onChange={(v) => {
              setCategoryFilter(v);
              setSubcategoryFilter(null);
              setItemFilter(null);
            }}
            disabled={!serviceFilter}
          />
          <FilterDropdown
            label="Subcategory"
            options={filteredSubcategories}
            value={subcategoryFilter}
            onChange={(v) => {
              setSubcategoryFilter(v);
              setItemFilter(null);
            }}
            disabled={!categoryFilter}
          />
          {/* ✨ NEW: Item filter (with search since lists can be long) */}
          <FilterDropdown
            label="Item"
            options={filteredItems}
            value={itemFilter}
            onChange={setItemFilter}
            searchable={true}
          />
          <button
            onClick={() => setShowOnlyUnpriced(!showOnlyUnpriced)}
            style={{
              ...styles.unpricedToggle,
              ...(showOnlyUnpriced ? styles.unpricedToggleActive : {}),
            }}
          >
            <Icon name="filter" size={14} /> Unpriced only
          </button>
          {hasActiveFilters && (
            <button onClick={handleClearFilters} style={styles.clearBtn}>
              <Icon name="x" size={13} /> Clear
            </button>
          )}
        </div>
        <div style={styles.toolbarRight}>
          <div style={styles.searchBox}>
            <Icon name="search" size={15} />
            <input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedKeys.size > 0 && (
        <div style={styles.bulkBar}>
          <span style={styles.bulkCount}>{selectedKeys.size} selected</span>
          <div style={styles.bulkDivider} />
          <button
            style={styles.btnPrimary}
            onClick={() => setShowBulkModal(true)}
          >
            <Icon name="sparkle" size={14} /> Set Price
          </button>
          <button style={styles.btnDanger} onClick={handleBulkDelete}>
            <Icon name="trash" size={14} /> Remove Prices
          </button>
          <button
            style={styles.btnSecondary}
            onClick={() => setSelectedKeys(new Set())}
          >
            <Icon name="x" size={14} /> Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div style={styles.tableContainer}>
        {isLoading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner} />
            <span>Loading pricing data...</span>
          </div>
        ) : processedRows.length === 0 ? (
          <div style={styles.emptyState}>
            <Icon name="table" size={36} />
            <p style={{ margin: "8px 0 0", fontSize: 13 }}>
              {rawRows.length === 0
                ? "No catalog items found. Add items in the catalog first."
                : "No items match your filters."}
            </p>
          </div>
        ) : (
          <>
            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, ...styles.checkboxCell }}>
                      <input
                        type="checkbox"
                        checked={
                          selectedKeys.size === pagedRows.length &&
                          pagedRows.length > 0
                        }
                        onChange={handleSelectAll}
                        style={styles.checkbox}
                      />
                    </th>
                    {[
                      ["service_name", "Service"],
                      ["category_name", "Category"],
                      ["subcategory_name", "Subcategory"],
                      ["item_name", "Item"],
                    ].map(([key, label]) => (
                      <th
                        key={key}
                        style={{
                          ...styles.th,
                          ...styles.thSortable,
                          ...(sortConfig.key === key ? styles.thSorted : {}),
                        }}
                        onClick={() => handleSort(key)}
                      >
                        {label}
                        {sortConfig.key === key && (
                          <span style={styles.sortArrow}>
                            {sortConfig.dir === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </th>
                    ))}
                    <th
                      style={{
                        ...styles.th,
                        ...styles.thSortable,
                        minWidth: 150,
                        ...(sortConfig.key === "base_price"
                          ? styles.thSorted
                          : {}),
                      }}
                      onClick={() => handleSort("base_price")}
                    >
                      Price (AED)
                      {sortConfig.key === "base_price" && (
                        <span style={styles.sortArrow}>
                          {sortConfig.dir === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </th>
                    <th style={styles.th}>Level</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((row, idx) => {
                    const key = getRowKey(row);
                    const isSelected = selectedKeys.has(key);
                    return (
                      <tr
                        key={key}
                        style={{
                          ...styles.tr,
                          ...(isSelected ? styles.trSelected : {}),
                          ...(isGroupStart(row, idx)
                            ? styles.trGroupStart
                            : {}),
                        }}
                      >
                        <td style={{ ...styles.td, ...styles.checkboxCell }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(row)}
                            style={styles.checkbox}
                          />
                        </td>
                        <td style={{ ...styles.td, fontWeight: 500 }}>
                          {row.service_name}
                        </td>
                        <td style={{ ...styles.td, color: "#78716C" }}>
                          {row.category_name}
                        </td>
                        <td
                          style={{
                            ...styles.td,
                            color: "#A8A29E",
                            fontSize: 12,
                          }}
                        >
                          {row.subcategory_name}
                        </td>
                        <td
                          style={{
                            ...styles.td,
                            fontWeight: 600,
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {row.item_name}
                        </td>
                        <td style={styles.td}>
                          <EditableCell
                            value={row.base_price}
                            row={row}
                            onSave={handleSavePrice}
                          />
                        </td>
                        <td style={styles.td}>
                          {row.pricing_level ? (
                            <span style={levelStyle(row.pricing_level)}>
                              {row.pricing_level}
                            </span>
                          ) : (
                            <span style={{ color: "#A8A29E", fontSize: 12 }}>
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={styles.pagination}>
              <span style={styles.pageInfo}>
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, processedRows.length)} of{" "}
                {processedRows.length} items
                {isFetching && !isLoading && (
                  <span style={{ color: "#1D4ED8", marginLeft: 8 }}>
                    Refreshing...
                  </span>
                )}
              </span>
              <div style={styles.pageBtns}>
                <button
                  style={styles.pageBtn}
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let p;
                  if (totalPages <= 7) p = i + 1;
                  else if (page <= 4) p = i + 1;
                  else if (page >= totalPages - 3) p = totalPages - 6 + i;
                  else p = page - 3 + i;
                  return (
                    <button
                      key={p}
                      style={{
                        ...styles.pageBtn,
                        ...(page === p ? styles.pageBtnActive : {}),
                      }}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  style={styles.pageBtn}
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showBulkModal && (
        <BulkPriceModal
          count={selectedKeys.size}
          onApply={handleBulkApply}
          onClose={() => setShowBulkModal(false)}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════ STYLES
const C = {
  bg: "#FAFAF9",
  surface: "#FFFFFF",
  surfaceHover: "#F5F5F4",
  border: "#E7E5E4",
  borderStrong: "#D6D3D1",
  text: "#1C1917",
  text2: "#78716C",
  text3: "#A8A29E",
  accent: "#1D4ED8",
  accentLight: "#DBEAFE",
  accentHover: "#1E40AF",
  green: "#16A34A",
  greenLight: "#DCFCE7",
  amber: "#D97706",
  amberLight: "#FEF3C7",
  red: "#DC2626",
  redLight: "#FEE2E2",
  font: "'DM Sans', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', Consolas, monospace",
  radius: 8,
  radiusSm: 6,
};

const styles = {
  root: {
    fontFamily: C.font,
    background: C.bg,
    color: C.text,
    minHeight: "100vh",
    padding: "24px 32px",
    WebkitFontSmoothing: "antialiased",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: -0.3,
    margin: "0 0 4px",
  },
  subtitle: { fontSize: 13, color: C.text2, margin: 0 },
  headerActions: { display: "flex", gap: 8, alignItems: "center" },

  btnIcon: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: C.radiusSm,
    fontSize: 13,
    fontWeight: 500,
    fontFamily: C.font,
    cursor: "pointer",
    border: `1px solid ${C.border}`,
    background: C.surface,
    color: C.text2,
    transition: "all 0.15s",
  },
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: C.accent,
    color: "#fff",
    border: `1px solid ${C.accent}`,
    padding: "8px 18px",
    borderRadius: C.radiusSm,
    fontSize: 13,
    fontWeight: 600,
    fontFamily: C.font,
    cursor: "pointer",
  },
  btnSecondary: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: C.surface,
    color: C.text,
    border: `1px solid ${C.border}`,
    padding: "8px 18px",
    borderRadius: C.radiusSm,
    fontSize: 13,
    fontWeight: 500,
    fontFamily: C.font,
    cursor: "pointer",
  },
  btnDanger: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: C.redLight,
    color: C.red,
    border: "1px solid #FECACA",
    padding: "8px 14px",
    borderRadius: C.radiusSm,
    fontSize: 13,
    fontWeight: 500,
    fontFamily: C.font,
    cursor: "pointer",
  },
  // ✨ NEW
  clearBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "7px 12px",
    background: "transparent",
    border: `1px dashed ${C.borderStrong}`,
    borderRadius: C.radiusSm,
    fontSize: 12,
    fontWeight: 500,
    color: C.text2,
    cursor: "pointer",
    fontFamily: C.font,
  },

  statsBar: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: C.radius,
    padding: "14px 20px",
    marginBottom: 16,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 20px",
    minWidth: 80,
  },
  statNumber: {
    fontSize: 17,
    fontWeight: 700,
    fontFamily: C.mono,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: C.text3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
    fontWeight: 500,
  },
  statDivider: { width: 1, height: 32, background: C.border, flexShrink: 0 },
  levelPill: (level) => {
    const map = {
      item: { background: C.greenLight, color: C.green },
      subcategory: { background: C.accentLight, color: C.accent },
      category: { background: "#F3E8FF", color: "#7C3AED" },
      service: { background: C.amberLight, color: C.amber },
      all: { background: "#F5F5F4", color: C.text2 },
    };
    return {
      padding: "2px 8px",
      borderRadius: 10,
      fontSize: 10,
      fontWeight: 600,
      textTransform: "capitalize",
      ...(map[level] || map.all),
    };
  },

  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 0,
    flexWrap: "wrap",
  },
  toolbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  toolbarRight: { display: "flex", alignItems: "center", gap: 8 },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: C.radiusSm,
    padding: "7px 12px",
    minWidth: 220,
  },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: 13,
    fontFamily: C.font,
    color: C.text,
    background: "transparent",
    width: "100%",
  },

  unpricedToggle: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 12px",
    borderRadius: C.radiusSm,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    border: `1px solid ${C.border}`,
    background: C.surface,
    color: C.text2,
    fontFamily: C.font,
  },
  unpricedToggleActive: {
    background: C.amberLight,
    borderColor: "#FCD34D",
    color: C.amber,
  },

  filterBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "7px 12px",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: C.radiusSm,
    cursor: "pointer",
    fontSize: 13,
    fontFamily: C.font,
    color: C.text2,
    whiteSpace: "nowrap",
  },
  filterBtnActive: {
    background: C.accentLight,
    borderColor: "#93C5FD",
    color: C.accent,
  },
  filterBtnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  filterLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    color: C.text3,
    marginRight: 4,
    fontWeight: 600,
  },
  filterValue: { fontWeight: 500 },
  filterMenu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    minWidth: 220,
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: C.radiusSm,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    zIndex: 50,
    maxHeight: 280,
    overflowY: "auto",
    padding: 4,
  },
  filterOption: {
    padding: "8px 12px",
    fontSize: 13,
    cursor: "pointer",
    borderRadius: 4,
  },
  filterOptionSelected: {
    background: C.accentLight,
    color: C.accent,
    fontWeight: 500,
  },
  // ✨ NEW
  filterSearchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 10px",
    borderBottom: `1px solid ${C.border}`,
    marginBottom: 4,
    position: "sticky",
    top: 0,
    background: C.surface,
  },
  filterSearchInput: {
    border: "none",
    outline: "none",
    fontSize: 12,
    fontFamily: C.font,
    color: C.text,
    background: "transparent",
    width: "100%",
  },
  filterEmpty: {
    padding: "12px",
    fontSize: 12,
    color: C.text3,
    textAlign: "center",
    fontStyle: "italic",
  },

  bulkBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    background: C.accentLight,
    border: "1px solid #93C5FD",
    borderRadius: C.radius,
    marginTop: 12,
  },
  bulkCount: { fontSize: 13, fontWeight: 600, color: C.accent },
  bulkDivider: { width: 1, height: 20, background: "#93C5FD" },

  tableContainer: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: C.radius,
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    marginTop: 12,
  },
  tableScroll: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    background: "#F8F7F6",
    padding: "10px 14px",
    textAlign: "left",
    fontWeight: 600,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: C.text2,
    borderBottom: `1px solid ${C.border}`,
    whiteSpace: "nowrap",
    userSelect: "none",
  },
  thSortable: { cursor: "pointer" },
  thSorted: { color: C.accent },
  sortArrow: { display: "inline-block", marginLeft: 4, fontSize: 10 },
  tr: { transition: "background 0.08s" },
  trSelected: { background: "#EFF6FF" },
  trGroupStart: { borderTop: `2px solid ${C.border}` },
  td: {
    padding: "0 14px",
    height: 44,
    borderBottom: "1px solid #F5F5F4",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  checkboxCell: { width: 40, textAlign: "center", padding: "0 10px" },
  checkbox: { width: 16, height: 16, accentColor: C.accent, cursor: "pointer" },

  cellEditing: { display: "flex", alignItems: "center", gap: 4, padding: 2 },
  currencyTag: {
    fontSize: 11,
    fontWeight: 600,
    color: C.text3,
    padding: "0 4px",
  },
  priceInput: {
    width: 100,
    padding: "6px 8px",
    border: `2px solid ${C.accent}`,
    borderRadius: 4,
    fontFamily: C.mono,
    fontSize: 14,
    fontWeight: 500,
    outline: "none",
    background: "#EFF6FF",
    color: C.text,
    boxShadow: "0 0 0 3px rgba(29,78,216,0.1)",
    MozAppearance: "textfield",
  },
  cellDisplay: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: 4,
    gap: 4,
    minWidth: 130,
    position: "relative",
  },
  cellEmpty: {
    border: `1px dashed ${C.borderStrong}`,
    borderRadius: 4,
    background: "#FEFCE8",
  },
  cellFlash: { animation: "savedPulse 0.6s ease" },
  cellCurrency: {
    fontSize: 11,
    color: C.text3,
    fontWeight: 500,
    marginRight: 2,
  },
  cellPrice: {
    fontFamily: C.mono,
    fontWeight: 500,
    fontSize: 14,
    letterSpacing: -0.3,
  },
  editHint: {
    opacity: 0,
    marginLeft: "auto",
    color: C.text3,
    transition: "opacity 0.15s",
  },
  noPrice: { fontSize: 12, color: C.text3, fontStyle: "italic" },
  saveFlash: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 10,
    fontWeight: 700,
    color: C.green,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  levelBadge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 500,
    textTransform: "capitalize",
  },

  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderTop: `1px solid ${C.border}`,
    background: "#FAFAF9",
  },
  pageInfo: { fontSize: 12, color: C.text2 },
  pageBtns: { display: "flex", gap: 4 },
  pageBtn: {
    padding: "6px 12px",
    border: `1px solid ${C.border}`,
    borderRadius: C.radiusSm,
    background: C.surface,
    fontSize: 12,
    fontFamily: C.font,
    cursor: "pointer",
    color: C.text2,
  },
  pageBtnActive: { background: C.accent, color: "#fff", borderColor: C.accent },

  loadingState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    color: C.text2,
  },
  spinner: {
    width: 32,
    height: 32,
    border: `3px solid ${C.border}`,
    borderTopColor: C.accent,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginBottom: 12,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 24px",
    color: C.text3,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.3)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  modalContent: {
    background: C.surface,
    borderRadius: 12,
    padding: 28,
    width: 380,
    boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    color: C.accent,
  },
  modalDesc: {
    fontSize: 13,
    color: C.text2,
    margin: "0 0 20px",
    lineHeight: 1.5,
  },
  modalInputWrap: {
    display: "flex",
    alignItems: "center",
    border: `2px solid ${C.border}`,
    borderRadius: C.radiusSm,
    overflow: "hidden",
  },
  modalCurrency: {
    padding: "10px 14px",
    background: "#F8F7F6",
    fontWeight: 600,
    fontSize: 14,
    color: C.text2,
    borderRight: `1px solid ${C.border}`,
  },
  modalInput: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "10px 14px",
    fontFamily: C.mono,
    fontSize: 16,
    fontWeight: 500,
    color: C.text,
  },
  modalActions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    marginTop: 20,
  },
};

if (typeof document !== "undefined") {
  const styleId = "pricing-spreadsheet-keyframes";
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement("style");
    styleEl.id = styleId;
    styleEl.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&display=swap');
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes savedPulse { 0% { background: #DCFCE7; } 100% { background: transparent; } }
    `;
    document.head.appendChild(styleEl);
  }
}
