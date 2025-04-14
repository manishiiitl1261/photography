"use client";

import React, { Component } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

/**
 * Custom error boundary that catches and displays auth errors
 */
class AuthErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Auth error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-lg font-medium text-red-600">Authentication Error</h3>
                    <p className="mt-2 text-sm text-red-500">
                        {this.state.error?.message || 'An error occurred during authentication'}
                    </p>
                    <button
                        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => this.setState({ hasError: false, error: null })}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Wraps authentication components with error handling
 * This component provides a consistent error boundary for all auth-related functions
 */
const AuthWrapper = ({ children }) => {
    return (
        <AuthErrorBoundary>
            <AuthProvider>
                {children}
            </AuthProvider>
        </AuthErrorBoundary>
    );
};

export default AuthWrapper; 