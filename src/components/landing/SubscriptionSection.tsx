import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Check, Star, Crown, Zap, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Basic',
    price: '2,000',
    period: 'month',
    description: 'Perfect for individuals',
    icon: Zap,
    features: [
      '20kg clothes per month',
      'Free pickup & delivery',
      '48-hour turnaround',
      'Basic loyalty points (1x)',
      'WhatsApp support',
    ],
    popular: false,
  },
  {
    name: 'Standard',
    price: '3,500',
    period: 'month',
    description: 'Great for families',
    icon: Star,
    features: [
      '40kg clothes per month',
      '2 duvets or blankets',
      'Free pickup & delivery',
      '24-hour express available',
      'Double loyalty points (2x)',
      'Priority support',
    ],
    popular: true,
  },
  {
    name: 'Premium',
    price: '5,000',
    period: 'month',
    description: 'Ultimate convenience',
    icon: Crown,
    features: [
      'Unlimited clothes',
      '4 duvets/blankets/carpets',
      'Free pickup & delivery',
      'Same-day express included',
      'Triple loyalty points (3x)',
      'Dedicated account manager',
      'Priority scheduling',
    ],
    popular: false,
  },
];

const SubscriptionSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 gradient-sky">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Gift className="w-4 h-4" />
            <span className="text-sm font-medium">Monthly Plans</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Save More with{' '}
            <span className="text-gradient">Subscriptions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Subscribe and enjoy hassle-free laundry every month with exclusive savings and perks.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                'relative p-8 rounded-2xl bg-card border transition-all duration-300 hover:shadow-strong animate-fade-in-up',
                plan.popular
                  ? 'border-primary shadow-medium scale-105 md:scale-110 z-10'
                  : 'border-border hover:border-primary/30'
              )}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-ocean text-primary-foreground text-sm font-semibold">
                  Most Popular
                </div>
              )}

              {/* Icon */}
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-6',
                plan.popular ? 'gradient-ocean' : 'bg-secondary'
              )}>
                <plan.icon className={cn(
                  'w-6 h-6',
                  plan.popular ? 'text-primary-foreground' : 'text-secondary-foreground'
                )} />
              </div>

              {/* Header */}
              <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-muted-foreground mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-foreground">KES {plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                      plan.popular ? 'gradient-ocean' : 'bg-primary/10'
                    )}>
                      <Check className={cn(
                        'w-3 h-3',
                        plan.popular ? 'text-primary-foreground' : 'text-primary'
                      )} />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={plan.popular ? 'hero' : 'outline'}
                className="w-full"
                onClick={() => navigate('/auth?mode=signup')}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>

        {/* Loyalty Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="p-8 md:p-12 rounded-2xl bg-card border border-border shadow-soft">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 rounded-2xl gradient-ocean flex items-center justify-center flex-shrink-0">
                <Gift className="w-12 h-12 text-primary-foreground" />
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Earn Loyalty Points on Every Order!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Earn 1 point for every KES 100 spent. Accumulate 100 points and redeem KES 100 off your next order. Subscribers earn 2x-3x points!
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                    100 points = KES 100 off
                  </span>
                  <span className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                    Birthday bonuses
                  </span>
                  <span className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                    Exclusive rewards
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionSection;
