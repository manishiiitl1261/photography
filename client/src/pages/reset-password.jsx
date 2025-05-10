"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const ResetPassword = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordFeedback, setPasswordFeedback] = useState('');
    const [tokenValid, setTokenValid] = useState(false);

    useEffect(() => {
        // Get token and email from URL
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token || !email) {
            setError('Invalid password reset link. Please request a new one.');
            return;
        }

        setToken(token);
        setEmail(email);

        // Validate token
        const validateToken = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/validate-reset-token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token, email }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || 'Invalid or expired password reset link. Please request a new one.');
                    setTokenValid(false);
                } else {
                    setTokenValid(true);
                }
            } catch (error) {
                setError('An error occurred while validating your reset link. Please try again.');
                setTokenValid(false);
            }
        };

        validateToken();
    }, [searchParams]);

    const validatePasswordStrength = (password) => {
        let strength = 0;
        let feedback = '';

        // Length check
        if (password.length >= 8) {
            strength += 1;
        } else {
            feedback = 'Password must be at least 8 characters';
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

        // Validate inputs
        if (!formData.password || !formData.confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (passwordStrength < 3) {
            setError(passwordFeedback || 'Password is too weak');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    token,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            // Password reset successful
            setMessage(data.message || 'Password reset successful! You can now log in with your new password.');

            // Clear form
            setFormData({
                password: '',
                confirmPassword: '',
            });

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/');
            }, 3000);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
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

    if (error && !tokenValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
                <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Reset Password</h1>

                    <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
                        <p>{error}</p>
                    </div>

                    <div className="text-center">
                        <Link href="/" className="text-blue-500 hover:text-blue-700">
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Reset Password</h1>

                {message && (
                    <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
                        <p>{message}</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            New Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your new password"
                            required
                        />
                        {renderPasswordStrengthBar()}
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <input
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                ? 'border-red-500'
                                : ''
                                }`}
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your new password"
                            required
                        />
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
                            type="submit"
                            disabled={loading || !tokenValid}
                        >
                            {loading ? 'Resetting Password...' : 'Reset Password'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6">
                    <Link href="/" className="text-blue-500 hover:text-blue-700">
                        Return to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword; 