import React, { useState, useEffect } from "react";

const connectionTypes = [
  { value: "FIBER", label: "Fiber" },
  { value: "ADSL", label: "ADSL" },
  { value: "VSAT", label: "VSAT" },
  { value: "VDSL", label: "VDSL" },
  { value: "3G", label: "3G" },
  { value: "other", label: "Other" },
];

const tunnelFields = Array.from({ length: 7 }, (_, i) => `tunnel_${i}`);

const BranchForm = ({ mode = "add", initialData = {}, onSubmit, onCancel }) => {
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    district_id: "",
    connection_type: "",
    service_number: "",
    account_number: "",
    wan_address: "",
    default_gateway: "",
    lan_address: "",
    host_name: "",
    vsat_ip: "",
    ...tunnelFields.reduce((acc, t) => ({ ...acc, [t]: "" }), {}),
  });

  // Load initial data and districts
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const { districtAPI } = await import("../../api");
        const data = await districtAPI.getAll();
        setDistricts(data.results || data);
      } catch (err) {
        console.error("Error fetching districts:", err);
      }
    };
    fetchDistricts();

    if (mode === "edit" && initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        district_id: initialData.district || initialData.district_id || ""
      }));
    }
  }, [mode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure we send district_id
    const submissionData = { ...formData };
    if (!submissionData.district_id && submissionData.district) {
      submissionData.district_id = submissionData.district;
    }
    onSubmit(submissionData);
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500";

  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-md mb-6 border ${mode === "add" ? "border-purple-200" : "border-blue-200"
        }`}
    >
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        {mode === "add" ? "➕ Add New Branch" : "✏️ Edit Branch"}
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {[
            { name: "name", label: "Branch Name *", required: true },
            { name: "service_number", label: "Service Number" },
            { name: "account_number", label: "Account Number" },
            { name: "wan_address", label: "WAN Address", placeholder: "e.g., 192.168.1.1" },
            { name: "default_gateway", label: "Default Gateway", placeholder: "e.g., 192.168.1.254" },
            { name: "lan_address", label: "LAN Address", placeholder: "e.g., 10.0.0.1" },
            { name: "host_name", label: "Host Name" },
            { name: "vsat_ip", label: "VSAT IP", placeholder: "e.g., 172.16.0.1" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                type="text"
                name={field.name}
                className={inputClass}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder || ""}
                required={field.required || false}
              />
            </div>
          ))}

          {/* District Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select
              name="district_id"
              className={inputClass}
              value={formData.district_id}
              onChange={handleChange}
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.region_name ? `(${d.region_name})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Connection Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Connection Type</label>
            <select
              name="connection_type"
              className={inputClass}
              value={formData.connection_type}
              onChange={handleChange}
            >
              <option value="">Select Connection Type</option>
              {connectionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tunnel IPs */}
          {tunnelFields.map((tunnel) => (
            <div key={tunnel}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tunnel.replace("_", " ").toUpperCase()}
              </label>
              <input
                type="text"
                name={tunnel}
                placeholder={`e.g., 100.64.${tunnel.split("_")[1]}.1`}
                className={inputClass}
                value={formData[tunnel]}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            className={`px-4 py-2 text-white rounded-lg hover:opacity-90 ${mode === "add" ? "bg-green-600" : "bg-blue-600"
              }`}
          >
            {mode === "add" ? "Save Branch" : "Update Branch"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BranchForm;
