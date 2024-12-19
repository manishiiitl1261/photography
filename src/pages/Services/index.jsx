import Footer from "@/pages/component/footer/Footer";
import Navbar from "@/pages/component/navbar/Navbar";
import ServiceCard from "@/pages/Services/ServiceCard";
import React from 'react'
import Price from "@/pages/Services/Price";
export default function index() {
    return (
        <div className="bg-slate-300">
            <Navbar />
            <main className="pt-16 gap-6 sm:gap-10 lg:gap-12 items-center">
                <ServiceCard />
                <Price />
            </main>
            <Footer />
        </div>
    )
}