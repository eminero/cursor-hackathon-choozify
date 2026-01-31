import { MarketingNavbar } from './components/marketing-navbar';
import { PropertiesCarousel } from './components/properties-carousel';
import { HeroSection } from './components/hero-section';
import { FeaturesSection } from './components/features-section';
import { HowItWorksSection } from './components/how-it-works-section';
import { CTASection } from './components/cta-section';
import { Footer } from './components/footer';

export default function MarketingPage() {
  return (
    <div className="min-h-screen">
      <MarketingNavbar />
      <PropertiesCarousel />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}
