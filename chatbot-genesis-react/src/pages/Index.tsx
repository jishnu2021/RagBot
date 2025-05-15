
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Demo from "../components/Demo";
import Pricing from "../components/Pricing";
import CallToAction from "../components/CallToAction";
import Footer from "../components/Footer";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <HowItWorks />
        <Demo />
        <Pricing />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
