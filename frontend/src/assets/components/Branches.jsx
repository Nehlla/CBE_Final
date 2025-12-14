import React, { useState, useMemo } from "react";
import BranchForm from "./BranchForm";
import BranchTable from "./BranchTable";
import BranchStats from "./BranchStats";

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

  // -------------------------------
  // Clean helper functions
  // -------------------------------

  const handleAddBranch = (branch) => {
    setBranches((prev) => [...prev, branch]);
    setShowForm(false);
    alert("Branch added successfully!");
  };

  const handleEditBranch = (branch) => setEditingBranch(branch);

  const handleSaveEdit = (updatedBranch) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === updatedBranch.id ? updatedBranch : b))
    );
    setEditingBranch(null);
    alert("Branch updated successfully!");
  };

  const handleDeleteBranch = (id) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;

    setBranches((prev) => prev.filter((b) => b.id !== id));
    alert("Branch deleted successfully!");
  };

  // -------------------------------
  // Filtering using useMemo (cleaner + faster)
  // -------------------------------
  const filteredBranches = useMemo(() => {
    const lower = searchTerm.toLowerCase();

    return branches.filter((branch) => {
      const matchesSearch =
        branch.name?.toLowerCase().includes(lower) ||
        branch.district?.toLowerCase().includes(lower) ||
        branch.service_number?.toLowerCase().includes(lower);

      const matchesConnection =
        !connectionFilter || branch.connection_type === connectionFilter;

      return matchesSearch && matchesConnection;
    });
  }, [branches, searchTerm, connectionFilter]);

  // -------------------------------
  // Component UI
  // -------------------------------

  return (
    <>
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
          initialData={editingBranch || null}
          onSubmit={editingBranch ? handleSaveEdit : handleAddBranch}
          onCancel={() => {
            setShowForm(false);
            setEditingBranch(null);
          }}
        />
      )}

      {/* Table */}
      <BranchTable
        branches={filteredBranches}
        onEdit={handleEditBranch}
        onDelete={handleDeleteBranch}
      />

      {/* Stats */}
      <BranchStats branches={branches} />
    </>
  );
};

export default Branches;
