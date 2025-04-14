"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const OTPVerificationForm = ({ email, onVerified, onBackToRegister, onResendOTP }) => {
    const { t } = useLanguage();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Create refs for each input
    const inputRefs = Array(6).fill().map(() => React.createRef());

    // Timer countdown
    useEffect(() => {
        if (timer > 0) {
            const timerId = setTimeout(() => setTimer(timer - 1), 1000);
            return () => clearTimeout(timerId);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    // Handle input change
    const handleChange = (index, value) => {
        if (value.length > 1) {
            // If user pastes multiple digits, distribute them
            const digits = value.split('').slice(0, 6);
            const newOtp = [...otp];

            digits.forEach((digit, i) => {
                if (index + i < 6) {
                    newOtp[index + i] = digit;
                }
            });

            setOtp(newOtp);

            // Focus on the last filled input or the next empty one
            const lastIndex = Math.min(index + digits.length, 5);
            inputRefs[lastIndex].current.focus();
        } else {
            // Normal single digit input
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Auto-focus next input
            if (value && index < 5) {
                inputRefs[index + 1].current.focus();
            }
        }
    };

    // Handle key press events
    const handleKeyDown = (index, e) => {
        // On backspace, clear current digit and move to previous input
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs[index - 1].current.focus();
            }
        }
    };

    // Handle verification
    const handleVerify = async () => {
        // Check if OTP is complete
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setError('Please enter the complete 6-digit verification code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    otp: otpValue
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Verification failed');
            }

            // Auto login the user after successful verification
            // Save user and token to localStorage
            if (data.user && data.token) {
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);

                // Call onVerified to close the modal and update the auth state
                onVerified(data);
            } else {
                // If for some reason we don't have the user data and token, 
                // just show a message that verification was successful
                onVerified({
                    success: true,
                    requiresLogin: true,
                    message: 'Email verified successfully! Please log in.'
                });
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle resend OTP
    const handleResend = async () => {
        if (!canResend) return;

        setLoading(true);
        setError('');

        try {
            const result = await onResendOTP(email);
            if (result && result.success) {
                // Reset timer and disable resend button
                setTimer(60);
                setCanResend(false);
                // Clear OTP fields
                setOtp(['', '', '', '', '', '']);
            } else {
                setError(result?.message || 'Failed to resend verification code');
            }
        } catch (error) {
            setError(error.message || 'Failed to resend verification code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Verify Your Email</h2>

            <p className="text-center text-gray-600 mb-6">
                We've sent a verification code to <br />
                <span className="font-medium text-gray-800">{email}</span>
            </p>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={inputRefs[index]}
                        type="text"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-12 text-center text-2xl font-bold border rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                    />
                ))}
            </div>

            <div className="flex flex-col items-center justify-center gap-4 mb-4">
                <button
                    onClick={handleVerify}
                    disabled={loading || otp.join('').length !== 6}
                    className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition"
                >
                    {loading ? 'Verifying...' : 'Verify Email'}
                </button>

                <div className="text-sm text-gray-600">
                    {canResend ? (
                        <button
                            onClick={handleResend}
                            disabled={loading}
                            className="text-blue-500 hover:underline"
                        >
                            Resend verification code
                        </button>
                    ) : (
                        <span>
                            Resend code in {timer} seconds
                        </span>
                    )}
                </div>

                <button
                    onClick={onBackToRegister}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                >
                    Use a different email
                </button>
            </div>
        </div>
    );
};

export default OTPVerificationForm; 