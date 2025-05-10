"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import OTPVerificationForm from './OTPVerificationForm';

const LoginForm = ({ onClose, setShowRegister }) => {
    const { login, setUser } = useAuth();
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [debugInfo, setDebugInfo] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error when user starts typing again
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return; // Prevent multiple submissions

        setLoading(true);
        setError('');
        setDebugInfo('Attempting login...');

        // Validate inputs
        if (!formData.email || !formData.password) {
            setError(t.auth.fillAllFields || 'Please fill in all fields');
            setLoading(false);
            return;
        }

        // Basic email validation before even trying to log in
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError(t.auth.invalidEmail || 'Please enter a valid email address');
            setLoading(false);
            return;
        }

        setDebugInfo('Calling login function...');

        try {
            const result = await login(formData);

            // Check if login returned an error object instead of throwing
            if (result && !result.success && result.message) {
                setDebugInfo(`Login failed: ${result.message}`);
                setError(result.message);

                // Check if email verification is required
                if (result.requiresVerification) {
                    setVerificationEmail(formData.email);
                    setShowVerification(true);
                }
            } else if (result && result.success) {
                setDebugInfo('Login successful!');
                onClose(); // Close modal on successful login
            }
        } catch (error) {
            console.error('Login submission error:', error);
            setDebugInfo(`Error: ${error.message}`);
            setError(error.message || 'An error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP verification success
    const handleVerificationSuccess = (data) => {
        console.log('Email verification successful!', data);

        // If we received user data and token directly from verification
        if (data.user && data.token) {
            // The OTP component has already saved these to localStorage
            // Just update our auth context
            setUser?.(data.user);
        }

        onClose(); // Close modal or redirect via the onClose callback
    };

    // Handle resend OTP
    const handleResendOTP = async (email) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend verification code');
            }

            return data;
        } catch (error) {
            console.error('Error resending OTP:', error);
            throw error;
        }
    };

    // Go back to login form
    const handleBackToLogin = () => {
        setShowVerification(false);
        setVerificationEmail('');
    };

    // Handle forgot password request
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (forgotPasswordLoading) return;

        if (!forgotPasswordEmail) {
            setError('Please enter your email address');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(forgotPasswordEmail)) {
            setError('Please enter a valid email address');
            return;
        }

        setForgotPasswordLoading(true);
        setError('');
        setForgotPasswordMessage('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: forgotPasswordEmail }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to process request');
            }

            // Show success message
            setForgotPasswordMessage('If an account exists with this email, you will receive password reset instructions.');
            // Clear form after 3 seconds and go back to login
            setTimeout(() => {
                setShowForgotPassword(false);
                setForgotPasswordEmail('');
                setForgotPasswordMessage('');
            }, 5000);
        } catch (error) {
            // For security reasons, we don't want to reveal if an email exists or not
            // So we show a generic success message even if there's an error
            setForgotPasswordMessage('If an account exists with this email, you will receive password reset instructions.');
        } finally {
            setForgotPasswordLoading(false);
        }
    };

    // Handle toggling between login and forgot password forms
    const toggleForgotPassword = () => {
        setShowForgotPassword(!showForgotPassword);
        setError('');
        setForgotPasswordMessage('');
    };

    // Show OTP verification form if needed
    if (showVerification) {
        return (
            <OTPVerificationForm
                email={verificationEmail}
                onVerified={handleVerificationSuccess}
                onBackToRegister={handleBackToLogin}
                onResendOTP={handleResendOTP}
            />
        );
    }

    // Show forgot password form
    if (showForgotPassword) {
        return (
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Reset Password</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {forgotPasswordMessage && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                        {forgotPasswordMessage}
                    </div>
                )}

                <p className="text-gray-600 mb-4">
                    Enter your email address and we'll send you instructions to reset your password.
                </p>

                <form onSubmit={handleForgotPassword}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="forgotPasswordEmail">
                            Email Address
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="forgotPasswordEmail"
                            type="email"
                            placeholder="example@example.com"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                            disabled={forgotPasswordLoading}
                        >
                            {forgotPasswordLoading ? 'Sending...' : 'Reset Password'}
                        </button>

                        <button
                            type="button"
                            onClick={toggleForgotPassword}
                            className="text-blue-500 hover:text-blue-700 text-sm text-center"
                        >
                            Back to Login
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // Regular login form
    return (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{t.auth.login}</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {!error && debugInfo && process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md text-xs">
                    {debugInfo}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        {t.auth.email}
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="email"
                        type="email"
                        placeholder="example@example.com"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        {t.auth.password}
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="password"
                        type="password"
                        placeholder="********"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? t.auth.loggingIn : t.auth.login}
                    </button>
                    <button
                        type="button"
                        onClick={toggleForgotPassword}
                        className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                    >
                        {t.auth.forgotPassword || "Forgot Password?"}
                    </button>
                </div>
            </form>

            <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                    {t.auth.noAccount}{' '}
                    <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => setShowRegister(true)}
                    >
                        {t.auth.register}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginForm; 