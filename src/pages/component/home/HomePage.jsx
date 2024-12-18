import Footer from "@/pages/component/footer/Footer";
import Review from "@/pages/component/review/Review";
import Card from "@/pages/component/review/Card"
import CardSlider from "@/pages/component/review/CardSlider"
function HomePage() {
  return (
    <div className="bg-slate-300">
      <Review />
      {/* <Card /> */}
      {/* <CardSlider /> */}
      <Footer />
    </div>
  );
}

export default HomePage;