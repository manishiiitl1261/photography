import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import cardData from "@/components/review/CardHelper";

// Create the review context
const ReviewContext = createContext();

// Base URL for the API
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/reviews`;

// Provider component to wrap the application
export const ReviewProvider = ({ children }) => {
    const [reviews, setReviews] = useState(cardData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [avgRating, setAvgRating] = useState(4.0);
    const [reviewCount, setReviewCount] = useState(47599);
    const [ratingDistribution, setRatingDistribution] = useState([
        { stars: 5, percentage: 70 },
        { stars: 4, percentage: 15 },
        { stars: 3, percentage: 10 },
        { stars: 2, percentage: 3 },
        { stars: 1, percentage: 2 },
    ]);
    const [lastRefresh, setLastRefresh] = useState(Date.now());
    const [pollingEnabled, setPollingEnabled] = useState(true);
    const consecutiveErrorsRef = useRef(0);
    const pollingIntervalRef = useRef(null);

    // Fetch reviews from the API
    const fetchReviews = useCallback(async (force = false) => {
        try {
            // Skip if already loading unless forced
            if (loading && !force) return;

            setLoading(true);
            setError(null);

            // Use the /approved endpoint to only get approved reviews for the public site
            const response = await fetch(`${API_URL}/approved?t=${Date.now()}`);

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

            if (data.success && data.data.length > 0) {
                // Use only the API data instead of combining with demo data
                const apiReviews = data.data;

                setReviews(apiReviews);

                // Calculate average rating
                const total = apiReviews.reduce((sum, review) => {
                    // Ensure we're using a number value for rating
                    const ratingValue = review.rating ? Number(review.rating) : Number(review.stars) || 0;
                    return sum + ratingValue;
                }, 0);

                const average = (total / apiReviews.length).toFixed(1);
                setAvgRating(average);

                // Set review count
                setReviewCount(apiReviews.length);

                // Calculate rating distribution
                const distribution = [5, 4, 3, 2, 1].map(stars => {
                    const count = apiReviews.filter(r => {
                        // Check both rating and stars fields
                        const reviewRating = r.rating !== undefined ? Number(r.rating) : Number(r.stars) || 0;
                        return reviewRating === stars;
                    }).length;

                    return {
                        stars,
                        percentage: Math.round((count / apiReviews.length) * 100)
                    };
                });

                setRatingDistribution(distribution);
            } else {
                // If no API data, use an empty array (don't use cardData)
                setReviews([]);
                setAvgRating(0);
                setReviewCount(0);
                setRatingDistribution([
                    { stars: 5, percentage: 0 },
                    { stars: 4, percentage: 0 },
                    { stars: 3, percentage: 0 },
                    { stars: 2, percentage: 0 },
                    { stars: 1, percentage: 0 }
                ]);
            }
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setError(err.message);

            // Don't use demo data on error, use empty array instead
            if (err.message.includes('Rate limited')) {
                // Don't change reviews data on rate limit, just show error
                console.log(`Backing off due to rate limit. Consecutive errors: ${consecutiveErrorsRef.current}`);
            } else {
                setReviews([]);
                setAvgRating(0);
                setReviewCount(0);
                setRatingDistribution([
                    { stars: 5, percentage: 0 },
                    { stars: 4, percentage: 0 },
                    { stars: 3, percentage: 0 },
                    { stars: 2, percentage: 0 },
                    { stars: 1, percentage: 0 }
                ]);
            }
        } finally {
            setLoading(false);
            setLastRefresh(Date.now());
        }
    }, [loading]);

    // Force refresh function that can be called manually
    const forceRefresh = () => {
        console.log("Forcing refresh of reviews");
        fetchReviews(true);
    };

    // Toggle polling on/off
    const togglePolling = (enabled) => {
        setPollingEnabled(enabled);
    };

    // Add a new review
    const addReview = async (reviewData) => {
        try {
            setLoading(true);
            setError(null);

            // Check if reviewData is FormData (for file uploads)
            const isFormData = reviewData instanceof FormData;

            const response = await fetch(API_URL, {
                method: "POST",
                // Don't set Content-Type for FormData, browser will set it with boundary
                headers: isFormData ? undefined : {
                    "Content-Type": "application/json",
                },
                body: isFormData ? reviewData : JSON.stringify({
                    ...reviewData,
                    text: reviewData.comment,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Refresh the reviews list
                await fetchReviews(true);
                return { success: true };
            } else {
                throw new Error(data.message || "Failed to add review");
            }
        } catch (err) {
            console.error("Error adding review:", err);
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
                : 3 * 60 * 1000;             // Default: 3 minutes

            console.log(`Setting up polling interval: ${pollingTime / 1000} seconds`);

            pollingIntervalRef.current = setInterval(() => {
                console.log("Polling for updated reviews");
                fetchReviews();
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
    }, [fetchReviews, pollingEnabled, consecutiveErrorsRef.current]);

    // Initial data fetch
    useEffect(() => {
        fetchReviews(true);
    }, []);

    // Context value
    const value = {
        reviews,
        loading,
        error,
        avgRating,
        reviewCount,
        ratingDistribution,
        addReview,
        fetchReviews,
        forceRefresh,
        lastRefresh,
        togglePolling,
        pollingEnabled
    };

    return (
        <ReviewContext.Provider value={value}>
            {children}
        </ReviewContext.Provider>
    );
};

// Custom hook to use the review context
export const useReviews = () => {
    const context = useContext(ReviewContext);
    if (context === undefined) {
        throw new Error("useReviews must be used within a ReviewProvider");
    }
    return context;
};

export default ReviewContext;