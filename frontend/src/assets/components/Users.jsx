import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';

const Users = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', email: '', is_superuser: false });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/');
            // Handle pagination (results array) or direct array
            setUsers(response.results || response);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const handleDelete = async (id, username, isSuperuser) => {
        const message = isSuperuser
            ? `⚠️ WARNING: You are about to delete a SUPERUSER account (${username}).\n\nThis action cannot be undone. Are you absolutely sure?`
            : `Are you sure you want to delete user "${username}"?`;

        if (window.confirm(message)) {
            try {
                await api.delete(`/users/${id}/`);
                setUsers(prev => prev.filter(u => u.id !== id));
                alert('User deleted successfully!');
            } catch (err) {
                console.error('Error deleting user:', err);
                alert("Error deleting user: " + (err.message || 'Unknown error'));
            }
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/users/', newUser);
            setUsers(prev => [...prev, response]);
            setShowAddForm(false);
            setNewUser({ username: '', password: '', email: '', is_superuser: false });
            alert("User added successfully");
        } catch (err) {
            alert("Error adding user: " + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                    {showAddForm ? 'Cancel' : '+ Add User'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow-md space-y-4 border border-purple-200">
                    <h3 className="font-bold">Add New Colleague</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Username"
                            className="px-4 py-2 border rounded-lg"
                            value={newUser.username}
                            onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="px-4 py-2 border rounded-lg"
                            value={newUser.password}
                            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email (Optional)"
                            className="px-4 py-2 border rounded-lg"
                            value={newUser.email}
                            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                        />
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={newUser.is_superuser}
                                onChange={e => setNewUser({ ...newUser, is_superuser: e.target.checked })}
                            />
                            <span>Is Admin?</span>
                        </label>
                    </div>
                    <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg">Create User</button>
                </form>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.is_superuser ?
                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">Admin</span> :
                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Standard</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {user.id !== currentUser?.id ? (
                                        <button
                                            onClick={() => handleDelete(user.id, user.username, user.is_superuser)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    ) : (
                                        <span className="text-gray-400 text-xs italic">Current User</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
