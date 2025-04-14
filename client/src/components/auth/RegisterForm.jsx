"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import OTPVerificationForm from './OTPVerificationForm';

const RegisterForm = ({ onClose, setShowRegister }) => {
    const { register, setUser } = useAuth();
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordFeedback, setPasswordFeedback] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');

    const validatePasswordStrength = (password) => {
        let strength = 0;
        let feedback = '';

        // Length check
        if (password.length >= 8) {
            strength += 1;
        } else {
            feedback = t.auth.passwordTooShort || 'Password must be at least 8 characters';
            return { strength, feedback };
        }

        // Check for uppercase
        if (/[A-Z]/.test(password)) {
            strength += 1;
        } else {
            feedback = 'Password must contain at least one uppercase letter';
            return { strength, feedback };
        }

        // Check for lowercase
        if (/[a-z]/.test(password)) {
            strength += 1;
        } else {
            feedback = 'Password must contain at least one lowercase letter';
            return { strength, feedback };
        }

        // Check for numbers
        if (/\d/.test(password)) {
            strength += 1;
        } else {
            feedback = 'Password must contain at least one number';
            return { strength, feedback };
        }

        // Check for special characters
        if (/[^A-Za-z0-9]/.test(password)) {
            strength += 1;
        } else {
            feedback = 'Adding special characters would make your password stronger';
        }

        // Give helpful feedback based on strength
        if (strength <= 2) {
            feedback = 'Weak password';
        } else if (strength <= 4) {
            feedback = 'Medium-strength password';
        } else {
            feedback = 'Strong password';
        }

        return { strength, feedback };
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Validate password strength when password changes
        if (name === 'password') {
            const { strength, feedback } = validatePasswordStrength(value);
            setPasswordStrength(strength);
            setPasswordFeedback(feedback);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        console.log('Registration attempt with data:', { ...formData, password: '[REDACTED]' });

        try {
            // Validate inputs
            if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
                throw new Error(t.auth.fillAllFields);
            }

            if (formData.password !== formData.confirmPassword) {
                throw new Error(t.auth.passwordsNotMatch);
            }

            if (passwordStrength < 3) {
                throw new Error(passwordFeedback || t.auth.passwordTooWeak);
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                throw new Error(t.auth.invalidEmail || 'Please enter a valid email address');
            }

            console.log('Calling register...');
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...userData } = formData;
            const result = await register(userData);

            // Check if email verification is required
            if (result && result.requiresVerification) {
                setRegisteredEmail(result.email);
                setShowVerification(true);
            } else {
                console.log('Registration successful!');
                onClose(); // Close modal on successful registration
            }
        } catch (error) {
            console.error('Registration error:', error);

            // Check if the error message indicates verification is needed
            if (error.message && error.message.includes('verification')) {
                setRegisteredEmail(formData.email);
                setShowVerification(true);
            } else {
                setError(error.message);
            }
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

        onClose(); // Close modal after successful verification
    };

    // Handle resend OTP
    const handleResendOTP = async (email) => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
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

    // Go back to registration form
    const handleBackToRegister = () => {
        setShowVerification(false);
        setRegisteredEmail('');
    };

    // Generate password strength bar
    const renderPasswordStrengthBar = () => {
        if (!formData.password) return null;

        const getColor = () => {
            if (passwordStrength <= 2) return 'bg-red-500';
            if (passwordStrength <= 4) return 'bg-yellow-500';
            return 'bg-green-500';
        };

        const getWidth = () => {
            return `${(passwordStrength / 5) * 100}%`;
        };

        return (
            <div className="mt-2 mb-4">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${getColor()} transition-all duration-300`}
                        style={{ width: getWidth() }}
                    ></div>
                </div>
                <p className="text-xs mt-1 text-gray-600">{passwordFeedback}</p>
            </div>
        );
    };

    // Show OTP verification form if needed
    if (showVerification) {
        return (
            <OTPVerificationForm
                email={registeredEmail}
                onVerified={handleVerificationSuccess}
                onBackToRegister={handleBackToRegister}
                onResendOTP={handleResendOTP}
            />
        );
    }

    return (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">{t.auth.register}</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        {t.auth.name}
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="name"
                        type="text"
                        placeholder={t.auth.namePlaceholder}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

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

                <div className="mb-4">
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
                    {renderPasswordStrengthBar()}
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                        {t.auth.confirmPassword}
                    </label>
                    <input
                        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? 'border-red-500'
                            : ''
                            }`}
                        id="confirmPassword"
                        type="password"
                        placeholder="********"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{t.auth.passwordsNotMatch}</p>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                        type="submit"
                        disabled={loading || passwordStrength < 3}
                    >
                        {loading ? t.auth.registering : t.auth.register}
                    </button>
                </div>
            </form>

            <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                    {t.auth.haveAccount}{' '}
                    <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => setShowRegister(false)}
                    >
                        {t.auth.login}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RegisterForm; 