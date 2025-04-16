"use client";

import { createContext, useState, useContext, useEffect } from 'react';

// Define baseUrl with fallback - ensure it's hardcoded as a fallback
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
// Always use this direct URL for authentication calls to prevent proxy issues
const directServerUrl = 'http://localhost:5000';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tokenExpiry, setTokenExpiry] = useState(null);
    const [refreshTimerId, setRefreshTimerId] = useState(null);

    // Helper to parse JWT and get expiration
    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Error parsing JWT token', e);
            return null;
        }
    };

    // Setup token refresh timer
    const setupRefreshTimer = (token) => {
        // Clear any existing timer
        if (refreshTimerId) {
            clearTimeout(refreshTimerId);
        }

        // Parse token to get expiry
        const payload = parseJwt(token);
        if (payload && payload.exp) {
            // Convert expiry to milliseconds and subtract current time
            const expiryMs = payload.exp * 1000;
            setTokenExpiry(new Date(expiryMs));

            // Set timer to refresh 5 minutes before expiry
            const timeToRefresh = Math.max(0, expiryMs - Date.now() - (5 * 60 * 1000));

            const timerId = setTimeout(async () => {
                // Try to refresh token
                await refreshToken();
            }, timeToRefresh);

            setRefreshTimerId(timerId);
        }
    };

    // Refresh token
    const refreshToken = async () => {
        try {
            const token = localStorage.getItem('token');
            const refreshTokenValue = localStorage.getItem('refreshToken');

            if (!refreshTokenValue) {
                throw new Error('No refresh token available');
            }

            // Hardcoded URL
            const apiUrl = 'http://localhost:5000/api/auth/refresh';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken: refreshTokenValue }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Save new tokens
                localStorage.setItem('token', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);

                // Update user if needed
                if (data.user) {
                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                }

                // Setup new refresh timer
                setupRefreshTimer(data.token);
                return true;
            } else {
                // If refresh fails, log user out
                logout();
                return false;
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            logout();
            return false;
        }
    };

    // Load user from localStorage on initial load
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setupRefreshTimer(storedToken);
        }

        setLoading(false);

        // Clean up timer on unmount
        return () => {
            if (refreshTimerId) {
                clearTimeout(refreshTimerId);
            }
        };
    }, []);

    // Register user
    const register = async (userData) => {
        setLoading(true);
        try {
            // Hardcoded URL - no environment variables
            const apiUrl = 'http://localhost:5000/api/auth/register';
            console.log('Registration attempt with direct URL:', apiUrl);

            const response = await fetch(apiUrl, {
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

            // Check if email verification is required
            if (data.requiresVerification) {
                console.log('Email verification required for:', userData.email);
                return {
                    success: true,
                    requiresVerification: true,
                    email: userData.email,
                    message: data.message
                };
            }

            // If verification not required, proceed with normal login flow
            // Save user and token to localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);

            // Setup token refresh
            setupRefreshTimer(data.token);

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
        setError(null);
        try {
            // Hardcoded URL - no environment variables or baseUrl
            const apiUrl = 'http://localhost:5000/api/auth/login';
            console.log('Login attempt with direct URL:', apiUrl);
            console.log('Credentials:', { email: credentials.email, passwordLength: credentials.password?.length });

            // Use a try-catch to specifically handle fetch errors
            let response;
            try {
                response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(credentials),
                });
            } catch (fetchError) {
                console.error('Network error during login:', fetchError);
                const networkError = new Error('Network error. Please check your connection and try again.');
                setError(networkError.message);
                throw networkError;
            }

            console.log('Login response status:', response.status);

            let data;
            let rawText = '';

            try {
                rawText = await response.text();
                console.log('Raw response:', rawText.substring(0, 200) + (rawText.length > 200 ? '...' : ''));

                try {
                    data = JSON.parse(rawText);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    // Show a more user-friendly error
                    const parseErrorMessage = 'Unable to connect to the server. Please try again later.';
                    setError(parseErrorMessage);
                    throw new Error(parseErrorMessage);
                }
            } catch (textError) {
                console.error('Error getting response text:', textError);
                const textErrorMessage = 'Failed to read server response. Please try again.';
                setError(textErrorMessage);
                throw new Error(textErrorMessage);
            }

            // Check for specific error scenarios
            if (!response.ok) {
                let errorMessage = '';

                // Create a user-friendly error based on the status code
                if (response.status === 401) {
                    if (data && data.message) {
                        errorMessage = data.message;
                    } else {
                        errorMessage = 'Invalid email or password. Please try again.';
                    }
                } else if (response.status === 403) {
                    errorMessage = data?.message || 'Account locked. Please try again later.';

                    // Check if email verification is required
                    if (data && data.requiresVerification) {
                        return {
                            success: false,
                            requiresVerification: true,
                            email: data.email,
                            message: data.message || 'Email verification required'
                        };
                    }
                } else if (response.status === 404) {
                    errorMessage = 'Server error: Login service not available.';
                } else {
                    errorMessage = data?.message || 'Login failed. Please try again.';
                }

                // Set error in context state but DO NOT throw an error
                setError(errorMessage);
                console.error('Login failed:', errorMessage);

                // Return error object instead of throwing
                return {
                    success: false,
                    error: errorMessage,
                    message: errorMessage
                };
            }

            // Handle successful login
            if (!data || !data.success) {
                const unexpectedError = 'Unexpected response from server.';
                setError(unexpectedError);
                throw new Error(unexpectedError);
            }

            // Save user and token to localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);

            // Save refresh token if available
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }

            // Setup token refresh
            setupRefreshTimer(data.token);

            // Update state
            setUser(data.user);
            setError(null);
            return data;
        } catch (error) {
            // Make sure we log but also properly handle the error
            console.error('Login error:', error);
            if (!error.message) {
                error.message = 'An unexpected error occurred';
            }
            if (!error.handled) {
                setError(error.message);
            }
            error.handled = true;
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Logout user
    const logout = async () => {
        try {
            const token = localStorage.getItem('token');

            // Try to call logout endpoint if we have a token
            if (token) {
                // Hardcoded URL
                const apiUrl = 'http://localhost:5000/api/auth/logout';

                await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });
            }
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Clean up timer
            if (refreshTimerId) {
                clearTimeout(refreshTimerId);
                setRefreshTimerId(null);
            }

            // Remove from localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');

            // Update state
            setUser(null);
            setTokenExpiry(null);
        }
    };

    // Get user profile
    const getUserProfile = async () => {
        if (!user) return null;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Hardcoded URL
            const apiUrl = 'http://localhost:5000/api/auth/profile';

            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include'
            });

            if (response.status === 401) {
                // Try to refresh the token
                const refreshed = await refreshToken();
                if (refreshed) {
                    // Retry with new token
                    const newToken = localStorage.getItem('token');
                    const retryResponse = await fetch(apiUrl, {
                        headers: {
                            'Authorization': `Bearer ${newToken}`,
                        },
                        credentials: 'include'
                    });

                    if (!retryResponse.ok) {
                        throw new Error('Failed to fetch profile after token refresh');
                    }

                    const retryData = await retryResponse.json();
                    setUser(retryData.user);
                    localStorage.setItem('user', JSON.stringify(retryData.user));
                    return retryData.user;
                } else {
                    throw new Error('Authentication failed. Please login again.');
                }
            }

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
            if (error.message.includes('Authentication') || error.message.includes('token')) {
                // Clear invalid authentication data
                logout();
            }
            return null;
        }
    };

    // Check if email exists in system - implementation preserved but not used
    const checkEmailExists = async (email) => {
        try {
            console.log('Note: Email check functionality is not implemented on server.');
            return false; // Always return false since the endpoint doesn't exist
        } catch (error) {
            console.error('Error checking email:', error);
            return false;
        }
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        if (!user) return null;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Check if email is being changed
            const isEmailChanged = user.email !== profileData.email;

            // If email is changed, just validate the format
            if (isEmailChanged) {
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(profileData.email)) {
                    throw new Error('Please provide a valid email address');
                }
            }

            // Use regular profile update endpoint for all changes
            const apiUrl = 'http://localhost:5000/api/auth/profile';

            const response = await fetch(apiUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(profileData),
                credentials: 'include'
            });

            if (response.status === 401) {
                // Try to refresh the token
                const refreshed = await refreshToken();
                if (refreshed) {
                    // Retry with new token
                    const newToken = localStorage.getItem('token');
                    const retryResponse = await fetch(apiUrl, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${newToken}`,
                        },
                        body: JSON.stringify(profileData),
                        credentials: 'include'
                    });

                    try {
                        const retryData = await retryResponse.json();

                        if (!retryResponse.ok) {
                            // Check for validation errors in retry response
                            if (retryResponse.status === 400 && retryData.errors) {
                                const errorMessages = Object.values(retryData.errors)
                                    .map(err => err.message || err)
                                    .join(', ');
                                throw new Error(errorMessages || retryData.message || 'Failed to update profile');
                            }
                            throw new Error(retryData.message || 'Failed to update profile after token refresh');
                        }

                        // Check if email verification is required
                        if (retryData.requiresVerification) {
                            return {
                                success: true,
                                requiresVerification: true,
                                email: retryData.email || profileData.email,
                                message: retryData.message || 'Please verify your new email address'
                            };
                        }

                        // Standard response handling
                        setUser(retryData.user);
                        localStorage.setItem('user', JSON.stringify(retryData.user));
                        return retryData;
                    } catch (parseError) {
                        console.error('Error parsing retry response:', parseError);
                        throw new Error('Failed to parse server response. Please try again.');
                    }
                } else {
                    throw new Error('Authentication failed. Please login again.');
                }
            }

            try {
                const data = await response.json();

                if (!response.ok) {
                    // Check for specific validation errors
                    if (response.status === 400 && data.errors) {
                        const errorMessages = Object.values(data.errors)
                            .map(err => err.message || err)
                            .join(', ');
                        throw new Error(errorMessages || data.message || 'Failed to update profile');
                    }

                    // Handle email duplication error specifically - return a proper error object
                    if (data.message && data.message.includes('already associated with another account')) {
                        // Don't throw - return a formatted error object that the UI can handle
                        return {
                            success: false,
                            error: true,
                            message: data.message
                        };
                    }

                    throw new Error(data.message || 'Failed to update profile');
                }

                // Check if email verification is required
                if (data.requiresVerification) {
                    return {
                        success: true,
                        requiresVerification: true,
                        email: data.email || profileData.email,
                        message: data.message || 'Please verify your new email address'
                    };
                }

                // Update user in state and localStorage
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));

                return data;
            } catch (parseError) {
                console.error('Error parsing profile response:', parseError);
                throw new Error('Failed to parse server response. Please try again.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            if (error.message.includes('Authentication') || error.message.includes('token')) {
                // Clear invalid authentication data
                logout();
            }
            throw error;
        }
    };

    // Upload avatar image
    const uploadAvatar = async (imageFile) => {
        if (!user) return null;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Create FormData object to send the image
            const formData = new FormData();
            formData.append('avatar', imageFile);

            // Hardcoded URL
            const apiUrl = 'http://localhost:5000/api/auth/avatar';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Do NOT set Content-Type header with FormData - browser will set it with boundary
                },
                body: formData,
                credentials: 'include'
            });

            if (response.status === 401) {
                // Try to refresh the token
                const refreshed = await refreshToken();
                if (refreshed) {
                    // Retry with new token
                    const newToken = localStorage.getItem('token');
                    const retryResponse = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${newToken}`,
                            // Do NOT set Content-Type header with FormData
                        },
                        body: formData,
                        credentials: 'include'
                    });

                    if (!retryResponse.ok) {
                        throw new Error('Failed to upload avatar after token refresh');
                    }

                    const retryData = await retryResponse.json();
                    setUser(retryData.user);
                    localStorage.setItem('user', JSON.stringify(retryData.user));
                    return retryData.user;
                } else {
                    throw new Error('Authentication failed. Please login again.');
                }
            }

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
            if (error.message.includes('Authentication') || error.message.includes('token')) {
                // Clear invalid authentication data
                logout();
            }
            throw error;
        }
    };

    // Remove avatar image
    const removeAvatar = async () => {
        if (!user) return null;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Hardcoded URL
            const apiUrl = 'http://localhost:5000/api/auth/avatar';

            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include'
            });

            if (response.status === 401) {
                // Try to refresh the token
                const refreshed = await refreshToken();
                if (refreshed) {
                    // Retry with new token
                    const newToken = localStorage.getItem('token');
                    const retryResponse = await fetch(apiUrl, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${newToken}`,
                        },
                        credentials: 'include'
                    });

                    if (!retryResponse.ok) {
                        throw new Error('Failed to remove avatar after token refresh');
                    }

                    const retryData = await retryResponse.json();
                    setUser(retryData.user);
                    localStorage.setItem('user', JSON.stringify(retryData.user));
                    return retryData.user;
                } else {
                    throw new Error('Authentication failed. Please login again.');
                }
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to remove avatar');
            }

            // Update user in state and localStorage
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));

            return data.user;
        } catch (error) {
            console.error('Error removing avatar:', error);
            if (error.message.includes('Authentication') || error.message.includes('token')) {
                // Clear invalid authentication data
                logout();
            }
            throw error;
        }
    };

    // Verify email with OTP
    const verifyEmail = async (email, otp) => {
        setLoading(true);
        setError(null);
        try {
            // Hardcoded URL
            const apiUrl = 'http://localhost:5000/api/auth/verify-email';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Verification failed');
            }

            // If verification succeeded and we received user data and token
            if (data.success && data.user && data.token) {
                // Save user and token to localStorage
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);

                // Setup token refresh
                setupRefreshTimer(data.token);

                // Update state
                setUser(data.user);
                setError(null);
            }

            return data;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Resend verification OTP
    const resendVerificationOTP = async (email) => {
        setLoading(true);
        setError(null);
        try {
            // Hardcoded URL
            const apiUrl = 'http://localhost:5000/api/auth/resend-verification';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend verification code');
            }

            return data;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Get avatar URL helper function
    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath) {
            return '/assets/avtar.png'; // Default avatar
        }

        // If avatar path starts with /uploads/, it's from the server
        if (avatarPath.startsWith('/uploads/')) {
            return `http://localhost:5000${avatarPath}`;
        }

        // Otherwise, use the path as is (might be a full URL or local path)
        return avatarPath;
    };

    const value = {
        user,
        loading,
        error,
        tokenExpiry,
        setUser,
        register,
        login,
        logout,
        refreshToken,
        getUserProfile,
        updateProfile,
        uploadAvatar,
        removeAvatar,
        getAvatarUrl,
        verifyEmail,
        resendVerificationOTP,
        checkEmailExists,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext; 