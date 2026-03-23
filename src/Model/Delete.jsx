import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const DeleteModal = ({ 
  item, 
  title, 
  message, 
  onConfirm, 
  onClose,
  confirmText = "Delete",
  cancelText = "Cancel"
}) => {
  const [deleting, setDeleting] = React.useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={deleting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex items-start space-x-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
          <div>
            <p className="text-gray-600">{message}</p>
            {item && (
              <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded">
                <p className="text-sm text-red-800">
                  This action cannot be undone.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            disabled={deleting}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;