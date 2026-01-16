import { Link } from 'react-router-dom';
import { MapPin, Shield, ArrowRight, AlertTriangle, Search, User } from 'lucide-react';
import logoIcon from '@/assets/roadrescue-logo.svg';

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] sm:min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563EB' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4 sm:mb-6 animate-fade-in">
            <img src={logoIcon} alt="Solapur Smart Road Fix" className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-lg" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 animate-fade-in">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Solapur Municipal Corporation Initiative</span>
            <span className="xs:hidden">SMC Initiative</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Solapur{' '}
            <span className="text-primary relative inline-block">
              Smart Road Fix
              <svg className="absolute -bottom-1 sm:-bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 8C50 3 100 2 150 5C200 8 250 4 298 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary/30" />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in px-4 sm:px-0" style={{ animationDelay: '0.2s' }}>
            Report road damage instantly. Track repairs in real-time. 
            Together, let's build safer roads for Solapur.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-6 animate-fade-in px-4 sm:px-0" style={{ animationDelay: '0.3s' }}>
            <Link to="/report" className="btn-hero-primary group w-full sm:w-auto text-base sm:text-lg">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              Report a Pothole
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link to="/admin" className="btn-hero-secondary w-full sm:w-auto text-base sm:text-lg">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              Official Login
            </Link>
          </div>

          {/* Track Report Links */}
          <div className="mb-8 sm:mb-12 animate-fade-in px-4 sm:px-0" style={{ animationDelay: '0.35s' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
              <Link
                to="/track"
                className="group flex items-center justify-between sm:justify-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 sm:py-4 text-sm sm:text-base font-semibold text-primary hover:bg-primary/10 transition"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Already reported? Track status</span>
                </div>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 opacity-70 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                to="/dashboard"
                className="group flex items-center justify-between sm:justify-center gap-3 rounded-2xl border border-border bg-card/80 px-4 py-3 sm:py-4 text-sm sm:text-base font-semibold text-foreground hover:border-primary/30 hover:bg-primary/5 transition"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>View my reports dashboard</span>
                </div>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 opacity-60 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>Live System</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              <span>GPS Enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              <span>Official Platform</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
