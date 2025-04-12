"use client";

import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSwitcher = () => {
    const { language, changeLanguage, t } = useLanguage();

    return (
        <div className="relative inline-block text-left">
            <div>
                <button
                    type="button"
                    className="inline-flex justify-center items-center rounded-md border border-white px-3 py-1 bg-transparent text-white text-sm font-medium hover:bg-white hover:text-black transition-colors"
                    onClick={() => changeLanguage(language === 'en' ? 'hi' : 'en')}
                >
                    {language === 'en' ? t.language.hindi : t.language.english}
                </button>
            </div>
        </div>
    );
};

export default LanguageSwitcher; 