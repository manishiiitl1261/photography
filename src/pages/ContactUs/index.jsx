import Footer from "@/pages/component/footer/Footer";
import Navbar from "@/pages/component/navbar/Navbar";
import Home from "@/pages/ContactUs/Home";
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
