import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import Gallary from "@/components/Portfolio/Gallary";
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