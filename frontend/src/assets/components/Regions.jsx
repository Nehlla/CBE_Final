import React, { useState, useEffect } from 'react';
import { regionAPI, districtAPI } from '../../api';

const Regions = () => {
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [showRegionForm, setShowRegionForm] = useState(false);
  const [showDistrictForm, setShowDistrictForm] = useState(false);
  const [activeView, setActiveView] = useState('regions');
  const [loading, setLoading] = useState(false);
  const [editingRegionId, setEditingRegionId] = useState(null);
  const [editingDistrictId, setEditingDistrictId] = useState(null);

  const [newRegion, setNewRegion] = useState({ name: '', code: '' });
  const [newDistrict, setNewDistrict] = useState({ name: '', region_id: '' });

  useEffect(() => {
    fetchRegions();
    fetchDistricts();
  }, []);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const data = await regionAPI.getAll();
      setRegions(data.results || data);
    } catch (err) {
      console.error("Error fetching regions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      const data = await districtAPI.getAll();
      setDistricts(data.results || data);
    } catch (err) {
      console.error("Error fetching districts:", err);
    }
  };

  const handleRegionChange = (e) => {
    const { name, value } = e.target;
    setNewRegion(prev => ({ ...prev, [name]: value }));
  };

  const handleDistrictChange = (e) => {
    const { name, value } = e.target;
    setNewDistrict(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRegion = async () => {
    if (!newRegion.name) return alert('Region name is required');
    try {
      if (editingRegionId) {
        console.log('Updating region:', editingRegionId, newRegion);
        const updated = await regionAPI.update(editingRegionId, newRegion);
        console.log('Update response:', updated);
        setRegions(prev => prev.map(r => r.id === editingRegionId ? updated : r));
        setEditingRegionId(null);
        alert('Region updated successfully!');
      } else {
        const created = await regionAPI.create(newRegion);
        setRegions(prev => [...prev, created]);
        alert('Region created successfully!');
      }
      setNewRegion({ name: '', code: '' });
      setShowRegionForm(false);
    } catch (err) {
      console.error('Error saving region:', err);
      alert(`Error saving region: ${err.message}`);
    }
  };

  const handleEditRegion = (region) => {
    setEditingRegionId(region.id);
    setNewRegion({ name: region.name, code: region.code || '' });
    setShowRegionForm(true);
  };

  const handleDeleteRegion = async (id) => {
    if (!window.confirm('Delete this region?')) return;
    try {
      await regionAPI.delete(id);
      setRegions(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert(`Error deleting region: ${err.message}`);
    }
  };

  const handleAddDistrict = async () => {
    if (!newDistrict.name || !newDistrict.region_id) return alert('District name and region are required');
    try {
      if (editingDistrictId) {
        console.log('Updating district:', editingDistrictId, newDistrict);
        const updated = await districtAPI.update(editingDistrictId, newDistrict);
        console.log('Update response:', updated);
        setDistricts(prev => prev.map(d => d.id === editingDistrictId ? updated : d));
        setEditingDistrictId(null);
        alert('District updated successfully!');
      } else {
        const created = await districtAPI.create(newDistrict);
        setDistricts(prev => [...prev, created]);
        alert('District created successfully!');
      }
      setNewDistrict({ name: '', region_id: '' });
      setShowDistrictForm(false);
    } catch (err) {
      console.error('Error saving district:', err);
      alert(`Error saving district: ${err.message}`);
    }
  };

  const handleEditDistrict = (district) => {
    setEditingDistrictId(district.id);
    setNewDistrict({ name: district.name, region_id: district.region });
    setShowDistrictForm(true);
  };

  const handleDeleteDistrict = async (id) => {
    if (!window.confirm('Delete this district?')) return;
    try {
      await districtAPI.delete(id);
      setDistricts(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert(`Error deleting district: ${err.message}`);
    }
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
              onClick={() => {
                setEditingRegionId(null);
                setNewRegion({ name: '', code: '' });
                setShowRegionForm(true);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
            >
              <span className="mr-2">+</span> Add Region
            </button>
          </div>

          {showRegionForm && (
            <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">{editingRegionId ? '✏️ Edit Region' : '➕ Add New Region'}</h3>
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
                <button onClick={handleAddRegion} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{editingRegionId ? 'Update Region' : 'Save Region'}</button>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {regions.length > 0 ? regions.map(region => (
                    <tr key={region.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{region.name}</td>
                      <td className="px-6 py-4 text-gray-600">{region.code || '-'}</td>
                      <td className="px-6 py-4 text-gray-600">{districts.filter(d => d.region === region.id).length}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button onClick={() => handleEditRegion(region)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                          <button onClick={() => handleDeleteRegion(region.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        {loading ? "Loading regions..." : "No regions found. Click \"Add Region\" to create one."}
                      </td>
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
              onClick={() => {
                setEditingDistrictId(null);
                setNewDistrict({ name: '', region_id: '' });
                setShowDistrictForm(true);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
            >
              <span className="mr-2">+</span> Add District
            </button>
          </div>

          {showDistrictForm && (
            <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">{editingDistrictId ? '✏️ Edit District' : '➕ Add New District'}</h3>
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
                  name="region_id"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newDistrict.region_id}
                  onChange={handleDistrictChange}
                >
                  <option value="">Select Region</option>
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>{region.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <button onClick={handleAddDistrict} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{editingDistrictId ? 'Update District' : 'Save District'}</button>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {districts.length > 0 ? districts.map(district => {
                    const region = district.region || regions.find(r => r.id === district.region);
                    return (
                      <tr key={district.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{district.name}</td>
                        <td className="px-6 py-4 text-gray-600">{region?.name || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button onClick={() => handleEditDistrict(district)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                            <button onClick={() => handleDeleteDistrict(district.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                          </div>
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                        {loading ? "Loading districts..." : "No districts found. Click \"Add District\" to create one."}
                      </td>
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
