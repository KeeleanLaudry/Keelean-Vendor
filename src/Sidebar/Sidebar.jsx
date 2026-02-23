// src/Components/Sidebar/Sidebar.jsx
import React, { useState } from "react";
import {
  ShoppingBagIcon,
  HomeIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  TruckIcon,
  MapPinIcon,
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const menuConfig = [
  {
    id: "new-order",
    label: "New Order Notifications",
    icon: ShoppingBagIcon,
    items: ["New customer order", "Pending approvals", "Order updates"],
  },
  {
    id: "pickup-requested",
    label: "Pickup Requested",
    icon: TruckIcon,
    items: ["Pickup requested", "Schedule pickup", "Pickup history"],
  },
  {
    id: "delivery-requested",
    label: "Delivery Requested",
    icon: MapPinIcon,
    items: ["Delivery requested", "Delivery tracking", "Delivery issues"],
  },
  {
    id: "customer-dropoff",
    label: "Customer Pickup/Drop-off",
    icon: ArrowsRightLeftIcon,
    items: ["Pickup / drop-off by customer", "Customer locations", "Time slots"],
  },
  {
    id: "search",
    label: "Search & Analytics",
    icon: MagnifyingGlassIcon,
    items: ["Quick Search", "Advanced filters", "Analytics dashboard"],
  },
];

const Sidebar = () => {
  const [activeMenuId, setActiveMenuId] = useState(menuConfig[0].id);
  const [selectedItem, setSelectedItem] = useState(menuConfig[0].items[0]);
  const [isOpen, setIsOpen] = useState(true);

  const activeMenu = menuConfig.find((m) => m.id === activeMenuId);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* LEFT - Clean Icon Rail */}
      <div className="w-16 bg-gray-100 border-r border-gray-200 flex flex-col items-center py-6">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#95A1AC] to-[#808A93] flex items-center justify-center shadow-sm">
            <CubeIcon className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex flex-col gap-3 flex-1">
          {menuConfig.map((menu) => {
            const Icon = menu.icon;
            const isActive = menu.id === activeMenuId;
            return (
              <button
                key={menu.id}
                onClick={() => {
                  setActiveMenuId(menu.id);
                  setSelectedItem(menu.items[0]);
                }}
                className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-[#F8F9FA] border border-[#EBEDEF] shadow-sm"
                      : "hover:bg-gray-100"
                  }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? "text-[#808A93]"
                      : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                
                {/* Notification Badge */}
                {menu.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#95A1AC] text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {menu.badge}
                  </span>
                )}
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-[#95A1AC] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* User & Controls */}
        <div className="flex flex-col items-center gap-3">
          <button className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
            <BellIcon className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
            <UserCircleIcon className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200"
          >
            {isOpen ? (
              <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* RIGHT - Clean Expanded Panel */}
      {isOpen && activeMenu && (
        <div className="w-80 bg-gray-100 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Vendor Platform
                </p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  Dashboard 
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Menu Section */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F8F9FA] border border-[#EBEDEF] flex items-center justify-center">
                <activeMenu.icon className="w-5 h-5 text-[#808A93]" />
              </div>
              <div>
                
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {activeMenu.label}
                </p>
              </div>
            </div>
           
          </div>

          {/* Submenu Items */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {activeMenu.items.map((item, index) => (
              <button
                key={item}
                onClick={() => setSelectedItem(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200
                  ${
                    selectedItem === item
                      ? "bg-[#F8F9FA] font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    selectedItem === item ? "bg-[#95A1AC]" : "bg-gray-300"
                  }`}
                />
                <span className="flex-1 text-left">{item}</span>
              
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Active Session
              </p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#95A1AC] to-[#808A93] flex items-center justify-center">
                <UserCircleIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Vendor Enterprise
                </p>
                <p className="text-xs text-gray-500">
                  Last active: Just now
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;