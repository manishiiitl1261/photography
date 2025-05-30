"use client";

import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can log the error to an error reporting service
        console.error("Error caught by ErrorBoundary:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="p-4 bg-red-50 text-red-800 rounded-md">
                    <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
                    <p className="mb-2">Please try again or contact support if the problem persists.</p>
                    <details className="text-xs text-gray-600">
                        <summary>Error details (for developers)</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                            {this.state.error?.toString()}
                        </pre>
                    </details>
                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 