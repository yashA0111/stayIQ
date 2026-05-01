import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import ArchitectureSection from "@/components/landing/ArchitectureSection";
import MLSection from "@/components/landing/MLSection";
import DatabaseSection from "@/components/landing/DatabaseSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <div className="section-glow" />
      <ProblemSection />
      <div className="section-glow" />
      <SolutionSection />
      <div className="section-glow" />
      <ArchitectureSection />
      <div className="section-glow" />
      <MLSection />
      <div className="section-glow" />
      <DatabaseSection />
      <div className="section-glow" />
      <CTASection />
      <Footer />
    </main>
  );
}
