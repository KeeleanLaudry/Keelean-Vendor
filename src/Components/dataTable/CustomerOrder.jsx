import React, { useState, useEffect, useRef } from 'react';
import DataTable from './DataTable';

const CustomerOrdersTable = () => {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const wrapperRef = useRef(null);

  // Sample orders data
  const ordersData = [
    {
      id: 'ORD-001',
      customerName: 'John Smith',
      customerEmail: 'john.smith@email.com',
      customerPhone: '+1 (555) 123-4567',
      pickupTime: '2024-01-15T10:30:00',
      deliveryTime: '2024-01-15T12:00:00',
      orderType: 'Express',
      paymentStatus: 'Paid',
      orderStatus: 'Out for Delivery',
      items: 3,
      totalAmount: 45.5
    },
    {
      id: 'ORD-002',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.j@email.com',
      customerPhone: '+1 (555) 234-5678',
      pickupTime: '2024-01-15T11:00:00',
      deliveryTime: '2024-01-15T13:30:00',
      orderType: 'Regular',
      paymentStatus: 'Pending',
      orderStatus: 'Preparing',
      items: 5,
      totalAmount: 78.25
    },
    {
      id: 'ORD-003',
      customerName: 'Mike Chen',
      customerEmail: 'mike.chen@email.com',
      customerPhone: '+1 (555) 345-6789',
      pickupTime: '2024-01-15T09:15:00',
      deliveryTime: '2024-01-15T10:45:00',
      orderType: 'Express',
      paymentStatus: 'failed',
      orderStatus: 'Delivered',
      items: 2,
      totalAmount: 32.75
    },
    {
      id: 'ORD-004',
      customerName: 'Mike Chen',
      customerEmail: 'mike.chen@email.com',
      customerPhone: '+1 (555) 345-6789',
      pickupTime: '2024-01-15T09:15:00',
      deliveryTime: '2024-01-15T10:45:00',
      orderType: 'Express',
      paymentStatus: 'Refunded',
      orderStatus: 'Delivered',
      items: 2,
      totalAmount: 32.75
    },
    {
      id: 'ORD-005',
      customerName: 'John Smith',
      customerEmail: 'john.smith@email.com',
      customerPhone: '+1 (555) 123-4567',
      pickupTime: '2024-01-15T10:30:00',
      deliveryTime: '2024-01-15T12:00:00',
      orderType: 'Express',
      paymentStatus: 'Paid',
      orderStatus: 'Out for Delivery',
      items: 3,
      totalAmount: 45.5
    }
  ];

  // Close menu when clicking outside — uses a ref for reliability
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Normalizer helper (handles mixed-case input like "failed")
  const normalizeKey = (s) => (s ? `${s}`.trim().replace(/\s+/g, ' ') : '');
  const normalizeStatus = (s) => {
    const t = normalizeKey(s);
    if (!t) return '';
    return t.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  // Order Type Badge Component
  const OrderTypeBadge = ({ type }) => {
    const key = normalizeStatus(type) || 'Regular';
    const map = {
      Express: { color: 'bg-gray-100 text-gray-800 border border-gray-300', icon: '🚀' },
      Regular: { color: 'bg-gray-50 text-gray-600 border border-gray-200', icon: '📦' }
    };

    const cfg = map[key] || map.Regular;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
        <span aria-hidden>{cfg.icon}</span>
        <span>{key}</span>
      </span>
    );
  };

  // Payment Status Badge Component
  const PaymentStatusBadge = ({ status }) => {
    const key = normalizeStatus(status) || 'Pending';
    const map = {
      Paid: { color: 'bg-green-100 text-green-800 border border-green-300', text: 'Paid' },
      Pending: { color: 'bg-yellow-50 text-yellow-800 border border-yellow-200', text: 'Pending' },
      Failed: { color: 'bg-red-100 text-red-800 border border-red-300', text: 'Failed' },
      Refunded: { color: 'bg-gray-100 text-gray-700 border border-gray-300', text: 'Refunded' }
    };

    const cfg = map[key] || map.Pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
        {cfg.text}
      </span>
    );
  };

  // Order Status Badge Component
  const OrderStatusBadge = ({ status }) => {
    const key = normalizeStatus(status) || 'Pending';
    const map = {
      Pending: { color: 'bg-gray-50 text-gray-600 border border-gray-200', dot: 'bg-gray-400' },
      Confirmed: { color: 'bg-gray-100 text-gray-700 border border-gray-300', dot: 'bg-gray-500' },
      Preparing: { color: 'bg-gray-100 text-gray-800 border border-gray-300', dot: 'bg-gray-600' },
      'Ready For Pickup': { color: 'bg-gray-200 text-gray-800 border border-gray-400', dot: 'bg-gray-700' },
      'Out For Delivery': { color: 'bg-gray-300 text-gray-900 border border-gray-500', dot: 'bg-gray-800' },
      Delivered: { color: 'bg-gray-100 text-gray-800 border border-gray-300', dot: 'bg-gray-900' },
      Cancelled: { color: 'bg-gray-50 text-gray-500 border border-gray-200', dot: 'bg-gray-400' }
    };

    // normalize map keys to match normalized status text (e.g. 'Out For Delivery')
    const keys = Object.keys(map);
    const matchedKey = keys.find(k => k.toLowerCase() === key.toLowerCase()) || 'Pending';
    const cfg = map[matchedKey];

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden></span>
        {matchedKey}
      </span>
    );
  };

  // Action Menu Component
  const ActionMenu = ({ order, isOpen, onClose }) => {
    const handleAction = (action) => {
      onClose();
      // real implementation would call APIs / routing
      switch (action) {
        case 'view':
          alert(`View details for order ${order.id}`);
          break;
        case 'edit':
          alert(`Edit order ${order.id}`);
          break;
        case 'track':
          alert(`Track order ${order.id}`);
          break;
        case 'cancel':
          if (window.confirm(`Are you sure you want to cancel order ${order.id}?`)) {
            alert(`Order ${order.id} cancelled`);
          }
          break;
        default:
          break;
      }
    };

    if (!isOpen) return null;

    return (
      <div
        role="menu"
        aria-label={`Actions for ${order.id}`}
        className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 action-menu"
      >
        <div className="py-1">
          <button onClick={() => handleAction('view')} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150" role="menuitem">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            View Details
          </button>

          <button onClick={() => handleAction('edit')} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150" role="menuitem">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit Order
          </button>

          <button onClick={() => handleAction('track')} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150" role="menuitem">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Track Order
          </button>

          <div className="border-t border-gray-200 my-1" />

          <button onClick={() => handleAction('cancel')} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors duration-150" role="menuitem">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            Cancel Order
          </button>
        </div>
      </div>
    );
  };

  // Three Dot Menu Button Component
  const ThreeDotMenu = ({ order }) => {
    const isOpen = activeMenu === order.id;

    const toggleMenu = () => setActiveMenu(isOpen ? null : order.id);

    return (
      <div className="relative action-menu" ref={wrapperRef}>
        <button
          onClick={toggleMenu}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300"
          title="Actions"
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
        </button>

        <ActionMenu order={order} isOpen={isOpen} onClose={() => setActiveMenu(null)} />
      </div>
    );
  };

  // Table columns configuration
  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      width: '120px',
      render: (order) => (
        <span className="font-mono text-sm font-semibold text-gray-900">{order.id}</span>
      )
    },
    {
      key: 'customerName',
      label: 'Customer Name',
      render: (order) => (
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
            {order.customerName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="font-medium text-gray-900">{order.customerName}</div>
            <div className="text-xs text-gray-500">{order.customerPhone}</div>
          </div>
        </div>
      )
    },
    {
      key: 'pickupTime',
      label: 'Pickup Time',
      render: (order) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{formatTime(order.pickupTime)}</div>
          <div className="text-xs text-gray-500">Today</div>
        </div>
      )
    },
    {
      key: 'deliveryTime',
      label: 'Delivery Time',
      render: (order) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{formatTime(order.deliveryTime)}</div>
          <div className="text-xs text-gray-500">Today</div>
        </div>
      )
    },
    {
      key: 'orderType',
      label: 'Order Type',
      render: (order) => <OrderTypeBadge type={order.orderType} />
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      render: (order) => <PaymentStatusBadge status={order.paymentStatus} />
    },
    {
      key: 'orderStatus',
      label: 'Order Status',
      render: (order) => <OrderStatusBadge status={order.orderStatus} />
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '80px',
      render: (order) => <ThreeDotMenu order={order} />
    }
  ];

  // Custom row styling
  const getRowClass = (order, index) => {
    const baseClass = 'transition-colors duration-150 hover:bg-gray-50';

    if ((order.orderStatus || '').toLowerCase() === 'cancelled') {
      return `${baseClass} bg-gray-100 text-gray-500`;
    }

    if ((order.orderStatus || '').toLowerCase() === 'delivered') {
      return `${baseClass} bg-gray-50`;
    }

    return index % 2 === 0 ? `${baseClass} bg-white` : `${baseClass} bg-gray-50`;
  };

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold mt-20 text-center text-gray-900 mb-2">Customer Orders</h1>
        <p className="text-gray-600 text-center">Manage and track all customer orders</p>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={ordersData}
        isFetching={loading}
        emptyMessage="No orders found. Start by creating your first order!"
        getRowClass={getRowClass}
        pagination={true}
        page={page}
        setPage={setPage}
        paginationData={{
          totalPages: 1,
          totalDocs: ordersData.length,
          limit: 10
        }}
        className="shadow-lg"
      />
    </div>
  );
};

export default CustomerOrdersTable;
