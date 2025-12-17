import React from 'react';

const connectionTypeStyles = {
  FIBER: 'bg-green-100 text-green-800',
  VSAT: 'bg-blue-100 text-blue-800',
  ADSL: 'bg-yellow-100 text-yellow-800',
  VDSL: 'bg-purple-100 text-purple-800',
  '3G': 'bg-red-100 text-red-800',
  other: 'bg-gray-100 text-gray-800',
};

const BranchTable = ({ branches = [], onEdit, onDelete, onView }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Connection Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">WAN Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {branches.length > 0 ? (
              branches.map((branch) => {
                const style = connectionTypeStyles[branch.connection_type] || connectionTypeStyles.other;
                return (
                  <tr 
                    key={branch.id} 
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => onView && onView(branch)}
                    title="Click to view details"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{branch.name}</td>
                    <td className="px-6 py-4 text-gray-600">{branch.district_name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${style}`}>
                        {branch.connection_type || 'Not Set'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{branch.service_number || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{branch.wan_address || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); onEdit(branch); }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium z-10 relative"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(branch.id); }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium z-10 relative"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No branches found. Click "Add Branch" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BranchTable;
