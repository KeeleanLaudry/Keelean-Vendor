import React, { useState, useMemo } from "react";
import DataTable from "../DataTable/DataTable";
import Pagination from "../DataTable/DataPagination";

export default function Clothesdata() {
  const [activeTab, setActiveTab] = useState("services");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [newEntry, setNewEntry] = useState("");
  const [selectedAttribute, setSelectedAttribute] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [serviceImage, setServiceImage] = useState(null);

const [services, setServices] = useState([
  {
    id: 1,
    name: "Dry Cleaning",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
    status: true,
  },
  {
    id: 2,
    name: "Laundry",
    image: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1",
    status: true,
  },
]);

  const [items, setItems] = useState([
    { id: 1, name: "Shirt", services: [1], status: true },
    { id: 2, name: "Pant", services: [2], status: true },
  ]);

  const [attributes, setAttributes] = useState([
    { id: 1, name: "Color", applicable_items: [1], status: true },
    { id: 2, name: "Size", applicable_items: [2], status: true },
  ]);

  const [attributeOptions, setAttributeOptions] = useState([
    { id: 1, name: "Red", attribute_type: 1, status: true },
    { id: 2, name: "Large", attribute_type: 2, status: true },
  ]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setServiceImage(URL.createObjectURL(file));
  };

  let data = [];
  if (activeTab === "services") data = services;
  if (activeTab === "items") data = items;
  if (activeTab === "attributes") data = attributes;
  if (activeTab === "attributeOptions") data = attributeOptions;

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedData = useMemo(() => {
    return data.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [data, currentPage, pageSize]);

  const handleConfirmAdd = () => {
    if (!newEntry.trim()) return alert("Enter name");

    if (activeTab === "services") {
      setServices([
        ...services,
        {
          id: services.length + 1,
          name: newEntry,
          image: serviceImage,
          status: true,
        },
      ]);
    }

    if (activeTab === "items") {
      if (!selectedService) return alert("Select service");

      setItems([
        ...items,
        {
          id: items.length + 1,
          name: newEntry,
          services: [Number(selectedService)],
          status: true,
        },
      ]);
    }

    if (activeTab === "attributes") {
      if (!selectedItem) return alert("Select item");

      setAttributes([
        ...attributes,
        {
          id: attributes.length + 1,
          name: newEntry,
          applicable_items: [Number(selectedItem)],
          status: true,
        },
      ]);
    }

    if (activeTab === "attributeOptions") {
      if (!selectedAttribute) return alert("Select attribute");

      setAttributeOptions([
        ...attributeOptions,
        {
          id: attributeOptions.length + 1,
          name: newEntry,
          attribute_type: Number(selectedAttribute),
          status: true,
        },
      ]);
    }

    // reset
    setIsAddPopupOpen(false);
    setNewEntry("");
    setSelectedAttribute("");
    setSelectedService("");
    setSelectedItem("");
    setServiceImage(null);
  };

  const handleCancel = () => {
    setIsAddPopupOpen(false);
  };

  // 🔹 STATUS TOGGLE
  const handleStatusToggle = (record) => {
    const update = (list, setList) => {
      setList(
        list.map((item) =>
          item.id === record.id
            ? { ...item, status: !item.status }
            : item
        )
      );
    };

    if (activeTab === "services") update(services, setServices);
    if (activeTab === "items") update(items, setItems);
    if (activeTab === "attributes") update(attributes, setAttributes);
    if (activeTab === "attributeOptions")
      update(attributeOptions, setAttributeOptions);
  };

  // 🔹 COLUMNS (UI SAME)
  const getColumns = () => {
    const baseColumns = [
      { key: "id", title: "ID" },
      {
        key: "name",
        title: "Name",
        render: (v) => (
          <span className="font-medium text-gray-900">{v}</span>
        ),
      },
    ];

    if (activeTab === "services") {
      baseColumns.push({
        key: "image",
        title: "Image",
        render: (v) =>
          v ? (
            <img src={v} className="w-10 h-10 rounded-md" />
          ) : (
            <span className="text-gray-400 text-xs">No Image</span>
          ),
      });
    }

    if (activeTab === "items") {
      baseColumns.push({
        key: "services",
        title: "Service",
        render: (v) =>
          services.find((s) => s.id === v?.[0])?.name || "N/A",
      });
    }

    if (activeTab === "attributes") {
      baseColumns.push({
        key: "applicable_items",
        title: "Item Type",
        render: (v) =>
          items.find((i) => i.id === v?.[0])?.name || "N/A",
      });
    }

    if (activeTab === "attributeOptions") {
      baseColumns.push({
        key: "attribute_type",
        title: "Attribute",
        render: (v) =>
          attributes.find((a) => a.id === v)?.name || "N/A",
      });
    }

     baseColumns.push({
      key: "status",
      title: "Status",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      ),
    });


   baseColumns.push({
      key: "action",
      title: "Action",
      render: (_, record) => (
        <button
          onClick={() => handleStatusToggle(record)}
          className={`px-3 py-1 rounded-md text-xs font-medium ${
            record.status
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {record.status ? "Deactivate" : "Activate"}
        </button>
      ),
    });
    return baseColumns;
  };

  const columns = getColumns();

  const tabs = [
    { id: "services", label: "Service Categories" },
    { id: "items", label: "Item Types" },
    { id: "attributes", label: "Attribute Types" },
    { id: "attributeOptions", label: "Attribute Options" },
  ];
const getAddTitle = () => {
  if (activeTab === "services") return "Service";
  if (activeTab === "items") return "Item";
  if (activeTab === "attributes") return "Attribute";
  if (activeTab === "attributeOptions") return "Attribute Option";
};
  return (
    <div className="w-[1100px] mx-auto my-10 font-sans">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Catalog Management
        </h1>
        <p className="text-base text-gray-500 mt-1">
          Manage your services, items, attributes and options
        </p>
      </div>

      {/* TABS */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-6 py-3 font-medium text-sm transition-all relative ${
              activeTab === tab.id
                ? "text-gray-900 border-b-2 border-gray-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ADD BUTTON */}
      <div className="flex justify-end mb-4">
       <button
  onClick={() => setIsAddPopupOpen(true)}
  className="flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg hover:from-gray-800 hover:to-black transition-all duration-300 active:scale-95"
>
  <span className="text-lg font-bold">+</span>
  <span className="font-medium">Add {getAddTitle()}</span>
</button>
        {isAddPopupOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
      
    <h3 className="text-lg font-semibold mb-4">
  Add {getAddTitle()}
</h3>

      {/* Select Service (ITEM TAB) */}
      {activeTab === "items" && (
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded"
        >
          <option value="">Select Service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      )}

      {/* Select Item */}
      {activeTab === "attributes" && (
        <select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded"
        >
          <option value="">Select Item</option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
      )}

      {/* Select Attribute */}
      {activeTab === "attributeOptions" && (
        <select
          value={selectedAttribute}
          onChange={(e) => setSelectedAttribute(e.target.value)}
          className="w-full mb-3 px-3 py-2 border rounded"
        >
          <option value="">Select Attribute</option>
          {attributes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      )}

      {/* Image Upload */}
      {activeTab === "services" && (
        <div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Upload Image
  </label>

  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-500 transition">
    
    <span className="text-gray-500 text-sm">
      Click to upload image
    </span>

    <input
      type="file"
      accept="image/*"
      onChange={handleImageUpload}
      className="hidden"
    />
  </label>

  {/* Preview */}
  {serviceImage && (
    <img
      src={serviceImage}
      alt="preview"
      className="mt-3 w-20 h-20 object-cover rounded-md border"
    />
  )}
</div>
      )}

      {/* Name Input */}
      <input
        type="text"
        placeholder="Enter name"
        value={newEntry}
        onChange={(e) => setNewEntry(e.target.value)}
        className="w-full mb-4 px-3 py-2 border rounded"
      />

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleCancel}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmAdd}
          className="px-4 py-2 bg-gray-700 text-white rounded"
        >
          Add
        </button>
      </div>
    </div>
  </div>
)}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <DataTable data={paginatedData} columns={columns} actionMenu={false} />
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}