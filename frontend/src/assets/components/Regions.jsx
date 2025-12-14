import React, { useState } from 'react';

const Regions = () => {
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [showRegionForm, setShowRegionForm] = useState(false);
  const [showDistrictForm, setShowDistrictForm] = useState(false);
  const [activeView, setActiveView] = useState('regions');

  const [newRegion, setNewRegion] = useState({ name: '', code: '' });
  const [newDistrict, setNewDistrict] = useState({ name: '', region: '' });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleRegionChange = (e) => {
    const { name, value } = e.target;
    setNewRegion(prev => ({ ...prev, [name]: value }));
  };

  const handleDistrictChange = (e) => {
    const { name, value } = e.target;
    setNewDistrict(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRegion = () => {
    if (!newRegion.name) return alert('Region name is required');
    setRegions(prev => [...prev, { ...newRegion, id: generateId() }]);
    setNewRegion({ name: '', code: '' });
    setShowRegionForm(false);
  };

  const handleAddDistrict = () => {
    if (!newDistrict.name || !newDistrict.region) return alert('District name and region are required');
    setDistricts(prev => [...prev, { ...newDistrict, id: generateId() }]);
    setNewDistrict({ name: '', region: '' });
    setShowDistrictForm(false);
  };

  return (
    <>
      {/* View Toggle */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveView('regions')}
          className={`px-4 py-2 rounded-lg ${activeView === 'regions' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >Regions</button>
        <button
          onClick={() => setActiveView('districts')}
          className={`px-4 py-2 rounded-lg ${activeView === 'districts' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >Districts</button>
      </div>

      {/* Regions View */}
      {activeView === 'regions' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Regions Management</h2>
            <button
              onClick={() => setShowRegionForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
            >
              <span className="mr-2">+</span> Add Region
            </button>
          </div>

          {showRegionForm && (
            <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">➕ Add New Region</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Region Name *"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newRegion.name}
                  onChange={handleRegionChange}
                  required
                />
                <input
                  type="text"
                  name="code"
                  placeholder="Region Code"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newRegion.code}
                  onChange={handleRegionChange}
                />
              </div>
              <div className="flex space-x-3">
                <button onClick={handleAddRegion} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Save Region</button>
                <button onClick={() => setShowRegionForm(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Cancel</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number of Districts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {regions.length > 0 ? regions.map(region => (
                    <tr key={region.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{region.name}</td>
                      <td className="px-6 py-4 text-gray-600">{region.code || '-'}</td>
                      <td className="px-6 py-4 text-gray-600">{districts.filter(d => d.region === region.id).length}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500">No regions found. Click "Add Region" to create one.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Districts View */}
      {activeView === 'districts' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Districts Management</h2>
            <button
              onClick={() => setShowDistrictForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
            >
              <span className="mr-2">+</span> Add District
            </button>
          </div>

          {showDistrictForm && (
            <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">➕ Add New District</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="name"
                  placeholder="District Name *"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newDistrict.name}
                  onChange={handleDistrictChange}
                  required
                />
                <select
                  name="region"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newDistrict.region}
                  onChange={handleDistrictChange}
                >
                  <option value="">Select Region</option>
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>{region.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <button onClick={handleAddDistrict} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Save District</button>
                <button onClick={() => setShowDistrictForm(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Cancel</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">District Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {districts.length > 0 ? districts.map(district => {
                    const region = regions.find(r => r.id === district.region);
                    return (
                      <tr key={district.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{district.name}</td>
                        <td className="px-6 py-4 text-gray-600">{region?.name || '-'}</td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan="2" className="px-6 py-8 text-center text-gray-500">No districts found. Click "Add District" to create one.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Regions</p>
          <p className="text-2xl font-bold text-gray-800">{regions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Districts</p>
          <p className="text-2xl font-bold text-blue-600">{districts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Average Districts per Region</p>
          <p className="text-2xl font-bold text-green-600">{regions.length ? (districts.length / regions.length).toFixed(1) : 0}</p>
        </div>
      </div>
    </>
  );
};

export default Regions;
