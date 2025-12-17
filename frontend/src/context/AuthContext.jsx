import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Only check for existing token on initial mount
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access_token');

            if (!token) {
                console.log('[Auth] No token found, user is logged out');
                setLoading(false);
                return;
            }

            console.log('[Auth] Token found, fetching profile...');
            try {
                // api.get returns the data directly
                const userData = await api.get('/users/me/');
                console.log('[Auth] Profile loaded:', userData);
                setUser(userData);
            } catch (error) {
                console.error('[Auth] Failed to load profile, clearing tokens', error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }
            setLoading(false);
        };

        initAuth();
    }, []); // Run only once on mount

    const login = async (username, password) => {
        console.log('[Auth] Login attempt for:', username);

        try {
            // Step 1: Get tokens
            const response = await api.post('/token/', { username, password });
            console.log('[Auth] Tokens received');

            localStorage.setItem('access_token', response.access);
            localStorage.setItem('refresh_token', response.refresh);

            // Step 2: Fetch profile
            // api.get returns the data directly, do NOT use .data
            const userData = await api.get('/users/me/');
            console.log('[Auth] Profile fetched:', userData);

            setUser(userData);
            console.log('[Auth] Login complete!');
            return true;
        } catch (error) {
            console.error('[Auth] Login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        console.log('[Auth] Logging out');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    const fetchProfile = async () => {
        try {
            const userData = await api.get('/users/me/');
            setUser(userData);
        } catch (error) {
            console.error('[Auth] Failed to refresh profile', error);
        }
    };

    console.log('[Auth] Current state - User:', user?.username || 'none', 'Loading:', loading);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
