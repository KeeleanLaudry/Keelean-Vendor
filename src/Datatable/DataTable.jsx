import React from 'react';
import ActionMenu from './ActionMenu';

const DataTable = ({ 
  data = [], 
  columns = [], 
  loading, 
  error,
  onRowClick,
  onEdit,
  tableClassName="table-fixed" ,  
  onDelete,
  onView,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  actionMenu = true
}) => {

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No data found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full table-fixed">
        <thead className="bg-gray-100">
          <tr>
            {onSelectAll && (
              <th className="py-2 px-4 w-12">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length && data.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
            )}
            
            {columns.map((column) => (
              <th 
                key={column.key} 
                className="py-2 px-4  text-left text-sm font-semibold text-gray-700"
              >
                {column.title}
              </th>
            ))}
            
            {actionMenu && <th className="py-2 px-4 text-right w-32">Actions</th>}
          </tr>
        </thead>
        
        <tbody>
          {data.map((row, index) => {
            const isSelected = selectedRows.includes(row.id);
            const zebra = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
            const rowClass = `${isSelected ? 'bg-blue-50' : zebra} hover:bg-gray-100 transition-colors`;

            return (
              <tr 
                key={row.id || index} 
                className={`${rowClass} ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {onSelectRow && (
                  <td className="py-2 px-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onSelectRow(e.target.checked, row.id)}
                      className="rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                
                {columns.map((column) => (
                  <td 
                    key={column.key} 
                    className="py-2 px-4 text-sm text-gray-700"
                  >
                    {column.render 
                      ? column.render(row[column.key], row) 
                      : (row[column.key] ?? '-')}
                  </td>
                ))}
                
                {actionMenu && (
                  <td className="py-2 px-4 text-right">
                    <ActionMenu
                      item={row}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onView={onView}
                    />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
