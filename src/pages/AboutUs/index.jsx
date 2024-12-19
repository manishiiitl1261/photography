import Footer from "@/pages/components/footer/Footer";
import Navbar from "@/pages/components/navbar/Navbar";
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
