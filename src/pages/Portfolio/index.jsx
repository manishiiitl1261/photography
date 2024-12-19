import Footer from "@/pages/components/footer/Footer";
import Navbar from "@/pages/components/navbar/Navbar";
import Gallary from "@/pages/Portfolio/Gallary";
import React from 'react'
export default function index() {
    return (
        <div className="bg-slate-300">
            <Navbar />
            <main className="pt-16 gap-6">
                <Gallary />
            </main>
            <Footer />
        </div>
    )
}