import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useReviews } from './ReviewContext'; // Import the public reviews context

// Create the admin review context
const AdminReviewContext = createContext();

// Base URL for the API
const API_URL = "http://localhost:5000/api/reviews";

// Provider component to wrap the admin pages
export const AdminReviewProvider = ({ children }) => {
    const [reviews, setReviews] = useState([]);
    const [pendingReviews, setPendingReviews] = useState([]);
    const [approvedReviews, setApprovedReviews] = useState([]);
    const [rejectedReviews, setRejectedReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(Date.now());
    const [pollingEnabled, setPollingEnabled] = useState(true);
    const consecutiveErrorsRef = useRef(0);
    const pollingIntervalRef = useRef(null);

    // Get the forceRefresh function from the public reviews context if available
    let publicReviewsContext = null;
    try {
        publicReviewsContext = useReviews();
    } catch (err) {
        // Public review context might not be available, and that's OK
        console.log("Public review context not available in AdminReviewProvider");
    }

    // Fetch all reviews for admin
    const fetchAllReviews = useCallback(async (force = false) => {
        try {
            // Skip if already loading unless forced
            if (loading && !force) return;

            setLoading(true);
            setError(null);

            // Get token from localStorage
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error("No authentication token found");
            }

            // Fetch all reviews with cache-busting parameter
            const response = await fetch(`${API_URL}?t=${Date.now()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // If rate limited, increase backoff time
                if (response.status === 429) {
                    consecutiveErrorsRef.current += 1;
                    throw new Error(`Rate limited (429): Too many requests. Will retry later.`);
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Reset consecutive errors on success
            consecutiveErrorsRef.current = 0;

            const data = await response.json();

            if (data.success) {
                setReviews(data.data);

                // Categorize reviews
                setPendingReviews(data.data.filter(review => review.approved === null));
                setApprovedReviews(data.data.filter(review => review.approved === true));
                setRejectedReviews(data.data.filter(review => review.approved === false));
            } else {
                throw new Error(data.message || "Failed to fetch reviews");
            }
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setError(err.message);

            // Don't clear reviews data on rate limit
            if (err.message.includes('Rate limited')) {
                console.log(`Admin context backing off due to rate limit. Consecutive errors: ${consecutiveErrorsRef.current}`);
            }
        } finally {
            setLoading(false);
            setLastRefresh(Date.now());
        }
    }, [loading]);

    // Force refresh function that can be called manually
    const forceRefresh = () => {
        console.log("Forcing refresh of admin reviews");
        fetchAllReviews(true);
    };

    // Toggle polling on/off
    const togglePolling = (enabled) => {
        setPollingEnabled(enabled);

        // Also toggle polling in the public context if available
        if (publicReviewsContext && publicReviewsContext.togglePolling) {
            publicReviewsContext.togglePolling(enabled);
        }
    };

    // Approve or reject a review
    const updateReviewStatus = async (reviewId, approved) => {
        try {
            setLoading(true);
            setError(null);

            // Get token from localStorage
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await fetch(`${API_URL}/${reviewId}/approve`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ approved })
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error(`Rate limited (429): Too many requests. Please try again later.`);
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Refresh reviews after approval/rejection
                await fetchAllReviews(true);

                // Also refresh the public reviews if context is available
                if (publicReviewsContext && publicReviewsContext.forceRefresh) {
                    console.log("Triggering refresh of public reviews after status update");
                    setTimeout(() => publicReviewsContext.forceRefresh(), 1000);
                }

                return { success: true };
            } else {
                throw new Error(data.message || "Failed to update review status");
            }
        } catch (err) {
            console.error("Error updating review status:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Delete a review
    const deleteReview = async (reviewId) => {
        try {
            setLoading(true);
            setError(null);

            // Get token from localStorage
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await fetch(`${API_URL}/${reviewId}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error(`Rate limited (429): Too many requests. Please try again later.`);
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Refresh reviews after deletion
                await fetchAllReviews(true);

                // Also refresh the public reviews if context is available
                if (publicReviewsContext && publicReviewsContext.forceRefresh) {
                    console.log("Triggering refresh of public reviews after deletion");
                    setTimeout(() => publicReviewsContext.forceRefresh(), 1000);
                }

                return { success: true };
            } else {
                throw new Error(data.message || "Failed to delete review");
            }
        } catch (err) {
            console.error("Error deleting review:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Setup and cleanup the polling interval with backoff
    useEffect(() => {
        // Only run if polling is enabled
        if (!pollingEnabled) {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
            return;
        }

        const setupPolling = () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }

            // Calculate backoff time based on consecutive errors (min 2 minutes, max 10 minutes)
            // Exponential backoff: 2^n minutes but capped at 10 minutes
            const backoffMinutes = Math.min(10, Math.pow(2, consecutiveErrorsRef.current));
            const pollingTime = consecutiveErrorsRef.current > 0
                ? backoffMinutes * 60 * 1000  // Convert minutes to ms
                : 5 * 60 * 1000;             // Default: 5 minutes (longer than public context)

            console.log(`Setting up admin polling interval: ${pollingTime / 1000} seconds`);

            pollingIntervalRef.current = setInterval(() => {
                console.log("Polling for updated admin reviews");
                fetchAllReviews();
            }, pollingTime);
        };

        // Initial setup
        setupPolling();

        // Re-setup when consecutive errors change
        const errorWatcher = consecutiveErrorsRef.current;

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [fetchAllReviews, pollingEnabled, consecutiveErrorsRef.current]);

    // Initial data fetch
    useEffect(() => {
        fetchAllReviews(true);
    }, []);

    // Context value
    const value = {
        reviews,
        pendingReviews,
        approvedReviews,
        rejectedReviews,
        loading,
        error,
        fetchAllReviews,
        updateReviewStatus,
        deleteReview,
        forceRefresh,
        lastRefresh,
        togglePolling,
        pollingEnabled
    };

    return (
        <AdminReviewContext.Provider value={value}>
            {children}
        </AdminReviewContext.Provider>
    );
};

// Custom hook to use the admin review context
export const useAdminReviews = () => {
    const context = useContext(AdminReviewContext);
    if (!context) {
        throw new Error("useAdminReviews must be used within an AdminReviewProvider");
    }
    return context;
};

export default AdminReviewContext; 