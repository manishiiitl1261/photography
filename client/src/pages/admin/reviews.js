import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { useAdminReviews } from '@/contexts/AdminReviewContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminReviews() {
  const router = useRouter();
  const { 
    reviews, 
    pendingReviews,
    loading, 
    error, 
    fetchAllReviews,
    updateReviewStatus,
    deleteReview,
    forceRefresh,
    lastRefresh,
    togglePolling,
    pollingEnabled
  } = useAdminReviews();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminChecking, setAdminChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState({});
  const [reviewActionInProgress, setReviewActionInProgress] = useState(false);
  const [refreshInProgress, setRefreshInProgress] = useState(false);

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

  // Effect to refresh reviews when the page loads or becomes visible
  useEffect(() => {
    if (isAuthenticated && !adminChecking) {
      handleManualRefresh();
    }
    
    // Also refresh when the page becomes visible again (tab switching)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && !refreshInProgress) {
        console.log('Page is now visible, refreshing reviews');
        handleManualRefresh();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, adminChecking]);

  // Handle error display
  useEffect(() => {
    if (error) {
      // Show rate limit errors in a more user-friendly way
      if (error.includes('Rate limited')) {
        toast.warning("Server is busy. Automatic updates paused temporarily.");
      } else {
        toast.error(error);
      }
    }
  }, [error]);

  const handleManualRefresh = async () => {
    if (refreshInProgress) return;
    
    try {
      setRefreshInProgress(true);
      await forceRefresh();
    } catch (err) {
      console.error("Error during manual refresh:", err);
    } finally {
      setRefreshInProgress(false);
    }
  };

  const handleTogglePolling = () => {
    togglePolling(!pollingEnabled);
    toast.info(pollingEnabled 
      ? "Automatic updates disabled. Use manual refresh." 
      : "Automatic updates enabled.");
  };

  const handleDelete = async (reviewId) => {
    if (reviewActionInProgress) return;
    
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        setDeleteLoading(true);
        setReviewActionInProgress(true);
        const result = await deleteReview(reviewId);
        
        if (result.success) {
          toast.success('Review deleted successfully');
        } else {
          // Handle rate limiting error specifically
          if (result.error && result.error.includes('Rate limited')) {
            toast.warning("Server is busy. Please try again in a moment.");
          } else {
            toast.error(result.error || 'Failed to delete the review');
          }
        }
      } catch (error) {
        console.error('Error deleting review:', error);
        toast.error('An error occurred while deleting the review');
      } finally {
        setDeleteLoading(false);
        setTimeout(() => setReviewActionInProgress(false), 1000);
      }
    }
  };

  const handleApprove = async (reviewId, approved) => {
    if (reviewActionInProgress || approveLoading[reviewId]) return;
    
    try {
      setApproveLoading(prev => ({ ...prev, [reviewId]: true }));
      setReviewActionInProgress(true);
      
      const result = await updateReviewStatus(reviewId, approved);
      
      if (result.success) {
        toast.success(`Review ${approved ? 'approved' : 'rejected'} successfully`);
      } else {
        // Handle rate limiting error specifically
        if (result.error && result.error.includes('Rate limited')) {
          toast.warning("Server is busy. Please try again in a moment.");
        } else {
          toast.error(result.error || `Failed to ${approved ? 'approve' : 'reject'} the review`);
        }
      }
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error(`An error occurred while ${approved ? 'approving' : 'rejecting'} the review`);
    } finally {
      setApproveLoading(prev => ({ ...prev, [reviewId]: false }));
      setTimeout(() => setReviewActionInProgress(false), 1000);
    }
  };

  const getApprovalStatus = (review) => {
    if (review.approved === true) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Approved</span>;
    } else if (review.approved === false) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Rejected</span>;
    } else {
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
    }
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const ratingValue = Number(rating);
    
    for (let i = 1; i <= 5; i++) {
      if (i <= ratingValue) {
        stars.push(
          <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }
    
    return <div className="flex">{stars}</div>;
  };

  // Get the reviews to display based on active tab
  const getFilteredReviews = () => {
    switch (activeTab) {
      case 'pending':
        return reviews.filter(review => review.approved === null);
      case 'approved':
        return reviews.filter(review => review.approved === true);
      case 'rejected':
        return reviews.filter(review => review.approved === false);
      default:
        return reviews;
    }
  };

  // Format the last refresh time
  const getLastRefreshTime = () => {
    const date = new Date(lastRefresh);
    return date.toLocaleTimeString();
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
        <title>Reviews Management | Admin Dashboard</title>
      </Head>
      
      <AdminNavbar />
      <ToastContainer position="top-right" autoClose={3000} />
      
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl font-semibold text-gray-900">Reviews Management</h1>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleTogglePolling}
                className={`${
                  pollingEnabled 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-500 hover:bg-gray-600'
                } text-white px-4 py-2 rounded text-sm`}
              >
                {pollingEnabled ? 'Auto Updates On' : 'Auto Updates Off'}
              </button>
              <button 
                onClick={handleManualRefresh}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm flex items-center"
                disabled={loading || refreshInProgress}
              >
                {(loading || refreshInProgress) ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Refreshing...
                  </span>
                ) : "Refresh Now"}
              </button>
            </div>
          </div>

          {/* Last refresh time */}
          <div className="mb-4 text-sm text-gray-500">
            Last updated: {getLastRefreshTime()}
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {['all', 'pending', 'approved', 'rejected'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                >
                  {tab}
                  {tab === 'pending' && pendingReviews.length > 0 && (
                    <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                      {pendingReviews.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          
          {loading && (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-3 text-gray-700">Loading reviews...</p>
            </div>
          )}
          
          {error && !error.includes('Rate limited') && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
          )}
          
          {!loading && !error && getFilteredReviews().length === 0 && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-10 text-center">
              <p className="text-gray-500">No reviews found in this category.</p>
            </div>
          )}
          
          {!loading && getFilteredReviews().length > 0 && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              {getFilteredReviews().map((review) => (
                <div key={review._id} className="border-t border-gray-200 p-6">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {review.userAvatar ? (
                          <img 
                            src={review.userAvatar.startsWith('http') ? review.userAvatar : `${process.env.NEXT_PUBLIC_API_URL}${review.userAvatar}`} 
                            alt={review.name} 
                            className="h-10 w-10 rounded-full mr-3"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/assets/avtar.png";
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <span className="text-gray-500 text-sm">{review.name ? review.name.charAt(0).toUpperCase() : '?'}</span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{review.name}</h3>
                          <div className="flex items-center">
                            {getRatingStars(review.rating)}
                            <span className="ml-2 text-sm text-gray-600">{review.event}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mt-2">{review.text}</p>
                      {review.eventImage && (
                        <div className="mt-4">
                          <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL}${review.eventImage}`} 
                            alt="Event" 
                            className="h-32 w-auto rounded-md"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="mt-4 text-sm text-gray-500">
                        Submitted: {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col mt-4 md:mt-0 md:ml-6 space-y-2">
                      <div className="mb-2">{getApprovalStatus(review)}</div>
                      <div className="flex space-x-2">
                        {review.approved !== true && (
                          <button
                            onClick={() => handleApprove(review._id, true)}
                            disabled={approveLoading[review._id] || reviewActionInProgress}
                            className={`${
                              approveLoading[review._id] 
                                ? 'bg-green-200 cursor-not-allowed' 
                                : 'bg-green-100 hover:bg-green-200'
                            } text-green-800 py-1 px-3 rounded text-sm flex items-center`}
                          >
                            {approveLoading[review._id] ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </>
                            ) : 'Approve'}
                          </button>
                        )}
                        {review.approved !== false && (
                          <button
                            onClick={() => handleApprove(review._id, false)}
                            disabled={approveLoading[review._id] || reviewActionInProgress}
                            className={`${
                              approveLoading[review._id] 
                                ? 'bg-red-200 cursor-not-allowed' 
                                : 'bg-red-100 hover:bg-red-200'
                            } text-red-800 py-1 px-3 rounded text-sm flex items-center`}
                          >
                            {approveLoading[review._id] ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </>
                            ) : 'Reject'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review._id)}
                          disabled={deleteLoading || reviewActionInProgress}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded text-sm"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 
 