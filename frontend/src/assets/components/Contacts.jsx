import React, { useState } from 'react';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  const [newContact, setNewContact] = useState({
    branch: '',
    full_name: '',
    role: '',
    phone_number: '',
    email: '',
    alternative_phone: '',
    department: ''
  });

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setNewContact(prev => ({ ...prev, [name]: value }));
  };

  const handleAddContact = () => {
    if (editingIndex !== null) {
      const updated = [...contacts];
      updated[editingIndex] = newContact;
      setContacts(updated);
      setEditingIndex(null);
    } else {
      setContacts(prev => [...prev, newContact]);
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
  };

  const handleEditContact = (index) => {
    setNewContact(contacts[index]);
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const handleDeleteContact = (index) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      setContacts(prev => prev.filter((_, i) => i !== index));
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
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
          onClick={() => { setShowAddForm(prev => !prev); setEditingIndex(null); }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
        >
          <span className="mr-2">{showAddForm ? '−' : '+'}</span> Add Contact
        </button>
      </div>

      {/* Add Contact Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-purple-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {editingIndex !== null ? '✏️ Edit Contact Person' : '➕ Add Contact Person'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" name="full_name" placeholder="Full Name *" value={newContact.full_name} onChange={handleContactChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
            <input type="text" name="role" placeholder="Role *" value={newContact.role} onChange={handleContactChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
            <input type="text" name="branch" placeholder="Branch" value={newContact.branch} onChange={handleContactChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <input type="text" name="phone_number" placeholder="Phone Number" value={newContact.phone_number} onChange={handleContactChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <input type="email" name="email" placeholder="Email" value={newContact.email} onChange={handleContactChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <input type="text" name="alternative_phone" placeholder="Alternative Phone" value={newContact.alternative_phone} onChange={handleContactChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <input type="text" name="department" placeholder="Department" value={newContact.department} onChange={handleContactChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="flex space-x-3">
            <button onClick={handleAddContact} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              {editingIndex !== null ? 'Update Contact' : 'Save Contact'}
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
              {filteredContacts.length > 0 ? filteredContacts.map((contact, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{contact.full_name}</td>
                  <td className="px-6 py-4 text-gray-600">{contact.role}</td>
                  <td className="px-6 py-4 text-gray-600">{contact.branch || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{contact.phone_number || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{contact.email || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button onClick={() => handleEditContact(index)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                      <button onClick={() => handleDeleteContact(index)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No contacts found. Click "Add Contact" to create one.</td>
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
