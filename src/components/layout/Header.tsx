import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, Droplets, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center shadow-soft group-hover:shadow-medium transition-shadow">
              <Droplets className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient">Bluetides</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <a href="#services" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              Services
            </a>
            <a href="#pricing" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              Pricing
            </a>
            <a href="#benefits" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              Benefits
            </a>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="w-4 h-4" />
                    {user?.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/schedule')}>
                    Schedule Pickup
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button variant="default" onClick={() => navigate('/auth?mode=signup')}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-foreground/80 hover:text-primary transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <a
                href="#services"
                className="text-foreground/80 hover:text-primary transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </a>
              <a
                href="#pricing"
                className="text-foreground/80 hover:text-primary transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#benefits"
                className="text-foreground/80 hover:text-primary transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Benefits
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                {isAuthenticated ? (
                  <>
                    <Button variant="outline" onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>
                      Dashboard
                    </Button>
                    <Button variant="destructive" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}>
                      Sign In
                    </Button>
                    <Button variant="default" onClick={() => { navigate('/auth?mode=signup'); setMobileMenuOpen(false); }}>
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
