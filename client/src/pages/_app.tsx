import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ReviewProvider } from "@/contexts/ReviewContext";
import { BookingProvider } from "@/contexts/BookingContext";
import AuthWrapper from "@/components/auth/AuthWrapper";
import { ErrorBoundary } from 'react-error-boundary';
import { useRouter } from 'next/router';
import React from 'react';

// Custom fallback component for error states
function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  const router = useRouter();

  const handleReset = () => {
    // Reset the error boundary and redirect to home
    resetErrorBoundary();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="mb-4 text-gray-700">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Go to Home Page
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <LanguageProvider>
        <AuthWrapper>
          <ReviewProvider>
            <BookingProvider>
              <Component {...pageProps} />
            </BookingProvider>
          </ReviewProvider>
        </AuthWrapper>
      </LanguageProvider>
    </ErrorBoundary>
  );
}