import React from 'react';
import { Truck, Clock, Shield, Leaf, Heart, Award } from 'lucide-react';

const benefits = [
  {
    icon: Truck,
    title: 'Free Pickup & Delivery',
    description: 'We come to your doorstep at no extra cost. Schedule at your convenience.',
  },
  {
    icon: Clock,
    title: 'Fast Turnaround',
    description: '24-48 hour standard service. Same-day express available for urgent needs.',
  },
  {
    icon: Shield,
    title: 'Garment Protection',
    description: 'Your items are insured. We handle everything with professional care.',
  },
  {
    icon: Leaf,
    title: 'Eco-Friendly Products',
    description: 'Gentle on fabrics, kind to the environment. We use biodegradable detergents.',
  },
  {
    icon: Heart,
    title: 'Personalized Care',
    description: 'Special instructions? No problem. We treat your items the way you want.',
  },
  {
    icon: Award,
    title: 'Quality Guaranteed',
    description: 'Not satisfied? We\'ll re-clean for free. Your happiness is our priority.',
  },
];

const BenefitsSection: React.FC = () => {
  return (
    <section id="benefits" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Why Choose{' '}
            <span className="text-gradient">Bluetides?</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We go above and beyond to make laundry day your best day.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-medium animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl gradient-ocean flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <benefit.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-16 p-8 md:p-12 rounded-2xl gradient-ocean text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Ready to Experience the Bluetides Difference?
          </h3>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers who have made laundry day stress-free.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="px-6 py-3 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <span className="text-2xl font-bold text-primary-foreground">5,000+</span>
              <p className="text-sm text-primary-foreground/70">Happy Customers</p>
            </div>
            <div className="px-6 py-3 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <span className="text-2xl font-bold text-primary-foreground">20,000+</span>
              <p className="text-sm text-primary-foreground/70">Orders Completed</p>
            </div>
            <div className="px-6 py-3 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <span className="text-2xl font-bold text-primary-foreground">4.9★</span>
              <p className="text-sm text-primary-foreground/70">Customer Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
