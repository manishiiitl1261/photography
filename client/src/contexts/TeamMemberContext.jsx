import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import teamMembersData from '@/components/AboutUs/MembersHelper';

// Create context
const TeamMemberContext = createContext();

// Base URL for the API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const TeamMemberProvider = ({ children }) => {
    const [members, setMembers] = useState(teamMembersData); // Fallback to static data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(Date.now());

    // Fetch team members from the API
    const fetchMembers = useCallback(async (force = false) => {
        try {
            // Skip if already loading unless forced
            if (loading && !force) return;

            setLoading(true);
            setError(null);

            // Add timestamp to prevent caching
            const response = await fetch(`${API_URL}/api/team-members?t=${Date.now()}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch team members: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                setMembers(data.members);
                console.log('Successfully fetched team members:', data.members);
            } else {
                console.error('API Error:', data.message);
                setError(data.message || 'Failed to fetch team members');
            }
        } catch (err) {
            console.error('Error fetching team members:', err);
            setError(err.message || 'An error occurred while fetching team members');
        } finally {
            setLoading(false);
            setLastRefresh(Date.now());
        }
    }, [loading]);

    // Force refresh of data
    const forceRefresh = useCallback(() => {
        fetchMembers(true);
    }, [fetchMembers]);

    // Initial fetch on mount
    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    return (
        <TeamMemberContext.Provider
            value={{
                members,
                loading,
                error,
                lastRefresh,
                forceRefresh
            }}
        >
            {children}
        </TeamMemberContext.Provider>
    );
};

// Hook for using the context
export const useTeamMembers = () => {
    const context = useContext(TeamMemberContext);
    if (!context) {
        throw new Error('useTeamMembers must be used within a TeamMemberProvider');
    }
    return context;
};

export default TeamMemberContext; 