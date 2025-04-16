import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import ServiceCard from "@/components/Services/ServiceCard";
import React from 'react'
import Price from "@/components/Services/Price";
import BookingForm from "@/components/booking/BookingForm";
import { useLanguage } from "@/contexts/LanguageContext";
import PricePackages from "@/components/Services/PricePackages";
export default function index() {
    const { t } = useLanguage();

    return (
        <div className="bg-purple-200">
            <Navbar />
            <main className="pt-16 gap-6 sm:gap-10 lg:gap-12 items-center">
                <ServiceCard />
                <PricePackages />
                <Price />
                <div id="booking-form-section" className="w-full py-12 px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto">
                        <h2 className="text-xl sm:text-3xl font-bold text-center mb-4 sm:mb-8 text-black">{t.services.servicesPage.bookSession}</h2>
                        <BookingForm />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}