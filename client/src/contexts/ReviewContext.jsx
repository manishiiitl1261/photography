import React, { createContext, useContext, useState, useEffect } from "react";
import cardData from "@/components/review/CardHelper";

// Create the review context
const ReviewContext = createContext();

// Base URL for the API
const API_URL = "http://localhost:5001/api/reviews";

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

    // Fetch reviews from the API
    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.data.length > 0) {
                // Combine with existing cardData for demo purposes
                // In a real app, you'd use only the API data
                const combinedReviews = [...data.data, ...cardData];
                setReviews(combinedReviews);

                // Calculate average rating
                const total = combinedReviews.reduce((sum, review) => {
                    // Ensure we're using a number value for rating
                    const ratingValue = review.rating ? Number(review.rating) : Number(review.stars) || 0;
                    return sum + ratingValue;
                }, 0);

                const average = (total / combinedReviews.length).toFixed(1);
                setAvgRating(average);

                // Set review count
                setReviewCount(combinedReviews.length);

                // Calculate rating distribution
                const distribution = [5, 4, 3, 2, 1].map(stars => {
                    const count = combinedReviews.filter(r => {
                        // Check both rating and stars fields
                        const reviewRating = r.rating !== undefined ? Number(r.rating) : Number(r.stars) || 0;
                        return reviewRating === stars;
                    }).length;

                    return {
                        stars,
                        percentage: Math.round((count / combinedReviews.length) * 100)
                    };
                });

                setRatingDistribution(distribution);
            }
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setError(err.message);
            // Use demo data if API fails
            setReviews(cardData);
        } finally {
            setLoading(false);
        }
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
                await fetchReviews();
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

    // Load reviews when the component mounts
    useEffect(() => {
        fetchReviews();
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