import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, UserPlus, ArrowRight } from 'lucide-react';

const AuthSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return (
      <section className="py-8 border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-ocean flex items-center justify-center">
                <span className="text-primary-foreground font-bold">
                  {user?.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Welcome back, {user?.username}!</p>
                <p className="text-sm text-muted-foreground">
                  {user?.loyaltyPoints} loyalty points
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button onClick={() => navigate('/schedule')}>
                Schedule Pickup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 border-b border-border gradient-sky">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">New to Bluetides?</p>
            <p className="text-sm text-muted-foreground">
              Sign up now and get your first pickup scheduled in minutes!
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/auth')}>
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth?mode=signup')}>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthSection;
