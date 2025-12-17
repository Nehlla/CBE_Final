import React from 'react';

const DetailModal = ({ title, data, onClose }) => {
  if (!data) return null;

  // Helper to format values
  const formatValue = (key, value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';

    // Handle Arrays (like contacts)
    if (Array.isArray(value)) {
      if (value.length === 0) return 'None';
      // Specialized handling for contacts
      if (key === 'contacts' || key.includes('contact')) {
        return (
          <ul className="list-disc pl-4 space-y-1">
            {value.map((item, idx) => (
              <li key={idx} className="text-sm">
                {typeof item === 'object' ? (
                  // Try to find common name fields or fallback to stringify
                  (item.full_name || item.name || item.username)
                  + (item.role ? ` - ${item.role}` : '')
                  + (item.phone_number ? ` (${item.phone_number})` : '')
                ) : item}
              </li>
            ))}
          </ul>
        );
      }
      return value.join(', ');
    }

    // Handle Objects (if any other objects slip through)
    if (typeof value === 'object') {
      return (
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
      );
    }

    return String(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">{title} Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(data).map(([key, value]) => {
              // Skip internal fields
              if (['id', 'created_at', 'updated_at', 'branch_id', 'region_id', 'district_id'].includes(key)) return null;

              // Skip branch/region/district if we have branch_name/region_name/district_name
              if (key === 'branch' && data.branch_name) return null;
              if (key === 'region' && data.region_name) return null;
              if (key === 'district' && data.district_name) return null;

              const label = key.replace(/_/g, ' ').toUpperCase();

              return (
                <div key={key} className={key === 'description' || key === 'remark' || key === 'contacts' ? "md:col-span-2" : ""}>
                  <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
                  <div className="text-gray-800 font-medium break-words">
                    {formatValue(key, value)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
