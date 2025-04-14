"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ErrorBoundary from '@/components/auth/ErrorBoundary';

const LoginPage = () => {
    const [showRegister, setShowRegister] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState('');
    const router = useRouter();
    const { user } = useAuth();

    // Get the redirect URL from query parameters
    useEffect(() => {
        // We can only access window object on the client side
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect');
            if (redirect) {
                setRedirectUrl(redirect);
            }
        }
    }, []);

    // If user is already logged in, redirect
    useEffect(() => {
        if (user) {
            if (redirectUrl) {
                router.push(redirectUrl);
            } else {
                router.push('/');
            }
        }
    }, [user, redirectUrl, router]);

    // Handle close of auth form (on successful login/registration)
    const handleClose = () => {
        if (redirectUrl) {
            router.push(redirectUrl);
        } else {
            router.push('/');
        }
    };

    return (
        <>
            <Navbar />
            <div className="pt-24 pb-16 min-h-screen bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-md mx-auto">
                        <h1 className="text-2xl font-bold text-center mb-6">
                            {redirectUrl ? `Login to continue to ${redirectUrl.replace('/', '')}` : 'Login to your account'}
                        </h1>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <ErrorBoundary>
                                {showRegister ? (
                                    <RegisterForm onClose={handleClose} setShowRegister={setShowRegister} />
                                ) : (
                                    <LoginForm onClose={handleClose} setShowRegister={setShowRegister} />
                                )}
                            </ErrorBoundary>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default LoginPage; 