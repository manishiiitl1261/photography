"use client";

import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user from localStorage on initial load
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
        }

        setLoading(false);
    }, []);

    // Register user
    const register = async (userData) => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Save user and token to localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);

            // Update state
            setUser(data.user);
            setError(null);
            return data;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Login user
    const login = async (credentials) => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Save user and token to localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);

            // Update state
            setUser(data.user);
            setError(null);
            return data;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Logout user
    const logout = () => {
        // Remove from localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        // Update state
        setUser(null);
    };

    // Get user profile
    const getUserProfile = async () => {
        if (!user) return null;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch profile');
            }

            // Update user in state and localStorage
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));

            return data.user;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        if (!user) return null;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            // Update user in state and localStorage
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));

            return data.user;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    // Upload avatar image
    const uploadAvatar = async (imageFile) => {
        if (!user) return null;

        try {
            const token = localStorage.getItem('token');

            // Create FormData object to send the image
            const formData = new FormData();
            formData.append('avatar', imageFile);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Do NOT set Content-Type header with FormData - browser will set it with the boundary
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to upload avatar');
            }

            // Update user in state and localStorage
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));

            return data.user;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            throw error;
        }
    };

    // Get avatar URL helper function
    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath) {
            return '/assets/avtar.png'; // Default avatar
        }

        // If avatar path starts with /uploads/, it's from the server
        if (avatarPath.startsWith('/uploads/')) {
            return `${process.env.NEXT_PUBLIC_API_URL}${avatarPath}`;
        }

        // Otherwise, use the path as is (might be a full URL or local path)
        return avatarPath;
    };

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        getUserProfile,
        updateProfile,
        uploadAvatar,
        getAvatarUrl,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 