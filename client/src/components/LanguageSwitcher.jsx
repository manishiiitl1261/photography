"use client";

import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSwitcher = ({ variant = 'navbar' }) => {
    const { language, changeLanguage, t } = useLanguage();

    // Determine if we're using the dark (navbar) or light (page content) variant
    const isDark = variant === 'navbar';

    // Language flags and labels
    const languages = {
        en: {
            flag: "EN",
            label: "English"
        },
        hi: {
            flag: "🇮🇳",
            label: "हिंदी"
        }
    };

    // Get the next language (for toggling)
    const nextLanguage = language === 'en' ? 'hi' : 'en';

    // Style classes based on variant
    const buttonClasses = isDark
        ? "flex items-center space-x-2 rounded-md border border-white px-3 py-1.5 bg-transparent text-white text-sm font-medium hover:bg-white hover:text-black transition-all shadow-sm"
        : "flex items-center space-x-2 rounded-md border border-gray-300 px-3 py-1.5 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all shadow-sm";

    return (
        <div className="relative inline-block">
            <button
                type="button"
                className={buttonClasses}
                onClick={() => changeLanguage(nextLanguage)}
                aria-label={`Switch to ${languages[nextLanguage].label}`}
            >
                {/* <span className="text-base">{languages[language].flag === 'EN' ? 'ह' : 'EN'}</span> */}
                <span>{language === 'en' ? t.language.hindi : t.language.english}</span>
            </button>
        </div>
    );
};

export default LanguageSwitcher; 