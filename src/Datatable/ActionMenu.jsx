import React, { useState, useEffect, useRef } from 'react';
import { Eye, Edit, Trash2, MoreVertical } from 'lucide-react';

const ActionMenu = ({ item, onEdit, onDelete, onView, customActions = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {onView && (
            <button
              onClick={() => {
                onView(item);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm">View</span>
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => {
                onEdit(item);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm">Edit</span>
            </button>
          )}

          {customActions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick(item);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center space-x-3 ${action.className || 'text-gray-700'}`}
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              <span className="text-sm">{action.label}</span>
            </button>
          ))}

          {onDelete && (
            <button
              onClick={() => {
                onDelete(item);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center space-x-3 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Delete</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;