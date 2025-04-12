"use client";

import { createContext, useState, useContext, useEffect } from 'react';
import translations from '@/translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [t, setT] = useState(translations.en);

    // Load language preference from localStorage on initial load
    useEffect(() => {
        const savedLanguage = localStorage.getItem('language') || 'en';
        setLanguage(savedLanguage);
        setT(translations[savedLanguage]);
    }, []);

    // Change language function
    const changeLanguage = (lang) => {
        setLanguage(lang);
        setT(translations[lang]);
        localStorage.setItem('language', lang);
    };

    const value = {
        language,
        t,
        changeLanguage,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export default LanguageContext; 