"use client";

import { useState, useEffect } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    CreditCardIcon,
    FilterIcon
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

const AdminDashboard = () => {
    const { bookings, fetchAllBookings, updateBookingStatus, loading, error } = useBooking();
    const { user } = useAuth();
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState('');
    const [message, setMessage] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Check if user is admin, redirect if not
        if (!user) {
            router.push('/');
            return;
        }

        if (user && user.role !== 'admin') {
            router.push('/');
            return;
        }

        // Fetch bookings with filter
        fetchAllBookings(statusFilter);
    }, [user, router, statusFilter]);

    const handleStatusChange = async (bookingId, newStatus) => {
        // For approve/reject actions, open modal to add notes
        if (newStatus === 'approved' || newStatus === 'rejected') {
            const booking = bookings.find(b => b._id === bookingId);
            setSelectedBooking(booking);
            setAdminNote(booking.adminNotes || '');
            setShowModal(true);
            return;
        }

        // For completed status, update directly
        try {
            await updateBookingStatus(bookingId, newStatus);
            setMessage(`Booking successfully marked as ${newStatus}`);
            fetchAllBookings(statusFilter);
        } catch (error) {
            setMessage(error.message || 'Failed to update booking status');
        }
    };

    const handleSubmitStatusChange = async () => {
        if (!selectedBooking) return;

        try {
            await updateBookingStatus(
                selectedBooking._id,
                selectedBooking.status === 'approved' ? 'rejected' : 'approved',
                adminNote
            );

            setMessage(`Booking ${selectedBooking.status === 'approved' ? 'rejected' : 'approved'} successfully`);
            setShowModal(false);
            setSelectedBooking(null);
            setAdminNote('');

            // Refresh bookings
            fetchAllBookings(statusFilter);
        } catch (error) {
            setMessage(error.message || 'Failed to update booking status');
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (!user || user.role !== 'admin') {
        return (
            <>
                <Navbar />
                <div className="container mx-auto px-4 pt-32 pb-16">
                    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
                        <p className="text-center text-red-600">You don't have permission to access this page.</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container mx-auto px-4 pt-32 pb-16">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

                        {/* Filter dropdown */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Bookings</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="completed">Completed</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <FilterIcon className="h-4 w-4" />
                            </div>
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

                    {loading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <>
                            {bookings.length === 0 ? (
                                <div className="bg-white shadow rounded-lg p-6">
                                    <p className="text-gray-500 text-center">No bookings found.</p>
                                </div>
                            ) : (
                                <div className="bg-white shadow overflow-hidden rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Customer
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Service
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Package
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Price
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {bookings.map((booking) => (
                                                <tr key={booking._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{booking.user?.name || 'N/A'}</div>
                                                                <div className="text-sm text-gray-500">{booking.user?.email || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{booking.serviceType}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{booking.packageType}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{formatDate(booking.date)}</div>
                                                        <div className="text-xs text-gray-500">Booked: {formatDate(booking.createdAt)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">₹{booking.price.toLocaleString()}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[booking.status]}`}>
                                                            {statusIcons[booking.status]}
                                                            <span className="ml-1 capitalize">{booking.status}</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        {booking.status === 'pending' && (
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleStatusChange(booking._id, 'approved')}
                                                                    className="text-green-600 hover:text-green-900"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(booking._id, 'rejected')}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}

                                                        {booking.status === 'approved' && (
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleStatusChange(booking._id, 'completed')}
                                                                    className="text-blue-600 hover:text-blue-900"
                                                                >
                                                                    Mark Completed
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(booking._id, 'rejected')}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}

                                                        {booking.status === 'rejected' && (
                                                            <button
                                                                onClick={() => handleStatusChange(booking._id, 'approved')}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}

                    {/* Status Change Modal */}
                    {showModal && selectedBooking && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                <h2 className="text-xl font-bold mb-4">
                                    {selectedBooking.status === 'approved'
                                        ? 'Reject Booking'
                                        : 'Approve Booking'
                                    }
                                </h2>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Add a note for the customer (optional)
                                    </label>
                                    <textarea
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="4"
                                        placeholder="E.g., reason for rejection or special instructions"
                                    ></textarea>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            setSelectedBooking(null);
                                        }}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmitStatusChange}
                                        className={`px-4 py-2 rounded text-white ${selectedBooking.status === 'approved'
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-green-600 hover:bg-green-700'
                                            }`}
                                    >
                                        {selectedBooking.status === 'approved'
                                            ? 'Confirm Rejection'
                                            : 'Confirm Approval'
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminDashboard; 