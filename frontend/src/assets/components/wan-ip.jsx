import React, { useState, useEffect } from 'react';
import { wanIPAPI } from '../../api';
import DetailModal from './DetailModal';

const WanIP = () => {
  const [wanIPs, setWanIPs] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // For Detail View

  const [newWanIP, setNewWanIP] = useState({
    branch_id: '',
    ip_address: '',
    subnet_mask: '',
    gateway: '',
    description: ''
  });

  useEffect(() => {
    fetchWanIPs();
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { branchAPI } = await import("../../api");
      const data = await branchAPI.getAll();
      setBranches(data.results || data);
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

  const fetchWanIPs = async () => {
    try {
      setLoading(true);
      const data = await wanIPAPI.getAll();
      setWanIPs(data.results || data);
    } catch (err) {
      console.error("Error fetching WAN IPs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewWanIP(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (wanIp) => {
    console.log("Editing WAN IP:", wanIp);
    setEditingId(wanIp.id);
    setNewWanIP({
      branch_id: wanIp.branch || '',
      ip_address: wanIp.ip_address || '',
      subnet_mask: wanIp.subnet_mask || '',
      gateway: wanIp.gateway || '',
      description: wanIp.description || ''
    });
    setShowAddForm(true);
  };

  const handleSaveWanIP = async () => {
    console.log("Saving WAN IP...", { editingId, newWanIP });
    try {
      if (editingId) {
        // Update
        const updated = await wanIPAPI.update(editingId, newWanIP);
        console.log("Update successful:", updated);
        setWanIPs(prev => prev.map(ip => ip.id === editingId ? updated : ip));
        alert("WAN IP updated successfully!");
      } else {
        // Create
        const created = await wanIPAPI.create(newWanIP);
        setWanIPs(prev => [...prev, created]);
        alert("WAN IP added successfully!");
      }

      setNewWanIP({ branch_id: '', ip_address: '', subnet_mask: '', gateway: '', description: '' });
      setEditingId(null);
      setShowAddForm(false);
    } catch (err) {
      alert(`Error saving WAN IP: ${err.message}`);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent row click
    if (window.confirm("Delete this WAN IP?")) {
      try {
        await wanIPAPI.delete(id);
        setWanIPs(prev => prev.filter(ip => ip.id !== id));
      } catch (err) {
        alert(`Error deleting WAN IP: ${err.message}`);
      }
    }
  };

  const handleRowClick = (ip) => {
    setSelectedItem(ip);
  };

  return (
    <>
      <DetailModal
        title="WAN IP"
        data={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by branch, IP address..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setNewWanIP({ branch_id: '', ip_address: '', subnet_mask: '', gateway: '', description: '' });
            setShowAddForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <span className="mr-2">+</span> Add WAN IP
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              {editingId ? '✏️ Edit WAN IP Configuration' : '➕ Add New WAN IP Configuration'}
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select
              name="branch_id"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newWanIP.branch_id}
              onChange={handleChange}
            >
              <option value="">Select Branch</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <input
              type="text"
              name="ip_address"
              placeholder="IP Address *"
              value={newWanIP.ip_address}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="subnet_mask"
              placeholder="Subnet Mask"
              value={newWanIP.subnet_mask}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="gateway"
              placeholder="Gateway"
              value={newWanIP.gateway}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={newWanIP.description}
              onChange={handleChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSaveWanIP}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {editingId ? 'Update Configuration' : 'Save Configuration'}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subnet Mask</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gateway</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wanIPs.length > 0 ? wanIPs.map(ip => (
                <tr
                  key={ip.id}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(ip)}
                  title="Click to view details"
                >
                  <td className="px-6 py-4 text-gray-700">{ip.branch_name || '-'}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{ip.ip_address}</td>
                  <td className="px-6 py-4 text-gray-700">{ip.subnet_mask || '-'}</td>
                  <td className="px-6 py-4 text-gray-700">{ip.gateway || '-'}</td>
                  <td className="px-6 py-4 text-gray-700">{ip.description || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(ip); }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium z-10 relative"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDelete(ip.id, e)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium z-10 relative"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    {loading ? "Loading WAN IPs..." : "No WAN IP configurations found. Click \"Add WAN IP\" to create one."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-gray-500 text-sm font-medium">Total WAN IPs</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{wanIPs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <p className="text-gray-500 text-sm font-medium">Configured Branches</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{new Set(wanIPs.map(ip => ip.branch)).size}</p>
        </div>
      </div>
    </>
  );
};

export default WanIP;