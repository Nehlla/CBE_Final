import React, { useState, useEffect } from "react";
import { atmAPI } from "../../api";
import DetailModal from "./DetailModal";

// Reusable Input Component
const FormInput = ({ label, name, value, onChange, type = "text" }) => (
  <input
    type={type}
    name={name}
    placeholder={label}
    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
    value={value || ""}
    onChange={onChange}
  />
);

// Reusable Select Component
const FormSelect = ({ label, name, value, onChange, options }) => (
  <select
    name={name}
    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
    value={value || ""}
    onChange={onChange}
  >
    <option value="">{label}</option>
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

// Reusable Summary Card
const SummaryCard = ({ label, value, color }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <p className="text-gray-500 text-sm">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const ATMs = () => {
  const [atms, setATMs] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedATM, setSelectedATM] = useState(null); // Detail Modal State

  const deploymentStatus = [
    { value: "DEPLOYED", label: "Deployed" },
    { value: "NOT_DEPLOYED", label: "Not Deployed" },
    { value: "IN_MAINTENANCE", label: "In Maintenance" },
  ];

  const locationTypes = [
    { value: "Industrial_Park", label: "Industrial Park" },
    { value: "Financial_Institution", label: "Financial Institution" },
    { value: "University", label: "University" },
    { value: "Hotel", label: "Hotel" },
    { value: "Military_Base", label: "Military Base" },
    { value: "Office_Building", label: "Office Building" },
    { value: "Hospital", label: "Hospital" },
    { value: "other", label: "Other" },
  ];

  const connectionTypes = [
    { value: "FIBER", label: "Fiber" },
    { value: "ADSL", label: "ADSL" },
    { value: "VSAT", label: "VSAT" },
    { value: "VDSL", label: "VDSL" },
    { value: "3G", label: "3G" },
    { value: "other", label: "Other" },
  ];

  const emptyATM = {
    tid: "",
    atm_name: "",
    branch_id: "",
    ip_address: "",
    port: "",
    location_type: "",
    atm_brand: "NCR",
    dispenser_type: "",
    atm_type: "",
    serial_number: "",
    tag_no: "",
    deployment_status: "DEPLOYED",
    placement_type: "",
    service_number: "",
    connection_type: "",
    reserve_casset_availability: "",
    reserve_casset_quantity: "",
  };

  const [newATM, setNewATM] = useState(emptyATM);

  useEffect(() => {
    fetchATMs();
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

  const fetchATMs = async () => {
    try {
      setLoading(true);
      const data = await atmAPI.getAll();
      setATMs(data.results || data);
    } catch (err) {
      console.error("Error fetching ATMs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleATMChange = (e) => {
    const { name, value } = e.target;
    setNewATM((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (atm) => {
    setEditingId(atm.id);
    setNewATM({
      ...emptyATM,
      ...atm,
      branch_id: atm.branch || "", // Ensure branch ID is set correctly
    });
    setShowAddForm(true);
  };

  const handleSaveATM = async () => {
    if (!newATM.tid || !newATM.atm_name) {
      alert("TID and ATM Name are required");
      return;
    }

    try {
      if (editingId) {
        // Update existing ATM
        const updated = await atmAPI.update(editingId, newATM);
        setATMs((prev) =>
          prev.map((a) => (a.id === editingId ? updated : a))
        );
        alert("ATM updated successfully!");
      } else {
        // Create new ATM
        const created = await atmAPI.create(newATM);
        setATMs((prev) => [...prev, created]);
        alert("ATM added successfully!");
      }

      setNewATM(emptyATM);
      setEditingId(null);
      setShowAddForm(false);
    } catch (err) {
      alert(`Error saving ATM: ${err.message}`);
    }
  };

  const handleDeleteATM = async (id) => {
    if (window.confirm("Delete this ATM?")) {
      try {
        await atmAPI.delete(id);
        setATMs((prev) => prev.filter((atm) => atm.id !== id));
      } catch (err) {
        alert(`Error deleting ATM: ${err.message}`);
      }
    }
  };

  const handleCancel = () => {
    setNewATM(emptyATM);
    setEditingId(null);
    setShowAddForm(false);
  };

  const filteredATMs = atms.filter((atm) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      (atm.tid?.toLowerCase() || "").includes(s) ||
      (atm.atm_name?.toLowerCase() || "").includes(s) ||
      (atm.branch_name?.toLowerCase() || "").includes(s);

    const matchesStatus =
      !filterStatus || atm.deployment_status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <DetailModal
        title="ATM"
        data={selectedATM}
        onClose={() => setSelectedATM(null)}
      />

      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search ATM..."
          className="px-4 py-2 w-full max-w-md border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Status</option>
            {deploymentStatus.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setEditingId(null);
              setNewATM(emptyATM);
              setShowAddForm(true);
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            + Add ATM
          </button>
        </div>
      </div>

      {/* ADD/EDIT FORM */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-purple-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {editingId ? "✏️ Edit ATM" : "➕ Add New ATM"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput label="TID *" name="tid" value={newATM.tid} onChange={handleATMChange} />
            <FormInput label="ATM Name *" name="atm_name" value={newATM.atm_name} onChange={handleATMChange} />

            {/* Branch Select */}
            <div className="flex flex-col">
              <select
                name="branch_id"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={newATM.branch_id}
                onChange={handleATMChange}
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <FormSelect
              label="Deployment Status"
              name="deployment_status"
              value={newATM.deployment_status}
              onChange={handleATMChange}
              options={deploymentStatus}
            />

            <FormSelect
              label="Location Type"
              name="location_type"
              value={newATM.location_type}
              onChange={handleATMChange}
              options={locationTypes}
            />

            <FormSelect
              label="Connection Type"
              name="connection_type"
              value={newATM.connection_type}
              onChange={handleATMChange}
              options={connectionTypes}
            />

            <FormInput label="IP Address" name="ip_address" value={newATM.ip_address} onChange={handleATMChange} />
            <FormInput label="Port" name="port" value={newATM.port} onChange={handleATMChange} />
            <FormInput label="ATM Brand" name="atm_brand" value={newATM.atm_brand} onChange={handleATMChange} />
            <FormInput label="Dispenser Type" name="dispenser_type" value={newATM.dispenser_type} onChange={handleATMChange} />
            <FormInput label="ATM Type" name="atm_type" value={newATM.atm_type} onChange={handleATMChange} />
            <FormInput label="Serial Number" name="serial_number" value={newATM.serial_number} onChange={handleATMChange} />
            <FormInput label="Tag Number" name="tag_no" value={newATM.tag_no} onChange={handleATMChange} />
            <FormInput label="Service Number" name="service_number" value={newATM.service_number} onChange={handleATMChange} />
            <FormInput label="Placement Type" name="placement_type" value={newATM.placement_type} onChange={handleATMChange} />
            <FormInput label="Reserve Casset Availability" name="reserve_casset_availability" value={newATM.reserve_casset_availability} onChange={handleATMChange} />
            <FormInput label="Reserve Casset Quantity" name="reserve_casset_quantity" value={newATM.reserve_casset_quantity} onChange={handleATMChange} />
          </div>

          {/* BUTTONS */}
          <div className="flex space-x-3 mt-4">
            <button onClick={handleSaveATM} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              {editingId ? "Update ATM" : "Save ATM"}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["TID", "ATM Name", "Branch", "Status", "Location", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredATMs.length ? (
                filteredATMs.map((atm) => (
                  <tr
                    key={atm.id}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedATM(atm)}
                    title="Click to view details"
                  >
                    <td className="px-6 py-4 font-medium">{atm.tid}</td>
                    <td className="px-6 py-4 text-gray-700">{atm.atm_name}</td>
                    <td className="px-6 py-4 text-gray-700">{atm.branch_name || "-"}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-semibold
                        ${atm.deployment_status === "DEPLOYED"
                            ? "bg-green-100 text-green-700"
                            : atm.deployment_status === "IN_MAINTENANCE"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                      >
                        {atm.deployment_status}
                      </span>
                    </td>

                    <td className="px-6 py-4">{atm.location_type || "-"}</td>

                    <td className="px-6 py-4 flex space-x-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(atm); }}
                        className="text-blue-600 hover:text-blue-800 font-medium z-10 relative"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteATM(atm.id); }}
                        className="text-red-600 hover:text-red-800 font-medium z-10 relative"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center px-6 py-8 text-gray-500">
                    {loading ? "Loading ATMs..." : "No ATMs found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard label="Total ATMs" value={atms.length} color="text-gray-800" />
        <SummaryCard
          label="Deployed ATMs"
          value={atms.filter((a) => a.deployment_status === "DEPLOYED").length}
          color="text-green-600"
        />
        <SummaryCard
          label="In Maintenance"
          value={atms.filter((a) => a.deployment_status === "IN_MAINTENANCE").length}
          color="text-yellow-600"
        />
        <SummaryCard
          label="Not Deployed"
          value={atms.filter((a) => a.deployment_status === "NOT_DEPLOYED").length}
          color="text-red-600"
        />
      </div>
    </>
  );
};

export default ATMs;
