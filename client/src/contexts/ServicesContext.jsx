import React, { createContext, useContext, useState, useEffect } from "react";
import services from "@/components/Services/ServiceCardHelper";

// Create the services context
const ServicesContext = createContext();

// Base URL for the API
const API_URL = "http://localhost:5000/api/services";

// Provider component to wrap the application
export const ServicesProvider = ({ children }) => {
    const [serviceItems, setServiceItems] = useState(services);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch service items from the API
    const fetchServiceItems = async () => {
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
                setServiceItems(data.data);
            } else {
                // If no API data, fall back to local data
                console.log("No service items found in API, using local data");
                setServiceItems(services);
            }
        } catch (err) {
            console.error("Error fetching service items:", err);
            setError(err.message);
            // Fall back to local data on error
            setServiceItems(services);
        } finally {
            setLoading(false);
        }
    };

    // Add a new service item
    const addServiceItem = async (itemData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(itemData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Refresh the service items list
                await fetchServiceItems();
                return { success: true };
            } else {
                throw new Error(data.message || "Failed to add service item");
            }
        } catch (err) {
            console.error("Error adding service item:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Delete a service item
    const deleteServiceItem = async (itemId) => {
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
                // Refresh the service items list
                await fetchServiceItems();
                return { success: true };
            } else {
                throw new Error(data.message || "Failed to delete service item");
            }
        } catch (err) {
            console.error("Error deleting service item:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Update a service item
    const updateServiceItem = async (itemId, itemData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/${itemId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(itemData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Refresh the service items list
                await fetchServiceItems();
                return { success: true };
            } else {
                throw new Error(data.message || "Failed to update service item");
            }
        } catch (err) {
            console.error("Error updating service item:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Load service items when the component mounts
    useEffect(() => {
        fetchServiceItems();
    }, []);

    // Context value
    const value = {
        serviceItems,
        loading,
        error,
        addServiceItem,
        deleteServiceItem,
        updateServiceItem,
        fetchServiceItems,
    };

    return (
        <ServicesContext.Provider value={value}>
            {children}
        </ServicesContext.Provider>
    );
};

// Custom hook to use the services context
export const useServices = () => {
    const context = useContext(ServicesContext);
    if (context === undefined) {
        throw new Error("useServices must be used within a ServicesProvider");
    }
    return context;
};

export default ServicesContext;
