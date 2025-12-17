import React, { useState, useMemo, useEffect } from "react";
import BranchForm from "./BranchForm";
import BranchTable from "./BranchTable";
import BranchStats from "./BranchStats";
import { branchAPI } from "../../api";
import DetailModal from "./DetailModal";

const connectionTypes = [
  { value: "FIBER", label: "Fiber" },
  { value: "ADSL", label: "ADSL" },
  { value: "VSAT", label: "VSAT" },
  { value: "VDSL", label: "VDSL" },
  { value: "3G", label: "3G" },
  { value: "other", label: "Other" },
];

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [connectionFilter, setConnectionFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null); // Detail Modal

  // Fetch branches on mount
  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await branchAPI.getAll();
      setBranches(data.results || data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching branches:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async (branch) => {
    try {
      const newBranch = await branchAPI.create(branch);
      setBranches((prev) => [...prev, newBranch]);
      setShowForm(false);
      alert("Branch added successfully!");
    } catch (err) {
      alert(`Error adding branch: ${err.message}`);
    }
  };

  const handleEditBranch = (branch) => setEditingBranch(branch);

  const handleSaveEdit = async (updatedBranch) => {
    try {
      const updated = await branchAPI.update(updatedBranch.id, updatedBranch);
      setBranches((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );
      setEditingBranch(null);
      alert("Branch updated successfully!");
    } catch (err) {
      alert(`Error updating branch: ${err.message}`);
    }
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;

    try {
      await branchAPI.delete(id);
      setBranches((prev) => prev.filter((b) => b.id !== id));
      alert("Branch deleted successfully!");
    } catch (err) {
      alert(`Error deleting branch: ${err.message}`);
    }
  };

  // Filtering using useMemo (cleaner + faster)
  const filteredBranches = useMemo(() => {
    const lower = searchTerm.toLowerCase();

    return branches.filter((branch) => {
      const matchesSearch =
        branch.name?.toLowerCase().includes(lower) ||
        branch.district_name?.toLowerCase().includes(lower) ||
        branch.service_number?.toLowerCase().includes(lower);

      const matchesConnection =
        !connectionFilter || branch.connection_type === connectionFilter;

      return matchesSearch && matchesConnection;
    });
  }, [branches, searchTerm, connectionFilter]);

  if (loading && branches.length === 0) {
    return <div className="text-center py-8">Loading branches...</div>;
  }

  return (
    <>
      <DetailModal
        title="Branch"
        data={selectedBranch}
        onClose={() => setSelectedBranch(null)}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <input
            type="text"
            placeholder="Search by name, district, or service number..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            value={connectionFilter}
            onChange={(e) => setConnectionFilter(e.target.value)}
          >
            <option value="">All Connection Types</option>
            {connectionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setEditingBranch(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
        >
          <span className="text-xl mr-2">+</span> Add Branch
        </button>
      </div>

      {/* Add / Edit Form */}
      {(showForm || editingBranch) && (
        <BranchForm
          mode={editingBranch ? "edit" : "add"}
          initialData={editingBranch}
          onSubmit={editingBranch ? handleSaveEdit : handleAddBranch}
          onCancel={() => {
            setShowForm(false);
            setEditingBranch(null);
          }}
        />
      )}

      {/* Stats */}
      {!showForm && !editingBranch && <BranchStats branches={branches} />}

      {/* Table */}
      {!showForm && !editingBranch && (
        <BranchTable
          branches={filteredBranches}
          onEdit={handleEditBranch}
          onDelete={handleDeleteBranch}
          onView={(branch) => setSelectedBranch(branch)}
        />
      )}
    </>
  );
};

export default Branches;
