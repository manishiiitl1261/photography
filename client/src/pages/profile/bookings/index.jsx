"use client";

import { useState, useEffect } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    CreditCardIcon
} from '@heroicons/react/24/outline';

const statusIcons = {
    pending: <ClockIcon className="h-5 w-5 text-yellow-500" />,
    approved: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
    rejected: <XCircleIcon className="h-5 w-5 text-red-500" />,
    completed: <CreditCardIcon className="h-5 w-5 text-blue-500" />
};

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800'
};

const BookingsPage = () => {
    const { userBookings, fetchUserBookings, cancelBooking, loading, error } = useBooking();
    const { user } = useAuth();
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [sortedBookings, setSortedBookings] = useState([]);

    useEffect(() => {
        // Redirect if not logged in
        if (!user) {
            router.push('/');
            return;
        }

        // Fetch bookings once on component mount
        const loadBookings = async () => {
            await fetchUserBookings();
        };

        loadBookings();
        // Only run this effect when the component mounts or user changes
        // Remove fetchUserBookings from dependency array to prevent infinite calls
    }, [user, router]);

    // Sort bookings when they change
    useEffect(() => {
        if (userBookings) {
            // Sort by date (most recent first) and then by status (pending first)
            const sorted = [...userBookings].sort((a, b) => {
                // First sort by date (newest first)
                const dateComparison = new Date(b.createdAt) - new Date(a.createdAt);

                // If dates are the same, prioritize by status
                if (dateComparison === 0) {
                    // Order: pending, approved, completed, rejected
                    const statusOrder = { pending: 0, approved: 1, completed: 2, rejected: 3 };
                    return statusOrder[a.status] - statusOrder[b.status];
                }

                return dateComparison;
            });

            setSortedBookings(sorted);
        }
    }, [userBookings]);

    const handleCancelBooking = async (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                await cancelBooking(bookingId);
                setMessage('Booking cancelled successfully');
                // Refresh bookings
                fetchUserBookings();
            } catch (error) {
                setMessage(error.message || 'Failed to cancel booking');
            }
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <>
            <Navbar />
            <div className="container mx-auto px-4 pt-32 pb-16">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

                    {message && (
                        <div className="mb-6 p-4 rounded bg-green-100 text-green-700">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 rounded bg-red-100 text-red-700">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <>
                            {sortedBookings.length === 0 ? (
                                <div className="bg-white shadow rounded-lg p-6">
                                    <p className="text-gray-500 text-center">You don't have any bookings yet.</p>
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => router.push('/Services')}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Book a Service
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {sortedBookings.map((booking) => (
                                        <div key={booking._id} className="bg-white shadow rounded-lg overflow-hidden">
                                            <div className="p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h2 className="text-xl font-bold text-gray-800">{booking.serviceType}</h2>
                                                    <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[booking.status]}`}>
                                                        {statusIcons[booking.status]}
                                                        <span className="ml-1 capitalize">{booking.status}</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-500">Package</h3>
                                                        <p className="text-gray-800">{booking.packageType}</p>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-500">Price</h3>
                                                        <p className="text-gray-800">₹{booking.price.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-500">Event Date</h3>
                                                        <p className="text-gray-800">{formatDate(booking.date)}</p>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-500">Location</h3>
                                                        <p className="text-gray-800">{booking.location}</p>
                                                    </div>
                                                </div>

                                                {booking.additionalRequirements && (
                                                    <div className="mb-4">
                                                        <h3 className="text-sm font-medium text-gray-500">Additional Requirements</h3>
                                                        <p className="text-gray-800">{booking.additionalRequirements}</p>
                                                    </div>
                                                )}

                                                {booking.adminNotes && (
                                                    <div className="mb-4 p-3 bg-blue-50 rounded">
                                                        <h3 className="text-sm font-medium text-gray-700">Notes from Admin</h3>
                                                        <p className="text-gray-800">{booking.adminNotes}</p>
                                                    </div>
                                                )}

                                                <div className="mt-4 flex justify-between items-center">
                                                    <div className="text-sm text-gray-500">
                                                        Booked on {formatDate(booking.createdAt)}
                                                    </div>

                                                    {booking.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleCancelBooking(booking._id)}
                                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                                        >
                                                            Cancel Booking
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default BookingsPage; 