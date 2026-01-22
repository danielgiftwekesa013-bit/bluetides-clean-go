import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Droplets, Mail, Lock, User, ArrowLeft, Loader2, Eye, EyeOff, Phone, MapPin, Gift } from 'lucide-react';
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/dashboard');
    });
  }, [navigate]);

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
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach(e => {
          if (e.path[0]) newErrors[e.path[0] as string] = e.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isSignUp) {
        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError || !authData.user) {
          throw new Error(authError?.message || 'Signup failed');
        }

        // 2. Check referral code
        let referredByUserId: number | null = null;

        if (referralCode) {
          const { data: refUser } = await supabase
            .from('users')
            .select('id')
            .eq('referral_code', referralCode)
            .single();

          if (refUser) {
            referredByUserId = refUser.id;
          }
        }

        // 3. Insert into users table
        const { error: insertError } = await supabase.from('users').insert({
          full_name: fullName,
          email,
          phone,
          location,
          inviter_code: referralCode || null,
          referred_by: referredByUserId,
          referral_code: crypto.randomUUID().slice(0, 8),
        });

        if (insertError) {
          throw new Error(insertError.message);
        }

        toast({
          title: 'Account created 🎉',
          description: 'Welcome! Your account has been successfully created.',
        });

        navigate('/dashboard');
      } else {
        // SIGN IN
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw new Error(error.message);

        toast({
          title: 'Welcome back 👋',
          description: 'Signed in successfully.',
        });

        navigate('/dashboard');
      }
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
                <Input placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} />
                <Input placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
                <Input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
                <Input placeholder="Referral code (optional)" value={referralCode} onChange={e => setReferralCode(e.target.value)} />
              </>
            )}

            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />

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
              {isLoading ? <Loader2 className="animate-spin" /> : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center mt-4 text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-semibold">
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
