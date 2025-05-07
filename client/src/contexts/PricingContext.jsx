import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuthHeaders, handleAuthError } from "../utils/authHelpers";
import { useLanguage } from "./LanguageContext";

// Create the pricing context
const PricingContext = createContext();

// Base URL for the API
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/pricing`;

// Provider component to wrap the application
export const PricingProvider = ({ children }) => {
    const [pricingPackages, setPricingPackages] = useState([]);
    const [weddingPackages, setWeddingPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { language } = useLanguage(); // Access current language

    // Fetch pricing packages from the API
    const fetchPricingPackages = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get all packages with language parameter
            const response = await fetch(`${API_URL}/packages/all?lang=${language}`);
            if (!response.ok) {
                handleAuthError(response);
            }

            const data = await response.json();

            if (data.success && data.data.length > 0) {
                // Use the API data
                setPricingPackages(data.data);
            } else {
                // If no API data, set empty array and show error
                setPricingPackages([]);
                setError("No pricing packages found in database. Please add packages from the admin panel or run the database seed script.");
            }

            // Also fetch wedding-specific packages with language parameter
            const weddingResponse = await fetch(`${API_URL}/packages/wedding?lang=${language}`);
            if (weddingResponse.ok) {
                const weddingData = await weddingResponse.json();
                if (weddingData.success && weddingData.data.length > 0) {
                    setWeddingPackages(weddingData.data);
                } else {
                    setWeddingPackages([]);
                }
            } else {
                setWeddingPackages([]);
            }
        } catch (err) {
            console.error("Error fetching pricing packages:", err);
            setError(err.message);
            // Set empty arrays on error
            setPricingPackages([]);
            setWeddingPackages([]);
        } finally {
            setLoading(false);
        }
    };

    // Add a new pricing package
    const addPricingPackage = async (packageData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/packages`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(packageData),
            });

            if (!response.ok) {
                handleAuthError(response);
            }

            const data = await response.json();

            if (data.success) {
                // Refresh the pricing packages list
                await fetchPricingPackages();
                return { success: true };
            } else {
                throw new Error(data.message || "Failed to add pricing package");
            }
        } catch (err) {
            console.error("Error adding pricing package:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Delete a pricing package
    const deletePricingPackage = async (packageId) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/packages/${packageId}`, {
                method: "DELETE",
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                handleAuthError(response);
            }

            const data = await response.json();

            if (data.success) {
                // Refresh the pricing packages list
                await fetchPricingPackages();
                return { success: true };
            } else {
                throw new Error(data.message || "Failed to delete pricing package");
            }
        } catch (err) {
            console.error("Error deleting pricing package:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Update a pricing package
    const updatePricingPackage = async (packageId, packageData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/packages/${packageId}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(packageData),
            });

            if (!response.ok) {
                handleAuthError(response);
            }

            const data = await response.json();

            if (data.success) {
                // Refresh the pricing packages list
                await fetchPricingPackages();
                return { success: true };
            } else {
                throw new Error(data.message || "Failed to update pricing package");
            }
        } catch (err) {
            console.error("Error updating pricing package:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Add wedding package
    const addWeddingPackage = async (packageData) => {
        try {
            setLoading(true);
            setError(null);

            // Add package type for wedding
            packageData.packageType = 'wedding';

            const response = await fetch(`${API_URL}/packages`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(packageData),
            });

            if (!response.ok) {
                handleAuthError(response);
            }

            const data = await response.json();

            if (data.success) {
                // Refresh the pricing packages list
                await fetchPricingPackages();
                return { success: true };
            } else {
                throw new Error(data.message || "Failed to add wedding package");
            }
        } catch (err) {
            console.error("Error adding wedding package:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Update wedding package
    const updateWeddingPackage = async (packageId, packageData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/packages/${packageId}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(packageData),
            });

            if (!response.ok) {
                handleAuthError(response);
            }

            const data = await response.json();

            if (data.success) {
                // Refresh the pricing packages list
                await fetchPricingPackages();
                return { success: true };
            } else {
                throw new Error(data.message || "Failed to update wedding package");
            }
        } catch (err) {
            console.error("Error updating wedding package:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Load pricing packages when the component mounts or language changes
    useEffect(() => {
        fetchPricingPackages();
    }, [language]); // Reload when language changes

    // Context value
    const value = {
        pricingPackages,
        weddingPackages,
        loading,
        error,
        addPricingPackage,
        deletePricingPackage,
        updatePricingPackage,
        fetchPricingPackages,
        addWeddingPackage,
        updateWeddingPackage
    };

    return (
        <PricingContext.Provider value={value}>
            {children}
        </PricingContext.Provider>
    );
};

// Custom hook to use the pricing context
export const usePricing = () => {
    const context = useContext(PricingContext);
    if (context === undefined) {
        throw new Error("usePricing must be used within a PricingProvider");
    }
    return context;
};

export default PricingContext;
