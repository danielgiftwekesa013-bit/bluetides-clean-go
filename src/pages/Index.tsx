import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/landing/HeroSection';
import AuthSection from '@/components/landing/AuthSection';
import ServicesSection from '@/components/landing/ServicesSection';
import SubscriptionSection from '@/components/landing/SubscriptionSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import FAQChatbot from '@/components/chatbot/FAQChatbot';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <AuthSection />
        <ServicesSection />
        <SubscriptionSection />
        <BenefitsSection />
      </main>
      <Footer />
      <FAQChatbot />
    </div>
  );
};

export default Index;
