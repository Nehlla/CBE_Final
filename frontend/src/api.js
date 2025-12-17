// API client for backend communication
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('access_token');

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const defaultOptions = {
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            // Optional: Redirect to login or dispatch event
            // window.location.href = '/login'; 
        }
        const error = await response.json().catch(() => ({ detail: 'Network error' }));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    // Handle empty responses (like DELETE which returns 204 No Content)
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType || contentType.indexOf('application/json') === -1) {
        return null;
    }

    return response.json();
}

// Generic API object for AuthContext and others
export const api = {
    get: (endpoint) => apiCall(endpoint),
    post: (endpoint, body) => apiCall(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => apiCall(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    patch: (endpoint, body) => apiCall(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (endpoint) => apiCall(endpoint, { method: 'DELETE' }),
};

// Region API
export const regionAPI = {
    getAll: () => apiCall('/regions/'),
    get: (id) => apiCall(`/regions/${id}/`),
    create: (data) => apiCall('/regions/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/regions/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`/regions/${id}/`, { method: 'DELETE' }),
};

// District API
export const districtAPI = {
    getAll: () => apiCall('/districts/'),
    get: (id) => apiCall(`/districts/${id}/`),
    create: (data) => apiCall('/districts/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/districts/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`/districts/${id}/`, { method: 'DELETE' }),
};

// Branch API
export const branchAPI = {
    getAll: () => apiCall('/branches/'),
    get: (id) => apiCall(`/branches/${id}/`),
    create: (data) => apiCall('/branches/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/branches/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`/branches/${id}/`, { method: 'DELETE' }),
};

// Contact API
export const contactAPI = {
    getAll: () => apiCall('/contacts/'),
    get: (id) => apiCall(`/contacts/${id}/`),
    create: (data) => apiCall('/contacts/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/contacts/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`/contacts/${id}/`, { method: 'DELETE' }),
};

// ATM API
export const atmAPI = {
    getAll: () => apiCall('/atms/'),
    get: (id) => apiCall(`/atms/${id}/`),
    create: (data) => apiCall('/atms/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/atms/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`/atms/${id}/`, { method: 'DELETE' }),
};

// WAN IP API
export const wanIPAPI = {
    getAll: () => apiCall('/wan-ips/'),
    get: (id) => apiCall(`/wan-ips/${id}/`),
    create: (data) => apiCall('/wan-ips/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiCall(`/wan-ips/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiCall(`/wan-ips/${id}/`, { method: 'DELETE' }),
};
