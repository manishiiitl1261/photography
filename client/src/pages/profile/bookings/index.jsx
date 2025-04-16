"use client";

import { useState, useEffect } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    CreditCardIcon
} from '@heroicons/react/24/outline';
import Footer from '@/components/footer/Footer';
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
    const { userBookings, fetchUserBookings, cancelBooking, loading, error, clearErrors } = useBooking();
    const { user } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [sortedBookings, setSortedBookings] = useState([]);
    const [buttonLoading, setButtonLoading] = useState({});

    useEffect(() => {
        // Clear any existing errors
        clearErrors();

        // Redirect if not logged in
        if (!user) {
            router.push('/');
            return;
        }

        // Fetch bookings once on component mount
        const loadBookings = async () => {
            try {
                // Clear any previous messages
                setMessage('');
                await fetchUserBookings();
            } catch (error) {
                console.error('Error fetching user bookings:', error);
                setMessage(error.message || 'Failed to load your bookings. Please try refreshing the page.');
            }
        };

        loadBookings();
        // Only run this effect when the component mounts or user changes
    }, [user, router, clearErrors]);

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
        if (window.confirm(t.booking.cancelConfirm)) {
            try {
                // Show loading state for this specific button
                setButtonLoading({ ...buttonLoading, [bookingId]: true });

                // Call API to cancel booking
                await cancelBooking(bookingId);

                // Update the state directly for immediate UI feedback
                setSortedBookings(prevBookings =>
                    prevBookings.filter(booking => booking._id !== bookingId)
                );

                // Show success message
                setMessage(t.booking.cancelSuccess);
            } catch (error) {
                console.error('Error cancelling booking:', error);
                setMessage(error.message || t.booking.cancelError);
            } finally {
                // Remove loading state
                const newLoadingState = { ...buttonLoading };
                delete newLoadingState[bookingId];
                setButtonLoading(newLoadingState);

                // Refresh all bookings from server to ensure accuracy
                fetchUserBookings();
            }
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (error) {
            // Fallback if there's an issue with date formatting
            return dateString;
        }
    };

    // Map status values to translation keys
    const getTranslatedStatus = (status) => {
        const statusMap = {
            pending: t.booking.status.pending,
            approved: t.booking.status.confirmed,
            rejected: t.booking.status.rejected,
            completed: t.booking.status.completed,
            cancelled: t.booking.status.cancelled
        };
        return statusMap[status] || status;
    };

    const renderBookingsList = () => {
        if (loading) {
            return (
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            );
        }

        if (sortedBookings.length === 0) {
            return (
                <div className="bg-white shadow rounded-lg p-6">
                    <p className="text-gray-500 text-center">{t.booking.noBookings}</p>
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => router.push('/Services')}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {t.booking.submitButton}
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 gap-6">
                {sortedBookings.map((booking) => (
                    <div key={booking._id} className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">{booking.serviceType}</h2>
                                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[booking.status]}`}>
                                    {statusIcons[booking.status]}
                                    <span className="ml-1 capitalize">{getTranslatedStatus(booking.status)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">{t.booking.bookingDetails.package}</h3>
                                    <p className="text-gray-800">{booking.packageType}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">{t.booking.bookingDetails.price}</h3>
                                    <p className="text-gray-800">₹{booking.price.toLocaleString()}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">{t.booking.bookingDetails.eventDate}</h3>
                                    <p className="text-gray-800">{formatDate(booking.date)}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">{t.booking.bookingDetails.location}</h3>
                                    <p className="text-gray-800">{booking.location}</p>
                                </div>
                            </div>

                            {booking.additionalRequirements && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-500">{t.booking.bookingDetails.requirements}</h3>
                                    <p className="text-gray-800">{booking.additionalRequirements}</p>
                                </div>
                            )}

                            {booking.adminNotes && (
                                <div className="mb-4 p-3 bg-blue-50 rounded">
                                    <h3 className="text-sm font-medium text-gray-700">{t.booking.bookingDetails.adminNotes}</h3>
                                    <p className="text-gray-800">{booking.adminNotes}</p>
                                </div>
                            )}

                            <div className="mt-4 flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    {typeof window !== 'undefined' ? `${t.booking.bookedOn} ${formatDate(booking.createdAt)}` : t.booking.bookedOn}
                                </div>

                                {booking.status === 'pending' && (
                                    <button
                                        onClick={() => handleCancelBooking(booking._id)}
                                        className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-all ${buttonLoading[booking._id] ? 'opacity-75 cursor-wait' : ''}`}
                                        disabled={buttonLoading[booking._id]}
                                    >
                                        {buttonLoading[booking._id] ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {t.booking.cancelling || 'Cancelling...'}
                                            </span>
                                        ) : (
                                            t.booking.cancelBooking
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <Navbar />
            <main className="bg-purple-200">
                <div className="container mx-auto px-4 pt-32 pb-16">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between">
                            <h1 className="text-3xl font-bold mb-8 text-black">{t.booking.myBookings}</h1>
                            <div className="mt-4 text-center">
                                <button
                                    onClick={() => router.push('/Services')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {t.booking.submitButton}
                                </button>
                            </div>
                        </div>
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

                        {renderBookingsList()}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default BookingsPage; 