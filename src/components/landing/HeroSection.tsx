import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Sparkles, Truck, Clock } from 'lucide-react';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      
      {/* Animated bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 rounded-full bg-primary-foreground/10 animate-bubble"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Wave overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32">
        <svg viewBox="0 0 1440 120" className="w-full h-full" preserveAspectRatio="none">
          <path
            d="M0,64 C480,120 960,0 1440,64 L1440,120 L0,120 Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">Free Pickup & Delivery</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-primary-foreground mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Fresh. Clean.
            <br />
            <span className="relative">
              Delivered Free.
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-accent" viewBox="0 0 200 12" preserveAspectRatio="none">
                <path d="M0,6 Q50,0 100,6 T200,6" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-primary-foreground/80 mb-12 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Premium laundry services at your doorstep. We pick up, clean with care, and deliver fresh — all for free.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Button
              variant="glass"
              size="xl"
              onClick={() => navigate(isAuthenticated ? '/schedule' : '/auth?mode=signup')}
              className="group"
            >
              {isAuthenticated ? 'Schedule a Pickup' : 'Get Started Free'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            {!isAuthenticated && (
              <Button
                variant="heroOutline"
                size="xl"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Trust indicators */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {[
              { icon: Truck, label: 'Free Pickup & Delivery', sublabel: 'Always' },
              { icon: Clock, label: '24-48 Hour Turnaround', sublabel: 'Fast & Reliable' },
              { icon: Sparkles, label: 'Eco-Friendly Products', sublabel: 'Gentle Care' },
            ].map(({ icon: Icon, label, sublabel }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-primary-foreground">{label}</p>
                  <p className="text-sm text-primary-foreground/60">{sublabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
