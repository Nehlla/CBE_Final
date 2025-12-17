import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Branches from "./Branches";
import ATMs from "./ATMs";
import Regions from "./Regions";
import WanIP from "./wan-ip";
import Login from "./Login";
import Contacts from "./Contacts";
import Users from "./Users";
import Profile from "./Profile";
import { branchAPI, atmAPI, contactAPI, regionAPI } from "../../api";
import { AuthProvider, useAuth } from "../../context/AuthContext";

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

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("branches");
  const { logout, user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [stats, setStats] = useState({
    branches: 0,
    atms: 0,
    contacts: 0,
    regions: 0,
  });

  // Fetch stats from backend
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [branches, atms, contacts, regions] = await Promise.all([
        branchAPI.getAll().catch(() => ({ results: [] })),
        atmAPI.getAll().catch(() => ({ results: [] })),
        contactAPI.getAll().catch(() => ({ results: [] })),
        regionAPI.getAll().catch(() => ({ results: [] })),
      ]);

      setStats({
        branches: (branches.results || branches).length,
        atms: (atms.results || atms).length,
        contacts: (contacts.results || contacts).length,
        regions: (regions.results || regions).length,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleLogout = () => {
    logout();
  };

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
              {/* Profile & Logout Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none hover:bg-gray-100 rounded-full p-2 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {(user?.username || 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.username || 'User'}</span>
                  <span className="text-gray-400 text-xs">▼</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">{user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.is_superuser ? 'Administrator' : 'Standard User'}</p>
                    </div>
                    <button
                      onClick={() => { setShowProfile(true); setIsDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition-colors"
                    >
                      My Profile
                    </button>
                    {user?.is_superuser && (
                      <button
                        onClick={() => { setActiveTab("users"); setIsDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition-colors"
                      >
                        Manage Users
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
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
          <StatCard title="Total Branches" value={stats.branches} icon="🏢" bg="bg-purple-50" />
          <StatCard title="Active ATMs" value={stats.atms} icon="🏧" bg="bg-blue-50" />
          <StatCard title="Total Contacts" value={stats.contacts} icon="👤" bg="bg-green-50" />
          <StatCard title="Total Regions" value={stats.regions} icon="🌍" bg="bg-yellow-50" />
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
            {user?.is_superuser && (
              <TabButton
                active={activeTab === "users"}
                onClick={() => setActiveTab("users")}
                color="red"
                icon="🔒"
                label="Users"
              />
            )}
          </div>

          {/* TAB CONTENT */}
          <div className="p-6">
            {activeTab === "branches" && <Branches />}
            {activeTab === "atms" && <ATMs />}
            {activeTab === "wanip" && <WanIP />}
            {activeTab === "contacts" && <Contacts />}
            {activeTab === "regions" && <Regions />}
            {activeTab === "users" && user?.is_superuser && <Users />}
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>BankNET Management System v1.0 • Last updated: Today</p>
          <p className="mt-1">Support: ekedir37@gmail.com</p>
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && <Profile onClose={() => setShowProfile(false)} />}
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center text-xl font-semibold text-gray-500">Loading Application...</div>;
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
      </Routes>
    </AuthProvider>
  );
};

export default App;
