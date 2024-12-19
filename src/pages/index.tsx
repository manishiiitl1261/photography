import Footer from "@/pages/components/footer/Footer";
import Review from "@/pages/components/review/Review";
import Navbar from "@/pages/components/navbar/Navbar";
import Gallary from "@/pages/Portfolio/Gallary";
import HomeC from "@/pages/components/home/HomeC";
import { sliderContent } from "@/pages/components/home/HomeContent";
import Card from "@/pages/AboutUs/Card";
import ServiceCard from "@/pages/Services/ServiceCard";
export default function Home() {
  return (
    <div className="bg-slate-300">
      <Navbar />
      <main className="pt-16 gap-6">
        <HomeC sliderContent={sliderContent} />
        <Gallary />
        <ServiceCard />
        <Card />
        <Review />
      </main>
      <Footer />
    </div>
  );
}
