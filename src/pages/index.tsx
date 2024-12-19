import Footer from "@/pages/component/footer/Footer";
import Review from "@/pages/component/review/Review";
import Navbar from "@/pages/component/navbar/Navbar";
import Gallary from "@/pages/Portfolio/Gallary";
import HomeC from "@/pages/component/home/HomeC";
import { sliderContent } from "@/pages/component/home/HomeContent";
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
