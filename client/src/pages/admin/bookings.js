import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminNavbar from '@/components/admin/AdminNavbar';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminBookings() {
  const router = useRouter();
  const { adminBookings, adminLoading, adminError, fetchAllBookings, updateBookingStatus, setAdminBookings } = useBooking();
  const { user } = useAuth();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminChecking, setAdminChecking] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' }
  ];

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, redirecting to login page');
          router.push('/admin/login');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        // Validate admin status
        const response = await fetch(
          `${apiUrl}/api/admin/validate`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        const data = await response.json();

        if (!data.success || !data.isAdmin) {
          console.log('Not an admin, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          router.push('/admin/login');
        } else {
          setIsAuthenticated(true);
          setAdminChecking(false);
        }
      } catch (error) {
        console.error('Admin validation error:', error);
        router.push('/admin/login');
      }
    };

    checkAdminAuth();
  }, [router]);

  // Load bookings when component mounts or filter changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Admin authenticated, loading bookings...');
      // Admin auth is handled through email allowlist and OTP verification,
      // not through user.role property
      loadBookings();
    }
  }, [isAuthenticated, statusFilter]);

  const loadBookings = async () => {
    setMessage({ text: '', type: '' }); // Clear any previous messages
    
    try {
      console.log('Fetching all bookings with filter:', statusFilter);
      
      // Log admin status for debugging
      if (user) {
        console.log('Current user:', {
          email: user.email,
          role: user.role,
          isAdmin: process.env.NEXT_PUBLIC_ADMIN_EMAILS?.includes(user.email) || user.role === 'admin'
        });
      }
      
      // Attempt to fetch bookings
      const bookings = await fetchAllBookings(statusFilter);
      
      if (bookings && Array.isArray(bookings)) {
        console.log(`Successfully loaded ${bookings.length} bookings`);
        
        if (bookings.length === 0 && !statusFilter) {
          setMessage({ 
            text: 'No bookings found. You can use the debugging tools below to create test bookings.', 
            type: 'info' 
          });
        }
      } else {
        console.warn('Unexpected response format for bookings:', bookings);
        setMessage({ 
          text: 'Received unexpected data format from server.', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setMessage({ 
        text: `Failed to load bookings: ${error.message}`, 
        type: 'error' 
      });
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const openDetailsModal = (booking) => {
    setDetailsOpen(booking);
    setNoteContent(booking.adminNotes || '');
  };

  const closeDetailsModal = () => {
    setDetailsOpen(null);
    setNoteContent('');
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleNoteChange = (e) => {
    setNoteContent(e.target.value);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Update booking status with the admin notes
      const result = await updateBookingStatus(bookingId, newStatus, noteContent);
      
      if (result) {
        setSubmitSuccess(true);
        setMessage({ text: `Booking status updated to ${newStatus}`, type: 'success' });
        
        // Close modal after a brief delay
        setTimeout(() => {
          closeDetailsModal();
          // Refresh bookings list
          loadBookings();
        }, 1500);
      } else {
        setSubmitError('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      setSubmitError(error.message || 'An error occurred while updating the booking status');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return dateString;
    }
  };

  // Format date and time for display
  const formatDateTime = (dateString) => {
    try {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleString(undefined, options);
    } catch (error) {
      return dateString;
    }
  };

  if (adminChecking) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-gray-700">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login page
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Bookings Management | Admin Dashboard</title>
      </Head>
      
      <AdminNavbar />
      
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Bookings Management</h1>
            
            <div className="flex items-center">
              <label htmlFor="status-filter" className="mr-2 text-sm text-gray-700">
                Filter by Status:
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">All Bookings</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {message.text && (
            <div className={`p-4 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <p>{message.text}</p>
            </div>
          )}
          
          {adminLoading && (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-3 text-gray-700">Loading bookings...</p>
            </div>
          )}
          
          {adminError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p className="font-bold">Error loading bookings:</p>
              <p>{adminError}</p>
              <button 
                onClick={loadBookings}
                className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          )}
          
          {!adminLoading && adminBookings && adminBookings.length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <p className="text-gray-500">No bookings found with the selected filter.</p>
              <button 
                onClick={loadBookings}
                className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                Refresh Bookings
              </button>
            </div>
          )}
          
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Client Name</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Service</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Package</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {adminBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {booking.user?.name || 
                       (typeof booking.user === 'object' && booking.user?._id ? 
                         `User: ${booking.user._id.toString().substring(0, 8)}...` :
                         typeof booking.user === 'string' ? 
                         `User: ${booking.user.substring(0, 8)}...` : 
                         'Unknown User')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{booking.serviceType}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{booking.packageType}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(booking.date)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{booking.location}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        statusOptions.find(option => option.value === booking.status)?.color
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">₹{booking.price.toLocaleString()}</td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => openDetailsModal(booking)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Manage<span className="sr-only">, {booking._id}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Testing tools for development - can be removed in production */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 mt-10 border-t border-gray-200">
        <details className="cursor-pointer">
          <summary className="text-indigo-600 font-semibold text-sm mb-4">Debugging Tools</summary>
          <div className="p-4 bg-white rounded shadow">
            <h3 className="text-lg font-medium mb-2">Create Test Booking</h3>
            <div className="space-y-4">
              <button
                onClick={async () => {
                  if (window.confirm('Create a test booking?')) {
                    try {
                      setMessage({ text: 'Creating test booking...', type: 'info' });
                      
                      // Make direct API call to create a test booking
                      const token = localStorage.getItem('token');
                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/bookings`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          serviceType: 'Test Service',
                          packageType: 'Test Package',
                          date: new Date().toISOString().split('T')[0],
                          location: 'Test Location',
                          additionalRequirements: 'Created for testing',
                          price: 10000
                        })
                      });
                      
                      const data = await response.json();
                      
                      if (response.ok) {
                        setMessage({ text: 'Test booking created successfully!', type: 'success' });
                        // Refresh the bookings list
                        loadBookings();
                      } else {
                        setMessage({ text: `Failed to create test booking: ${data.message}`, type: 'error' });
                      }
                    } catch (error) {
                      console.error('Error creating test booking:', error);
                      setMessage({ text: `Error: ${error.message}`, type: 'error' });
                    }
                  }
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Create Test Booking
              </button>
              
              <button
                onClick={() => {
                  console.log('Current admin bookings state:', adminBookings);
                  console.log('Current user state:', user);
                  setMessage({ text: 'Check console for debug info', type: 'info' });
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-4"
              >
                Log Debug Info
              </button>
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Admin Authentication Check</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Logged in as: <span className="font-bold">{user?.email || 'unknown'}</span>
                </p>
                <button
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/validate`, {
                        headers: {
                          'Authorization': `Bearer ${token}`
                        }
                      });
                      
                      const data = await response.json();
                      console.log('Admin validation response:', data);
                      
                      if (data.success && data.isAdmin) {
                        setMessage({ text: 'Your account has admin privileges.', type: 'success' });
                      } else {
                        setMessage({ text: 'Your account does NOT have admin privileges!', type: 'error' });
                      }
                    } catch (error) {
                      console.error('Error checking admin status:', error);
                      setMessage({ text: `Error: ${error.message}`, type: 'error' });
                    }
                  }}
                  className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                >
                  Verify Admin Status
                </button>
                
                <div className="mt-4">
                  <button
                    onClick={async () => {
                      try {
                        setMessage({ text: 'Direct API call in progress...', type: 'info' });
                        
                        // Make direct API call to fetch all bookings
                        const token = localStorage.getItem('token');
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                        
                        console.log('Making direct API call to:', `${apiUrl}/api/bookings/admin/all`);
                        console.log('With token:', token ? token.substring(0, 20) + '...' : 'No token');
                        
                        const response = await fetch(`${apiUrl}/api/bookings/admin/all`, {
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        });
                        
                        // Log headers and status
                        console.log('Response status:', response.status);
                        console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
                        
                        const text = await response.text();
                        console.log('Raw response text:', text);
                        
                        try {
                          const data = JSON.parse(text);
                          console.log('Response data:', data);
                          
                          if (data.success) {
                            setMessage({ 
                              text: `Success! Found ${data.count} bookings. Check console for details.`, 
                              type: 'success' 
                            });
                            
                            // Update the state using proper React state setter
                            if (data.bookings && Array.isArray(data.bookings)) {
                              setMessage({ 
                                text: `Found ${data.bookings.length} bookings. Updating view...`, 
                                type: 'success' 
                              });
                              // Use the context's state setter
                              setAdminBookings(data.bookings);
                            }
                          } else {
                            setMessage({ 
                              text: `API returned success: false - ${data.message || 'Unknown error'}`, 
                              type: 'error' 
                            });
                          }
                        } catch (parseError) {
                          console.error('Failed to parse JSON response:', parseError);
                          setMessage({ 
                            text: 'Invalid JSON response from API. See console for details.', 
                            type: 'error' 
                          });
                        }
                      } catch (error) {
                        console.error('Direct API call error:', error);
                        setMessage({ 
                          text: `Error making direct API call: ${error.message}`, 
                          type: 'error' 
                        });
                      }
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Direct API Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Booking Details Modal */}
      {detailsOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Booking Details
                    </h3>
                    
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Client</p>
                          <p className="font-medium">
                            {detailsOpen.user?.name || 
                             (typeof detailsOpen.user === 'object' && detailsOpen.user?._id ? 
                               `User ID: ${detailsOpen.user._id.toString()}` :
                               typeof detailsOpen.user === 'string' ? 
                               `User ID: ${detailsOpen.user}` : 
                               'Unknown User')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {detailsOpen.user?.email || 
                             (typeof detailsOpen.user === 'object' ? 
                               'User reference present but email not available' : 
                               'User reference not populated')}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Service Type</p>
                          <p className="font-medium">{detailsOpen.serviceType}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Package</p>
                          <p className="font-medium">{detailsOpen.packageType}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-medium">₹{detailsOpen.price.toLocaleString()}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Event Date</p>
                          <p className="font-medium">{formatDate(detailsOpen.date)}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">{detailsOpen.location}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Booking Created</p>
                          <p className="font-medium">{formatDateTime(detailsOpen.createdAt)}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Current Status</p>
                          <p className="font-medium capitalize">{detailsOpen.status}</p>
                        </div>
                      </div>
                      
                      {detailsOpen.additionalRequirements && (
                        <div>
                          <p className="text-sm text-gray-500">Additional Requirements</p>
                          <p className="mt-1 text-sm text-gray-900 border p-2 rounded bg-gray-50">
                            {detailsOpen.additionalRequirements}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <label htmlFor="admin-notes" className="block text-sm font-medium text-gray-700">
                          Admin Notes
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="admin-notes"
                            name="admin-notes"
                            rows={3}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Add notes about this booking"
                            value={noteContent}
                            onChange={handleNoteChange}
                          />
                        </div>
                      </div>
                      
                      {submitError && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                          <p>{submitError}</p>
                        </div>
                      )}
                      
                      {submitSuccess && (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
                          <p>Booking status updated successfully!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <div className="flex space-x-2 w-full justify-between">
                  <div className="flex space-x-2">
                    {detailsOpen.status !== 'approved' && (
                      <button
                        type="button"
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        onClick={() => handleStatusChange(detailsOpen._id, 'approved')}
                        disabled={submitLoading}
                      >
                        {submitLoading ? 'Processing...' : 'Approve'}
                      </button>
                    )}
                    
                    {detailsOpen.status !== 'rejected' && (
                      <button
                        type="button"
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={() => handleStatusChange(detailsOpen._id, 'rejected')}
                        disabled={submitLoading}
                      >
                        {submitLoading ? 'Processing...' : 'Reject'}
                      </button>
                    )}
                    
                    {detailsOpen.status !== 'completed' && detailsOpen.status === 'approved' && (
                      <button
                        type="button"
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={() => handleStatusChange(detailsOpen._id, 'completed')}
                        disabled={submitLoading}
                      >
                        {submitLoading ? 'Processing...' : 'Mark Completed'}
                      </button>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={closeDetailsModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 