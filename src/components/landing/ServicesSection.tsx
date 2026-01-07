import React from 'react';
import { Shirt, BedDouble, Square, Footprints, RectangleHorizontal, Sparkles } from 'lucide-react';

const services = [
  {
    icon: Shirt,
    title: 'Clothes',
    description: 'Regular wash, dry cleaning, and ironing for all fabrics',
    price: 'From KES 100/kg',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: BedDouble,
    title: 'Duvets & Comforters',
    description: 'Deep cleaning for fluffy, fresh bedding',
    price: 'From KES 800',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Square,
    title: 'Blankets',
    description: 'Gentle care for wool, fleece, and cotton blankets',
    price: 'From KES 300',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: RectangleHorizontal,
    title: 'Carpets & Rugs',
    description: 'Professional deep cleaning and stain removal',
    price: 'From KES 750/sqm',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: RectangleHorizontal,
    title: 'Mats',
    description: 'Door mats, bath mats, and kitchen mats',
    price: 'From KES 200',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    icon: Footprints,
    title: 'Shoes',
    description: 'Sneaker cleaning, leather care, and restoration',
    price: 'From KES 150/pair',
    color: 'from-indigo-500 to-purple-500',
  },
];

const ServicesSection: React.FC = () => {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Our Services</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Professional Care for{' '}
            <span className="text-gradient">Everything</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From everyday clothes to delicate fabrics, we handle it all with expert care and eco-friendly products.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-medium overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-3">{service.title}</h3>
              <p className="text-muted-foreground mb-4">{service.description}</p>
              
              {/* Price */}
              <p className="text-sm font-semibold text-primary">{service.price}</p>
            </div>
          ))}
        </div>

        {/* Free delivery banner */}
        <div className="mt-16 p-8 rounded-2xl gradient-ocean text-center">
          <h3 className="text-2xl font-bold text-primary-foreground mb-2">
            🚚 Free Pickup & Delivery on All Orders!
          </h3>
          <p className="text-primary-foreground/80">
            No minimum order required. We come to you, always free.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
