import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import Home from "@/components/ContactUs/Home";
export default function index() {
    return (
        <div className="bg-slate-300">
            <Navbar />
            <main className=" pt-14 sm:pt-24 gap-6 mb-12 sm:mb-20">
                <Home />
            </main>
            <Footer />
        </div>
    );
}
