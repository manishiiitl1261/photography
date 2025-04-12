import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import Gallary from "@/components/Portfolio/Gallary";
import React from 'react';
import { useLanguage } from "@/contexts/LanguageContext";

export default function index() {
    const { t } = useLanguage();

    return (
        <div className="bg-purple-200">
            <Navbar />
            <main className="pt-16 gap-6">
                <Gallary />
            </main>
            <Footer />
        </div>
    )
}