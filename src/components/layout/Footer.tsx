import React from 'react';
import { Droplets, Phone, Instagram, Music2, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const whatsappNumbers = ['0725263396', '0759298247'];

  const openWhatsApp = (number: string) => {
    const formattedNumber = number.replace(/^0/, '254');
    window.open(`https://wa.me/${formattedNumber}?text=Hello! I'm interested in Bluetides Laundry services.`, '_blank');
  };

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center">
                <Droplets className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Bluetides Laundry</span>
            </div>
            <p className="text-primary-foreground/70 leading-relaxed">
              Fresh. Clean. Delivered Free. Premium laundry services with free pickup and delivery across Kenya.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a href="#services" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Our Services
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Pricing Plans
                </a>
              </li>
              <li>
                <Link to="/schedule" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Schedule Pickup
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Customer Support</h4>
            <ul className="space-y-3">
              {whatsappNumbers.map((number) => (
                <li key={number}>
                  <button
                    onClick={() => openWhatsApp(number)}
                    className="flex items-center gap-2 text-primary-foreground/70 hover:text-green-400 transition-colors group"
                  >
                    <Phone className="w-4 h-4 group-hover:animate-bounce-soft" />
                    <span>{number}</span>
                  </button>
                </li>
              ))}
              <li>
                <a
                  href="mailto:support@bluetideslaundry.com"
                  className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>support@bluetides.com</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/bluetideslaundry"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 transition-all hover:scale-110"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://tiktok.com/@bluetideslaundry"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center hover:bg-foreground/80 transition-all hover:scale-110"
              >
                <Music2 className="w-5 h-5" />
              </a>
              {whatsappNumbers.map((number, idx) => (
                <button
                  key={number}
                  onClick={() => openWhatsApp(number)}
                  className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center hover:bg-green-500 transition-all hover:scale-110"
                  title={`WhatsApp: ${number}`}
                >
                  <Phone className="w-5 h-5" />
                </button>
              ))}
            </div>
            <div className="mt-6 flex items-start gap-2 text-primary-foreground/70">
              <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
              <span className="text-sm">Serving all major cities in Kenya</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/50 text-sm">
            © {new Date().getFullYear()} Bluetides Laundry. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">
              ✓ Free Pickup
            </span>
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">
              ✓ Free Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
