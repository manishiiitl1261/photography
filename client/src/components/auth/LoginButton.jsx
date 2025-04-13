"use client";

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import AuthModal from './AuthModal';

const LoginButton = () => {
    const { t } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            <button
                className="text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 font-semibold rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                onClick={openModal}
            >
                {t.auth.login}
            </button>

            <AuthModal isOpen={isModalOpen} onClose={closeModal} />
        </>
    );
};

export default LoginButton; 