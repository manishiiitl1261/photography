import React, { createContext, useContext, useState, useEffect } from "react";

// Create the portfolio context
const PortfolioContext = createContext();

// Get API URL from environment or use default
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/portfolio`;

// Helper function to get the authentication token
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { "Authorization": `Bearer ${token}` } : {};
};

// Provider component to wrap the application
export const PortfolioProvider = ({ children }) => {
    const [portfolioItems, setPortfolioItems] = useState([]);
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

            if (data.success) {
                // Map the data to ensure id property exists for admin panel compatibility
                const formattedData = data.data.map(item => ({
                    ...item,
                    id: item._id // Ensure id property exists for compatibility
                }));
                setPortfolioItems(formattedData);
            } else {
                throw new Error(data.message || "Failed to fetch portfolio items");
            }
        } catch (err) {
            console.error("Error fetching portfolio items:", err);
            setError("Failed to load portfolio items. Please try again later.");
            setPortfolioItems([]); // Empty array instead of falling back to static data
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

            // Get auth headers
            const authHeaders = getAuthHeaders();

            // Check if we have a token
            if (!authHeaders.Authorization) {
                throw new Error("Authentication required. Please log in again.");
            }

            const response = await fetch(API_URL, {
                method: "POST",
                // Don't set Content-Type for FormData, browser will set it with boundary
                headers: isFormData ? authHeaders : {
                    "Content-Type": "application/json",
                    ...authHeaders
                },
                body: isFormData ? itemData : JSON.stringify(itemData),
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Authentication expired. Please log in again.");
                }
                throw new Error(`API error: ${response.status}. Please try again.`);
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

            // Get auth headers
            const authHeaders = getAuthHeaders();

            // Check if we have a token
            if (!authHeaders.Authorization) {
                throw new Error("Authentication required. Please log in again.");
            }

            const response = await fetch(`${API_URL}/${itemId}`, {
                method: "DELETE",
                headers: authHeaders,
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Authentication expired. Please log in again.");
                }
                throw new Error(`API error: ${response.status}. Please try again.`);
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

            // Get auth headers
            const authHeaders = getAuthHeaders();

            // Check if we have a token
            if (!authHeaders.Authorization) {
                throw new Error("Authentication required. Please log in again.");
            }

            const response = await fetch(`${API_URL}/${itemId}`, {
                method: "PUT",
                // Don't set Content-Type for FormData
                headers: isFormData ? authHeaders : {
                    "Content-Type": "application/json",
                    ...authHeaders
                },
                body: isFormData ? itemData : JSON.stringify(itemData),
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Authentication expired. Please log in again.");
                }
                throw new Error(`API error: ${response.status}. Please try again.`);
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
