"use client";

import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Base URL for API calls
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const BookingContext = createContext();

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
    const { user } = useAuth();
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
                throw new Error('You must be logged in to create a booking');
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
                throw new Error(data.message || 'Failed to create booking');
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
                throw new Error('You must be logged in to view your bookings');
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
        if (!user || user.role !== 'admin') {
            setError('Admin access required');
            return [];
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
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
                throw new Error(data.message || 'Failed to fetch all bookings');
            }

            setBookings(data.bookings);
            return data.bookings;
        } catch (error) {
            setError(error.message);
            console.error('Error fetching all bookings:', error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Update booking status (admin only)
    const updateBookingStatus = async (bookingId, status, adminNotes = '') => {
        if (!user || user.role !== 'admin') {
            setError('Admin access required');
            throw new Error('Admin access required');
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
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
                throw new Error(data.message || 'Failed to update booking status');
            }

            // Update bookings list
            await fetchAllBookings();

            return data.booking;
        } catch (error) {
            setError(error.message);
            throw error;
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

            // Update user bookings
            await fetchUserBookings();

            return data;
        } catch (error) {
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
                // Fetch user bookings once when user changes
                await fetchUserBookings();

                // If admin, also fetch all bookings
                if (user.role === 'admin') {
                    await fetchAllBookings();
                }
            };

            initialLoad();
        }
    }, [user]); // Only when user changes

    const value = {
        bookings,
        userBookings,
        loading,
        error,
        createBooking,
        fetchUserBookings,
        fetchAllBookings,
        updateBookingStatus,
        cancelBooking
    };

    return (
        <BookingContext.Provider value={value}>
            {children}
        </BookingContext.Provider>
    );
};

export default BookingContext; 