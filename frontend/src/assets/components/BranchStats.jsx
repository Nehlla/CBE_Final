import React from 'react';

const connectionTypes = [
  { value: 'FIBER', label: 'Fiber', color: 'green-600' },
  { value: 'VSAT', label: 'VSAT', color: 'blue-600' },
  { value: 'ADSL', label: 'ADSL', color: 'yellow-600' },
  { value: 'VDSL', label: 'VDSL', color: 'purple-600' },
  { value: '3G', label: '3G', color: 'red-600' },
  { value: 'other', label: 'Other', color: 'gray-600' },
];

const BranchStats = ({ branches = [] }) => {
  const totalBranches = branches.length;

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-gray-500 text-sm">Total Branches</p>
        <p className="text-2xl font-bold text-gray-800">{totalBranches}</p>
      </div>

      {connectionTypes.map((type) => {
        const count = branches.filter(b => b.connection_type === type.value).length;
        return (
          <div key={type.value} className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">{type.label} Connections</p>
            <p className={`text-2xl font-bold text-${type.color}`}>{count}</p>
          </div>
        );
      })}
    </div>
  );
};

export default BranchStats;
