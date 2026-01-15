import HeroSection from '@/components/landing/HeroSection';
import LiveStats from '@/components/landing/LiveStats';
import HowItWorks from '@/components/landing/HowItWorks';
import Tutorial from '@/components/landing/Tutorial';
import Footer from '@/components/landing/Footer';
import ThemeToggle from '@/components/ThemeToggle';

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Fixed Theme Toggle - Always Visible */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      <HeroSection />
      <LiveStats />
      <Tutorial />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
