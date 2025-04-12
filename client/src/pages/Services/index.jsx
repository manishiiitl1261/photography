import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import ServiceCard from "@/components/Services/ServiceCard";
import React from 'react'
import Price from "@/components/Services/Price";
import { useLanguage } from "@/contexts/LanguageContext";

export default function index() {
    const { t } = useLanguage();

    return (
        <div className="bg-purple-200">
            <Navbar />
            <main className="pt-16 gap-6 sm:gap-10 lg:gap-12 items-center">
                <ServiceCard />
                <Price />
            </main>
            <Footer />
        </div>
    )
}