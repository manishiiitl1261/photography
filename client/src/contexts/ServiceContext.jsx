import React, { createContext, useContext, useState, useEffect } from "react";
import servicesData from "@/components/Services/ServiceCardHelper";

// Create the service context
const ServiceContext = createContext();

// Base URL for the API
const API_URL = "http://localhost:5000/api/services";

// Provider component to wrap the application
export const ServiceProvider = ({ children }) => {
    const [services, setServices] = useState(servicesData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch services from the API
    const fetchServices = async () => {
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
                setServices(data.data);
            } else {
                // If no API data, fall back to local data
                console.log("No services found in API, using local data");
                setServices(servicesData);
            }
        } catch (err) {
            console.error("Error fetching services:", err);
            setError(err.message);
            // Fall back to local data on error
            setServices(servicesData);
        } finally {
            setLoading(false);
        }
    };

    // Add a new service
    const addService = async (serviceData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(serviceData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Refresh the services list
                await fetchServices();
                return { success: true };
            } else {
                throw new Error(data.message || "Failed to add service");
            }
        } catch (err) {
            console.error("Error adding service:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Update a service
    const updateService = async (serviceId, serviceData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/${serviceId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(serviceData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Refresh the services list
                await fetchServices();
                return { success: true };
            } else {
                throw new Error(data.message || "Failed to update service");
            }
        } catch (err) {
            console.error("Error updating service:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Delete a service
    const deleteService = async (serviceId) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/${serviceId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Refresh the services list
                await fetchServices();
                return { success: true };
            } else {
                throw new Error(data.message || "Failed to delete service");
            }
        } catch (err) {
            console.error("Error deleting service:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Update services order
    const updateOrder = async (orderData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/order`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ items: orderData }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Refresh the services list
                await fetchServices();
                return { success: true };
            } else {
                throw new Error(data.message || "Failed to update services order");
            }
        } catch (err) {
            console.error("Error updating services order:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Load services when the component mounts
    useEffect(() => {
        fetchServices();
    }, []);

    // Context value
    const value = {
        services,
        loading,
        error,
        fetchServices,
        addService,
        updateService,
        deleteService,
        updateOrder,
    };

    return (
        <ServiceContext.Provider value={value}>
            {children}
        </ServiceContext.Provider>
    );
};

// Custom hook to use the service context
export const useServices = () => {
    const context = useContext(ServiceContext);
    if (!context) {
        throw new Error("useServices must be used within a ServiceProvider");
    }
    return context;
}; 