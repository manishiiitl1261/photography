import React, { createContext, useContext, useState, useEffect } from "react";
import photos from "@/components/Portfolio/Photo";

// Create the portfolio context
const PortfolioContext = createContext();

// Base URL for the API
const API_URL = "http://localhost:5000/api/portfolio";

// Provider component to wrap the application
export const PortfolioProvider = ({ children }) => {
    const [portfolioItems, setPortfolioItems] = useState(photos);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch portfolio items from the API
    const fetchPortfolioItems = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.data.length > 0) {
                // Use the API data if available
                setPortfolioItems(data.data);
            } else {
                // If no API data, fall back to local data
                console.log("No portfolio items found in API, using local data");
                setPortfolioItems(photos);
            }
        } catch (err) {
            console.error("Error fetching portfolio items:", err);
            setError(err.message);
            // Fall back to local data on error
            setPortfolioItems(photos);
        } finally {
            setLoading(false);
        }
    };

    // Add a new portfolio item
    const addPortfolioItem = async (itemData) => {
        try {
            setLoading(true);
            setError(null);

            // Check if itemData is FormData (for file uploads)
            const isFormData = itemData instanceof FormData;

            const response = await fetch(API_URL, {
                method: "POST",
                // Don't set Content-Type for FormData, browser will set it with boundary
                headers: isFormData ? undefined : {
                    "Content-Type": "application/json",
                },
                body: isFormData ? itemData : JSON.stringify(itemData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Refresh the portfolio items list
                await fetchPortfolioItems();
                return { success: true };
            } else {
                throw new Error(data.message || "Failed to add portfolio item");
            }
        } catch (err) {
            console.error("Error adding portfolio item:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Delete a portfolio item
    const deletePortfolioItem = async (itemId) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/${itemId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Refresh the portfolio items list
                await fetchPortfolioItems();
                return { success: true };
            } else {
                throw new Error(data.message || "Failed to delete portfolio item");
            }
        } catch (err) {
            console.error("Error deleting portfolio item:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Update a portfolio item
    const updatePortfolioItem = async (itemId, itemData) => {
        try {
            setLoading(true);
            setError(null);

            // Check if itemData is FormData (for file uploads)
            const isFormData = itemData instanceof FormData;

            // If it's FormData, append the ID
            if (isFormData) {
                itemData.append('id', itemId);
            }

            const response = await fetch(`${API_URL}/${itemId}`, {
                method: "PUT",
                // Don't set Content-Type for FormData
                headers: isFormData ? undefined : {
                    "Content-Type": "application/json",
                },
                body: isFormData ? itemData : JSON.stringify(itemData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Refresh the portfolio items list
                await fetchPortfolioItems();
                return { success: true };
            } else {
                throw new Error(data.message || "Failed to update portfolio item");
            }
        } catch (err) {
            console.error("Error updating portfolio item:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Load portfolio items when the component mounts
    useEffect(() => {
        fetchPortfolioItems();
    }, []);

    // Context value
    const value = {
        portfolioItems,
        loading,
        error,
        addPortfolioItem,
        deletePortfolioItem,
        updatePortfolioItem,
        fetchPortfolioItems,
    };

    return (
        <PortfolioContext.Provider value={value}>
            {children}
        </PortfolioContext.Provider>
    );
};

// Custom hook to use the portfolio context
export const usePortfolio = () => {
    const context = useContext(PortfolioContext);
    if (context === undefined) {
        throw new Error("usePortfolio must be used within a PortfolioProvider");
    }
    return context;
};

export default PortfolioContext;
