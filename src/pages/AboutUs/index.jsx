import Footer from "@/pages/component/footer/Footer";
import Review from "@/pages/component/review/Review";
import Navbar from "@/pages/component/navbar/Navbar";
import Card from "@/pages/AboutUs/Card";
import Member from "@/pages/AboutUs/Member";
export default function index() {
    return (
        <div className="bg-slate-300">
            <Navbar />
            <main className="pt-16 gap-6">
                <Card />
                <Member />
            </main>
            <Footer />
        </div>
    );
}
