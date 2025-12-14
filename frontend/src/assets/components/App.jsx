import React, { useState } from "react";
import Branches from "./branches";
import ATMs from "./atms";

import Regions from "./regions";
import WanIP from "./wan-ip";
import LoginPage from "./LoginPage"; // your login page
import Contacts from "./Contacts";

// Reusable Tab Button Component
const TabButton = ({ active, onClick, color, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200
      ${active ? `border-${color}-600 text-${color}-600 bg-${color}-50` : `border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50`}`}
    >
      <span className={`w-5 h-5 mr-3 ${active ? `text-${color}-600` : "text-gray-400"}`}>
        {icon}
      </span>
      {label}
    </button>
  );
};

// Reusable Stats Card Component
const StatCard = ({ title, value, icon, bg }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className={`h-12 w-12 rounded-lg ${bg} flex items-center justify-center text-2xl`}>
        {icon}
      </div>
    </div>
  </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState("branches");
  const [loggedIn, setLoggedIn] = useState(false); // login state

  // Handle login success
  const handleLogin = () => {
    setLoggedIn(true);
  };

  // Handle logout
  const handleLogout = () => {
    setLoggedIn(false);
    alert("Logged out successfully!");
  };

  // Show login page first
  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Dashboard UI (unchanged)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* NAVBAR */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white">
                🏦
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                BankNET Manager
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>

              {/* Profile & Logout */}
              <div className="flex items-center space-x-2 relative group">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                  A
                </div>
                <span className="text-sm font-medium text-gray-700 cursor-pointer">Admin</span>

                <div className="ml-2 relative group">
                  <button className="px-2 py-1 text-sm text-gray-700 hover:text-gray-900 focus:outline-none">
                    ▼
                  </button>
                  <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Network Management Dashboard</h1>
            <p className="text-gray-600">
              Monitor and manage all bank branches, ATMs, and network configurations
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Branches" value="24" icon="🏢" bg="bg-purple-50" />
          <StatCard title="Active ATMs" value="156" icon="🏧" bg="bg-blue-50" />
          <StatCard title="Network Uptime" value="99.8%" icon="📶" bg="bg-green-50" />
          <StatCard title="Active Issues" value="3" icon="⚠️" bg="bg-yellow-50" />
        </div>

        {/* MAIN CONTENT */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* TABS */}
          <div className="border-b border-gray-200 flex overflow-x-auto">
            <TabButton
              active={activeTab === "branches"}
              onClick={() => setActiveTab("branches")}
              color="purple"
              icon="🏢"
              label="Branches"
            />
            <TabButton
              active={activeTab === "atms"}
              onClick={() => setActiveTab("atms")}
              color="blue"
              icon="🏧"
              label="ATMs"
            />
            <TabButton
              active={activeTab === "wanip"}
              onClick={() => setActiveTab("wanip")}
              color="green"
              icon="🛜"
              label="WAN IP"
            />
            <TabButton
              active={activeTab === "contacts"}
              onClick={() => setActiveTab("contacts")}
              color="purple"
              icon="👤"
              label="Contacts"
            />
            <TabButton
              active={activeTab === "regions"}
              onClick={() => setActiveTab("regions")}
              color="blue"
              icon="🌍"
              label="Regions"
            />
          </div>

          {/* TAB CONTENT */}
          <div className="p-6">
            {activeTab === "branches" && <Branches />}
            {activeTab === "atms" && <ATMs />}
            {activeTab === "wanip" && <WanIP />}
            {activeTab === "contacts" && <Contacts/>}
            {activeTab === "regions" && <Regions />}
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>BankNET Management System v1.0 • Last updated: Today</p>
          <p className="mt-1">Support: support@banknet.com</p>
        </div>
      </div>
    </div>
  );
};

export default App;
