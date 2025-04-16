import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import Card from "@/components/AboutUs/Card";
import Member from "@/components/AboutUs/Member";
import { useLanguage } from "@/contexts/LanguageContext";

export default function index() {
    const { t } = useLanguage();

    return (
        <div className=" bg-purple-200">
            <Navbar />
            <main className="pt-16 gap-6">
                <Card />
                <Member />
            </main>
            <Footer />
        </div>
    );
}
