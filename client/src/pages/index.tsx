import Footer from "@/components/footer/Footer";
import Review from "@/components/review/Review";
import Navbar from "@/components/navbar/Navbar";
import Gallary from "@/components/Portfolio/Gallary";
import HomeC from "@/components/home/HomeC";
import { sliderContent } from "@/components/home/HomeContent";
import Card from "@/components/AboutUs/Card";
import ServiceCard from "@/components/Services/ServiceCard";
export default function Home() {
  return (
    <div className="bg-purple-200">
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
