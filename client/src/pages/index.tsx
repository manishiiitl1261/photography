import Footer from "@/components/footer/Footer";
import Review from "@/components/review/Review";
import Navbar from "@/components/navbar/Navbar";
import Gallary from "@/components/Portfolio/Gallary";
import HomeC from "@/components/home/HomeC";
import { sliderContent } from "@/components/home/HomeContent";
// import Card from "@/components/AboutUs/Card";
// import ServiceCard from "@/components/Services/ServiceCard";
import PricePackages from "@/components/Services/PricePackages";
import Price from "@/components/Services/Price";
import BookingForm from "@/components/booking/BookingForm"; 
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  return (
    <div className="bg-purple-200">
      <Navbar />
      <main className="pt-16 gap-6">
        <HomeC sliderContent={sliderContent} />
        <Gallary />
        {/* <ServiceCard /> */}
                <PricePackages />
                <Price />
                <div id="booking-form-section" className="w-full py-12 px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto">
                        <h2 className="text-xl sm:text-3xl font-bold text-center mb-4 sm:mb-8 text-black">{t.services.servicesPage.bookSession}</h2>
                        <BookingForm />
                    </div>
                </div>
        {/* <Card /> */}
        <Review />
      </main>
      <Footer />
    </div>
  );
}
