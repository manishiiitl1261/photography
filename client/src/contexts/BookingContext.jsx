"use client";

import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Base URL for API calls
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

    // Create a new booking
    const createBooking = async (bookingData) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error(t.booking.loginRequired);
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
        if (!user) return;

        // Prevent multiple simultaneous fetches and too frequent fetches
        const now = Date.now();
        if (fetchInProgress.current || (now - lastFetchTime.current < MIN_FETCH_INTERVAL)) {
            return;
        }

        fetchInProgress.current = true;
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error(t.booking.loginRequired);
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
        // Non-admin users shouldn't even try to call this API
        if (!user || user.role !== 'admin') {
            console.warn('Non-admin user attempted to access all bookings');
            setError('Admin access required');
            return [];
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found for fetchAllBookings');
                setError('Authentication required');
                return [];
            }

            let apiUrl = `${baseUrl}/api/bookings/admin/all`;
            if (statusFilter) {
                apiUrl += `?status=${statusFilter}`;
            }

            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle unauthorized access specifically for clarity
                if (response.status === 403) {
                    console.error('User not authorized to access all bookings');
                    setError('You do not have permission to access all bookings');
                    return [];
                }

                // Handle other errors
                console.error(`Error fetching all bookings: ${data.message || 'Unknown error'}`);
                setError(data.message || 'Failed to fetch all bookings');
                return [];
            }

            setBookings(data.bookings);
            return data.bookings;
        } catch (error) {
            console.error('Error fetching all bookings:', error);
            setError('Failed to connect to booking service');
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Update booking status (admin only)
    const updateBookingStatus = async (bookingId, status, adminNotes = '') => {
        if (!user || user.role !== 'admin') {
            console.error('Non-admin user attempted to update booking status');
            setError('Admin access required');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                setError('Authentication required');
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
                setError(data.message || 'Failed to update booking status');
                return null;
            }

            // Update bookings list - only if admin
            if (user.role === 'admin') {
                try {
                    await fetchAllBookings();
                } catch (fetchError) {
                    console.error('Error refreshing bookings after status update:', fetchError);
                    // Don't let this fail the main operation
                }
            }

            return data.booking;
        } catch (error) {
            console.error('Error updating booking status:', error);
            setError('Failed to connect to booking service');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Cancel a booking (user can only cancel pending bookings)
    const cancelBooking = async (bookingId) => {
        if (!user) {
            throw new Error('You must be logged in to cancel a booking');
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
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
        if (user) {
            const initialLoad = async () => {
                try {
                    // Always fetch user bookings for all authenticated users
                    await fetchUserBookings();

                    // Only attempt to fetch all bookings if explicitly admin role
                    if (user && user.role === 'admin') {
                        try {
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
        }
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

    const value = {
        // Bookings data
        userBookings,                                     // User's own bookings
        bookings: user?.role === 'admin' ? bookings : [], // All bookings (admin only)

        // Common state
        loading,
        error,
        clearErrors,                                     // Add the new clearErrors function

        // Booking actions - available to all users
        createBooking,
        fetchUserBookings,
        cancelBooking,

        // Admin-only functions - provide safe alternatives for non-admins
        fetchAllBookings: user?.role === 'admin' ? fetchAllBookings : safeFetchAllBookings,
        updateBookingStatus: user?.role === 'admin' ? updateBookingStatus : safeUpdateBookingStatus
    };

    return (
        <BookingContext.Provider value={value}>
            {children}
        </BookingContext.Provider>
    );
};

export default BookingContext; 