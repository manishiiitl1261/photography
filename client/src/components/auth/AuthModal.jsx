"use client";

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ErrorBoundary from './ErrorBoundary';

const AuthModal = ({ isOpen, onClose }) => {
    const [showRegister, setShowRegister] = useState(false);

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="relative z-50"
        >
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            {/* Full-screen container to center the panel */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-md rounded-xl bg-white">
                    {/* Close button */}
                    <button
                        type="button"
                        className="absolute top-2 right-2 p-2 rounded-full text-gray-500 hover:bg-gray-100"
                        onClick={onClose}
                    >
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>

                    <div className="p-6">
                        <ErrorBoundary>
                            {showRegister ? (
                                <RegisterForm onClose={onClose} setShowRegister={setShowRegister} />
                            ) : (
                                <LoginForm onClose={onClose} setShowRegister={setShowRegister} />
                            )}
                        </ErrorBoundary>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default AuthModal;