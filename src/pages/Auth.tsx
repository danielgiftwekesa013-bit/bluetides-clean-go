import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Droplets, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(4),
  phone: z.string().min(6),
  location: z.string().min(2),
  referralCode: z.string().optional(),
});

const Auth: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    try {
      if (isSignUp) {
        signupSchema.parse({
          fullName,
          email,
          password,
          phone,
          location,
          referralCode,
        });
      } else {
        loginSchema.parse({ email, password });
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      /* =========================
         SIGN UP
      ========================== */
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });

        if (error || !data.user) {
          throw new Error(error?.message || 'Signup failed');
        }

        const userId = data.user.id;

        // 🔎 Find inviter if referral code was entered
        let referredByUserId: string | null = null;

        if (referralCode) {
          const { data: inviter } = await supabase
            .from('users')
            .select('id')
            .eq('referral_code', referralCode)
            .single();

          if (inviter) {
            referredByUserId = inviter.id;
          }
        }

        // 👤 Create user profile (FIXED)
        const { error: insertError } = await supabase.from('users').insert({
          id: userId, // ✅ REQUIRED
          full_name: fullName,
          email,
          phone,
          location,
          referral_code: crypto.randomUUID().slice(0, 8),
          inviter_code: referralCode || null, // ✅ save entered code
          referred_by: referredByUserId,
        });

        if (insertError) throw insertError;

        // 🔗 Create referral record
        if (referredByUserId) {
          await supabase.from('referrals').insert({
            referrer_id: referredByUserId,
            referred_user_id: userId,
          });
        }

        toast({
          title: 'Confirm your email 📧',
          description:
            'We sent a confirmation link to your email. Please verify your account, then sign in.',
        });

        return;
      }

      /* =========================
         LOGIN
      ========================== */
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Welcome back 👋',
        description: 'Signed in successfully.',
      });

      navigate('/dashboard');
    } catch (err: any) {
      toast({
        title: 'Authentication error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-6 text-primary-foreground/80"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <div className="bg-card rounded-2xl shadow-strong p-8">
          <div className="flex justify-center mb-6 gap-2 items-center">
            <Droplets className="w-7 h-7 text-primary" />
            <span className="text-2xl font-bold">Bluetides</span>
          </div>

          <h1 className="text-xl font-bold text-center mb-6">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <Input
                  placeholder="Full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />

                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />

                <Input
                  placeholder="Phone number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />

                <Input
                  placeholder="Location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />

                <Input
                  placeholder="Referral code (optional)"
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value)}
                />
              </>
            )}

            {!isSignUp && (
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            )}

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <Button className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <p className="text-center mt-4 text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-semibold"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
