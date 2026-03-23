import React, { useState } from "react";
// import DataTable from "../Datatable/DataTable";
// import Pagination from "../Datatable/DataPagination";
import Filters from "../Datatable/Filter";
import ViewModal from "../Model/View";
import EditModal from "../Model/Edit";
import DeleteModal from "../Model/Delete";

// ===== MOCK DATA =====
const initialProducts = [
  {
    id: 1,
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400"
    ],
    clothName: "Shirt",
    category: "Men",
    fabric: "Cotton",
    vendor: "CleanPro Laundry",
    location: "Mumbai",
    service: "Wash & Iron",
    processingTime: "24h",
    price: 80,
    rating: 4.6,
    pickup: true,
    status: "Active",
    createdAt: "2025-02-12",
  },

  {
    id: 2,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400",
      "https://images.unsplash.com/photo-1623934555919-9e4d2f1f1c03?w=400",
      "https://images.unsplash.com/photo-1623934560806-73f0f4c1c1ff?w=400"
    ],
    clothName: "Saree",
    category: "Women",
    fabric: "Silk",
    vendor: "FreshWash",
    location: "Delhi",
    service: "Dry Clean",
    processingTime: "48h",
    price: 250,
    rating: 4.8,
    pickup: true,
    status: "Active",
    createdAt: "2025-02-10",
  },

  {
    id: 3,
    images: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
      "https://images.unsplash.com/photo-1600369672770-985fd300a37f?w=400",
      "https://images.unsplash.com/photo-1582582429416-3f5b59b5d1a3?w=400"
    ],
    clothName: "Blanket",
    category: "Household",
    fabric: "Wool",
    vendor: "CleanPro Laundry",
    location: "Pune",
    service: "Heavy Wash",
    processingTime: "72h",
    price: 400,
    rating: 4.3,
    pickup: false,
    status: "Inactive",
    createdAt: "2025-01-28",
  },

  {
    id: 4,
    images: [
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400"
    ],
    clothName: "T-Shirt",
    category: "Men",
    fabric: "Cotton",
    vendor: "QuickWash",
    location: "Mumbai",
    service: "Wash",
    processingTime: "12h",
    price: 50,
    rating: 4.5,
    pickup: true,
    status: "Active",
    createdAt: "2025-02-05",
  },

  {
    id: 5,
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400",
      "https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=400",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"
    ],
    clothName: "Jeans",
    category: "Men",
    fabric: "Denim",
    vendor: "FreshWash",
    location: "Delhi",
    service: "Wash & Fold",
    processingTime: "36h",
    price: 120,
    rating: 4.4,
    pickup: true,
    status: "Active",
    createdAt: "2025-02-03",
  },

  {
    id: 6,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
      "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=400",
      "https://images.unsplash.com/photo-1602810319428-019690571b5b?w=400"
    ],
    clothName: "Kurta",
    category: "Men",
    fabric: "Linen",
    vendor: "CleanPro Laundry",
    location: "Pune",
    service: "Iron",
    processingTime: "24h",
    price: 90,
    rating: 4.2,
    pickup: false,
    status: "Active",
    createdAt: "2025-02-01",
  },

  {
    id: 7,
    images: [
      "https://images.unsplash.com/photo-1612722432474-b971cdcea546?w=400",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400",
      "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=400"
    ],
    clothName: "Dress",
    category: "Women",
    fabric: "Polyester",
    vendor: "QuickWash",
    location: "Mumbai",
    service: "Dry Clean",
    processingTime: "48h",
    price: 300,
    rating: 4.7,
    pickup: true,
    status: "Active",
    createdAt: "2025-01-30",
  },

  {
    id: 8,
    images: [
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400",
      "https://images.unsplash.com/photo-1624378439413-2a5b3720d9e2?w=400"
    ],
    clothName: "Lehenga",
    category: "Women",
    fabric: "Silk",
    vendor: "Royal Cleaners",
    location: "Jaipur",
    service: "Premium Dry Clean",
    processingTime: "72h",
    price: 900,
    rating: 4.9,
    pickup: true,
    status: "Active",
    createdAt: "2025-01-25",
  },

  {
    id: 9,
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400",
      "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=400",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400"
    ],
    clothName: "Curtains",
    category: "Household",
    fabric: "Polyester",
    vendor: "HomeFresh",
    location: "Bangalore",
    service: "Wash",
    processingTime: "48h",
    price: 350,
    rating: 4.3,
    pickup: true,
    status: "Active",
    createdAt: "2025-01-20",
  },

  {
    id: 10,
    images: [
      "https://images.unsplash.com/photo-1603251579431-8041402bdeda?w=400",
      "https://images.unsplash.com/photo-1582582429416-3f5b59b5d1a3?w=400",
      "https://images.unsplash.com/photo-1583845112203-29329902332e?w=400"
    ],
    clothName: "Bedsheet",
    category: "Household",
    fabric: "Cotton",
    vendor: "HomeFresh",
    location: "Chennai",
    service: "Wash & Iron",
    processingTime: "24h",
    price: 200,
    rating: 4.4,
    pickup: true,
    status: "Active",
    createdAt: "2025-01-18",
  },

  {
    id: 11,
    images: [
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400"
    ],
    clothName: "Jacket",
    category: "Men",
    fabric: "Wool",
    vendor: "Royal Cleaners",
    location: "Delhi",
    service: "Dry Clean",
    processingTime: "72h",
    price: 500,
    rating: 4.6,
    pickup: true,
    status: "Active",
    createdAt: "2025-01-15",
  },
];

const columns = [
  {
    key: "id",
    title: "ID",
    render: (_, row) => (
      <span className="text-gray-600 font-medium">{row.id}</span>
    ),
  },

{
  key: "images",
  title: "Images",
  render: (_, row) => (
    <img
      src={row.images?.[0]}
      alt={row.clothName}
      className="w-12 h-12 rounded-lg object-cover"
    />
  ),
},

  // ✅ CLOTH NAME COLUMN
  {
    key: "clothName",
    title: "Cloth Name",
    render: (_, row) => (
      <span className="font-medium text-gray-800">
        {row.clothName}
      </span>
    ),
  },

  {
    key: "category",
    title: "Category",
    render: (_, row) => (
      <span className=" font-semibold text-gray-700">{row.category}</span>
    ),
  },

  {
    key: "service",
    title: "Service",
    render: (_, row) => (
      <span className="font-semibold text-gray-700">{row.service}</span>
    ),
  },

  {
    key: "price",
    title: "Price",
    render: (_, row) => (
      <span className="font-semibold text-gray-800">AED {row.price}</span>
    ),
  },

  {
    key: "status",
    title: "Status",
    render: (_, row) => (
      <span
        className={`px-3 font-semibold py-1 text-xs rounded-full ${
          row.status === "Active"
            ? "bg-green-100 text-green-700"
            : "bg-gray-200 text-gray-600"
        }`}
      >
        {row.status}
      </span>
    ),
  },
];

// ===== COMPONENT =====
export default function Product() {
  const [products, setProducts] = useState(initialProducts);
const [searchText, setSearchText] = useState("");
const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const start = (currentPage - 1) * pageSize;
  const paginatedData = products.slice(start, start + pageSize);

  const handleView = (row) => setViewItem(row);
  const handleEdit = (row) => setEditItem(row);
  const handleDelete = (row) => setDeleteItem(row);

  const confirmDelete = () => {
    setProducts((prev) => prev.filter((p) => p.id !== deleteItem.id));
    setDeleteItem(null);
  };
const filteredProducts = products.filter((p) => {
  const matchSearch =
    p.clothName.toLowerCase().includes(searchText.toLowerCase());

  const matchCategory =
    categoryFilter === "all" || p.category === categoryFilter;

  return matchSearch && matchCategory;
});

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Vendor Cloth Services</h2>
          <p className="text-sm text-gray-500">
            Manage vendor laundry services
          </p>
        </div>
      </div>
<Filters
  searchPlaceholder="Search cloth..."
  onSearch={setSearchText}
  onReset={() => setCategoryFilter("all")}
extraFilters={
  <div className="relative z-50">
    <select
      value={categoryFilter}
      onChange={(e) => setCategoryFilter(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg bg-white
                 focus:outline-none focus:ring-2 focus:ring-gray-300
                 cursor-pointer"
    >
      <option value="all">All Categories</option>
      <option value="Men">Men</option>
      <option value="Women">Women</option>
      <option value="Household">Household</option>
    </select>
  </div>
}
/>
      {/* TABLE */}
      <DataTable
        data={paginatedData}
        columns={columns}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* PAGINATION */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalItems={totalItems}
      />

      {/* VIEW MODAL */}
      {viewItem && (
        <ViewModal
          item={viewItem}
          title="View Cloth Service"
          onClose={() => setViewItem(null)}
          fields={[
            { key: "images", label: "Cloth Images", type: "image" },
            { key: "clothName", label: "Cloth Name" },
            { key: "category", label: "Category" },
            { key: "fabric", label: "Fabric" },
            { key: "vendor", label: "Vendor" },
            { key: "location", label: "Location" },
            { key: "service", label: "Service" },
            { key: "processingTime", label: "Processing Time" },
            { key: "price", label: "Price" },
            { key: "rating", label: "Rating" },
            { key: "status", label: "Status" },
            { key: "createdAt", label: "Created Date" },
          ]}
        />
      )}
{editItem && (
  <EditModal
    item={editItem}
    title="Edit Cloth Service"
    fields={[
      { key: "images", type: "image" },
      { key: "clothName", label: "Cloth Name" },
      { key: "category", label: "Category", type: "select", options:["Men","Women","Household"] },
      { key: "fabric", label: "Fabric" },
      { key: "vendor", label: "Vendor" },
      { key: "location", label: "Location" },
      { key: "service", label: "Service" },
      { key: "processingTime", label: "Processing Time" },
      { key: "price", label: "Price", type:"number" },
    ]}
    onClose={() => setEditItem(null)}
    onSave={(updated) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === updated.id ? updated : p
        )
      );
      setEditItem(null);
    }}
  />
)}

      {/* DELETE MODAL */}
      {deleteItem && (
        <DeleteModal
          item={deleteItem}
          title="Delete Cloth Service"
          message={`Are you sure you want to delete ${deleteItem.clothName}?`}
          onConfirm={confirmDelete}
          onClose={() => setDeleteItem(null)}
        />
      )}
    </div>
  );
}