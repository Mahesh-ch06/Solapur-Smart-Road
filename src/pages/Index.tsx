import HeroSection from '@/components/landing/HeroSection';
import LiveStats from '@/components/landing/LiveStats';
import HowItWorks from '@/components/landing/HowItWorks';
import Tutorial from '@/components/landing/Tutorial';
import Footer from '@/components/landing/Footer';
import ThemeToggle from '@/components/ThemeToggle';
import { AIChatbot } from '@/components/landing/AIChatbot';
import { LiveChatWidget } from '@/components/landing/LiveChatWidget';

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
      
      {/* AI Chatbot */}
      <AIChatbot />
      
      {/* Live Support Chat Widget */}
      <LiveChatWidget />
    </div>
  );
};

export default Index;
