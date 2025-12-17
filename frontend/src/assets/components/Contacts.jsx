import React, { useState, useEffect } from 'react';
import { contactAPI } from '../../api';
import DetailModal from './DetailModal';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingContact, setEditingContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null); // Detail Modal

  const [newContact, setNewContact] = useState({
    branch: '',
    full_name: '',
    role: '',
    phone_number: '',
    email: '',
    alternative_phone: '',
    department: ''
  });

  useEffect(() => {
    fetchContacts();
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

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await contactAPI.getAll();
      setContacts(data.results || data);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setNewContact(prev => ({ ...prev, [name]: value }));
  };

  const handleAddContact = async () => {
    try {
      if (editingContact) {
        console.log('Updating contact:', editingContact.id, newContact);
        const updated = await contactAPI.update(editingContact.id, newContact);
        console.log('Update response:', updated);
        setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
        setEditingContact(null);
        alert('Contact updated successfully!');
      } else {
        const created = await contactAPI.create(newContact);
        setContacts(prev => [...prev, created]);
        alert('Contact created successfully!');
      }

      setNewContact({
        branch: '',
        full_name: '',
        role: '',
        phone_number: '',
        email: '',
        alternative_phone: '',
        department: ''
      });
      setShowAddForm(false);
    } catch (err) {
      console.error('Error saving contact:', err);
      alert(`Error saving contact: ${err.message}`);
    }
  };

  const handleEditContact = (contact) => {
    setNewContact(contact);
    setEditingContact(contact);
    setShowAddForm(true);
  };

  const handleDeleteContact = async (id, e) => {
    e.stopPropagation(); // Prevent row click
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactAPI.delete(id);
        setContacts(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        alert(`Error deleting contact: ${err.message}`);
      }
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.branch_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <DetailModal
        title="Contact Person"
        data={selectedContact}
        onClose={() => setSelectedContact(null)}
      />

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search contacts by name, role, branch, or phone..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => { setShowAddForm(prev => !prev); setEditingContact(null); }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
        >
          <span className="mr-2">{showAddForm ? '−' : '+'}</span> Add Contact
        </button>
      </div>

      {/* Add Contact Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-purple-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {editingContact ? '✏️ Edit Contact Person' : '➕ Add Contact Person'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" name="full_name" placeholder="Full Name *" value={newContact.full_name} onChange={handleContactChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
            <input type="text" name="role" placeholder="Role *" value={newContact.role} onChange={handleContactChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />

            <select
              name="branch"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={newContact.branch}
              onChange={handleContactChange}
            >
              <option value="">Select Branch</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <input type="text" name="phone_number" placeholder="Phone Number" value={newContact.phone_number} onChange={handleContactChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <input type="email" name="email" placeholder="Email" value={newContact.email} onChange={handleContactChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <input type="text" name="alternative_phone" placeholder="Alternative Phone" value={newContact.alternative_phone} onChange={handleContactChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <input type="text" name="department" placeholder="Department" value={newContact.department} onChange={handleContactChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="flex space-x-3">
            <button onClick={handleAddContact} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              {editingContact ? 'Update Contact' : 'Save Contact'}
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Contacts Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContacts.length > 0 ? filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedContact(contact)}
                  title="Click to view details"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{contact.full_name}</td>
                  <td className="px-6 py-4 text-gray-600">{contact.role}</td>
                  <td className="px-6 py-4 text-gray-600">{contact.branch_name || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{contact.phone_number || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{contact.email || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditContact(contact); }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium z-10 relative"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDeleteContact(contact.id, e)}
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
                    {loading ? "Loading contacts..." : "No contacts found. Click \"Add Contact\" to create one."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contacts Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Contacts</p>
          <p className="text-2xl font-bold text-gray-800">{contacts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Contacts with Email</p>
          <p className="text-2xl font-bold text-blue-600">{contacts.filter(c => c.email).length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Contacts with Phone</p>
          <p className="text-2xl font-bold text-green-600">{contacts.filter(c => c.phone_number).length}</p>
        </div>
      </div>
    </>
  );
};

export default Contacts;
