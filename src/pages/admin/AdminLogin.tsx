import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // 🔐 If already logged in as admin, redirect
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;

      const userId = data.session.user.id;

      const { data: admin, error } = await supabase
        .from('washer_one')
        .select('role')
        .eq('id', userId)
        .single();

      if (!error && admin?.role === 'admin') {
        navigate('/bluetides/dashboard', { replace: true });
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1️⃣ Sign in via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        throw new Error('Invalid email or password');
      }

      // 2️⃣ Check admin role in washer_one
      const { data: admin, error: roleError } = await supabase
        .from('washer_one')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (roleError || !admin) {
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin account not found.');
      }

      if (admin.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Access denied. Insufficient privileges.');
      }

      // ✅ Success
      toast({
        title: 'Welcome, Admin 👑',
        description: 'You have successfully signed in.',
      });

      navigate('/bluetides/dashboard', { replace: true });
    } catch (err: any) {
      toast({
        title: 'Admin Login Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-strong p-8 animate-scale-in">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-xl gradient-ocean flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground text-center mb-2">
            Admin Portal
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Bluetides Laundry Management System
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@bluetides.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Access Admin Panel
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Secure admin access only. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
