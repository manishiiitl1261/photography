"use client";

import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Base URL for API calls
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to check if a user is an admin
const isAdminEmail = (email) => {
    if (!email) return false;

    // Get admin emails from env var and split by comma
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
    console.log('Admin emails config:', adminEmails);

    // Check if email is in admin list
    return adminEmails.includes(email.trim());
};

const BookingContext = createContext();

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [bookings, setBookings] = useState([]);
    const [userBookings, setUserBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchInProgress = useRef(false);
    const lastFetchTime = useRef(0);
    const MIN_FETCH_INTERVAL = 5000; // 5 seconds minimum between fetches

    // Admin-specific state
    const [adminBookings, setAdminBookings] = useState([]);
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminError, setAdminError] = useState(null);

    // Helper function to check authentication
    const checkAuth = () => {
        if (!user) {
            const error = new Error('User not logged in');
            error.code = 'NO_USER';
            console.log('No user logged in');
            throw error;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            const error = new Error(t.booking.loginRequired || 'Authentication required');
            error.code = 'NO_TOKEN';
            console.log('No authentication token found');
            throw error;
        }

        return token;
    };

    // Create a new booking
    const createBooking = async (bookingData) => {
        setLoading(true);
        setError(null);

        try {
            // Try to get authentication token
            let token;
            try {
                token = checkAuth();
            } catch (authError) {
                console.error('Authentication check failed in createBooking:', authError.message);
                setError(authError.message);
                throw authError;
            }

            const apiUrl = `${baseUrl}/api/bookings`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || t.booking.failure);
            }

            // Update user bookings
            await fetchUserBookings();

            return data.booking;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Fetch user's bookings
    const fetchUserBookings = async () => {
        // Prevent multiple simultaneous fetches and too frequent fetches
        const now = Date.now();
        if (fetchInProgress.current || (now - lastFetchTime.current < MIN_FETCH_INTERVAL)) {
            return [];
        }

        fetchInProgress.current = true;
        setLoading(true);
        setError(null);

        try {
            // Try to get authentication token, handle gracefully if not available
            let token;
            try {
                token = checkAuth();
            } catch (authError) {
                // If no user or no token, just return empty bookings without throwing
                if (authError.code === 'NO_USER' || authError.code === 'NO_TOKEN') {
                    console.log('Authentication check failed:', authError.message);
                    setError(authError.message);
                    return [];
                }
                // For other errors, propagate them
                throw authError;
            }

            const apiUrl = `${baseUrl}/api/bookings`;
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch bookings');
            }

            setUserBookings(data.bookings);
            lastFetchTime.current = Date.now();
            return data.bookings;
        } catch (error) {
            setError(error.message);
            console.error('Error fetching user bookings:', error);
            return [];
        } finally {
            setLoading(false);
            fetchInProgress.current = false;
        }
    };

    // Fetch all bookings (admin only)
    const fetchAllBookings = async (statusFilter = '') => {
        // Admin auth is managed through email allowlist + OTP verification
        // Not through the user.role property
        setAdminLoading(true);
        setAdminError(null);

        try {
            // Try to get authentication token
            let token;
            try {
                token = checkAuth();
            } catch (authError) {
                console.error('Authentication check failed in fetchAllBookings:', authError.message);
                setAdminError('Authentication required. Please log in again.');
                return [];
            }

            let apiUrl = `${baseUrl}/api/bookings/admin/all`;
            if (statusFilter) {
                apiUrl += `?status=${statusFilter}`;
            }

            console.log('Fetching admin bookings from:', apiUrl);
            console.log('User email:', user?.email);

            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Check if we have a non-200 status
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Admin bookings fetch failed with status ${response.status}:`, errorText);

                // Try to parse error as JSON if possible
                try {
                    const errorJson = JSON.parse(errorText);
                    setAdminError(errorJson.message || `Error ${response.status}: Failed to fetch bookings`);
                } catch (e) {
                    setAdminError(`Error ${response.status}: ${errorText || 'Failed to fetch bookings'}`);
                }
                return [];
            }

            const data = await response.json();

            console.log('Admin bookings response:', data);
            console.log('Bookings count:', data.count);

            // Ensure we have a valid array of bookings
            if (data.bookings && Array.isArray(data.bookings)) {
                console.log('First booking (if any):', data.bookings[0]);
                setAdminBookings(data.bookings);
                return data.bookings;
            } else {
                console.error('Invalid bookings data received:', data);
                setAdminError('Received invalid booking data from server');
                return [];
            }
        } catch (error) {
            console.error('Error fetching all bookings:', error);
            setAdminError('Failed to connect to booking service: ' + error.message);
            return [];
        } finally {
            setAdminLoading(false);
        }
    };

    // Update booking status (admin only)
    const updateBookingStatus = async (bookingId, status, adminNotes = '') => {
        // Admin auth is managed through email allowlist + OTP verification
        // Not through user.role property
        setAdminLoading(true);
        setAdminError(null);

        try {
            // Try to get authentication token
            let token;
            try {
                token = checkAuth();
            } catch (authError) {
                console.error('Authentication check failed in updateBookingStatus:', authError.message);
                setAdminError('Authentication required. Please log in again.');
                return null;
            }

            const apiUrl = `${baseUrl}/api/bookings/admin/status/${bookingId}`;
            const response = await fetch(apiUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, adminNotes })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error(`Failed to update booking status: ${data.message || 'Unknown error'}`);
                setAdminError(data.message || 'Failed to update booking status');
                return null;
            }

            // Update admin bookings list
            try {
                await fetchAllBookings();
            } catch (fetchError) {
                console.error('Error refreshing admin bookings after status update:', fetchError);
            }

            // If the booking belongs to the current user, also update the user bookings
            // Use correct ID comparison - both toString() for MongoDB ObjectIds
            if (user && data.booking && data.booking.user && user._id) {
                // Convert both IDs to strings for proper comparison
                const bookingUserId = typeof data.booking.user === 'object' ?
                    data.booking.user._id : data.booking.user;

                // Check if IDs match as strings
                if (bookingUserId.toString() === user._id.toString()) {
                    try {
                        await fetchUserBookings();
                    } catch (fetchError) {
                        console.error('Error refreshing user bookings after status update:', fetchError);
                    }
                }
            }

            return data.booking;
        } catch (error) {
            console.error('Error updating booking status:', error);
            setAdminError('Failed to connect to booking service: ' + error.message);
            return null;
        } finally {
            setAdminLoading(false);
        }
    };

    // Cancel a booking (user can only cancel pending bookings)
    const cancelBooking = async (bookingId) => {
        setLoading(true);
        setError(null);

        try {
            // Try to get authentication token
            let token;
            try {
                token = checkAuth();
            } catch (authError) {
                console.error('Authentication check failed in cancelBooking:', authError.message);
                setError(authError.message);
                throw authError;
            }

            const apiUrl = `${baseUrl}/api/bookings/${bookingId}`;
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to cancel booking');
            }

            // After successful cancellation, update the user bookings
            await fetchUserBookings();

            // Return the data, let the component update its own UI
            return data;
        } catch (error) {
            console.error('Error cancelling booking:', error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch bookings based on user role when component mounts or user changes
    useEffect(() => {
        const initialLoad = async () => {
            try {
                // Try to fetch user bookings
                try {
                    await fetchUserBookings();
                } catch (error) {
                    // Log but don't propagate errors from fetchUserBookings
                    console.error('Error in fetchUserBookings during initialLoad:', error);
                }

                // Skip admin checks if no user
                if (!user) return;

                // Determine if user is admin by role or email
                const adminByEmail = isAdminEmail(user.email);
                const adminByRole = user.role === 'admin';
                const isAdmin = adminByRole || adminByEmail;

                console.log('Admin status check:', {
                    email: user.email,
                    role: user.role,
                    adminByEmail,
                    adminByRole,
                    isAdmin,
                    adminEmailsConfig: process.env.NEXT_PUBLIC_ADMIN_EMAILS
                });

                // Attempt to fetch all bookings if user appears to be admin
                if (isAdmin) {
                    try {
                        console.log('Admin detected, fetching all bookings...');
                        await fetchAllBookings();
                    } catch (adminError) {
                        console.error('Error loading admin bookings:', adminError);
                        // Don't let admin booking errors affect the main operation
                    }
                }
            } catch (error) {
                console.error('Error in initial booking load:', error);
                setError('Failed to load your bookings. Please refresh the page.');
            }
        };

        // Kickoff the initial load
        initialLoad();
    }, [user]); // Only when user changes

    // Create a function to clear errors
    const clearErrors = () => {
        setError(null);
    };

    // Create safe dummy functions for non-admins that don't cause errors
    const safeFetchAllBookings = () => {
        console.warn('Non-admin attempted to access fetchAllBookings');
        return Promise.resolve([]);
    };

    const safeUpdateBookingStatus = () => {
        console.warn('Non-admin attempted to access updateBookingStatus');
        setError('Admin access required');
        return Promise.resolve(null);
    };

    // Update context value to include admin-specific states and functions
    const value = {
        // Bookings data
        userBookings,                                     // User's own bookings
        bookings: user?.role === 'admin' ? bookings : [], // All bookings (admin only)
        adminBookings,
        adminLoading,
        adminError,
        setAdminBookings,                                // Expose for debugging tools

        // Common state
        loading,
        error,
        clearErrors,                                     // Add the new clearErrors function

        // Booking actions - available to all users
        createBooking,
        fetchUserBookings,
        cancelBooking,

        // Admin-only functions - provide safe alternatives for non-admins
        // Use both role and email check for admin access
        fetchAllBookings: (user?.role === 'admin' || isAdminEmail(user?.email)) ? fetchAllBookings : safeFetchAllBookings,
        updateBookingStatus: (user?.role === 'admin' || isAdminEmail(user?.email)) ? updateBookingStatus : safeUpdateBookingStatus
    };

    return (
        <BookingContext.Provider value={value}>
            {children}
        </BookingContext.Provider>
    );
};

export default BookingContext; 