import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Droplets, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import gsap from 'gsap';

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

const inputClass =
  'bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 focus:border-primary focus:ring-primary h-11 sm:h-12 text-base';

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

  const pageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const formWrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /* =========================
     GSAP
  ========================== */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(pageRef.current, { opacity: 0, duration: 1 });

      gsap.from(cardRef.current, {
        y: 40,
        scale: 0.97,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
      });

      gsap.from(formWrapperRef.current, {
        x: isSignUp ? 30 : -30,
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out',
      });

      gsap.from(buttonRef.current, {
        scale: 0.95,
        opacity: 0,
        delay: 0.3,
        duration: 0.4,
        ease: 'back.out(1.8)',
      });
    });

    return () => ctx.revert();
  }, [isSignUp]);

  const validateForm = () => {
    try {
      isSignUp
        ? signupSchema.parse({
            fullName,
            email,
            password,
            phone,
            location,
            referralCode,
          })
        : loginSchema.parse({ email, password });
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
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error || !data.user) throw error;

        await supabase.from('users').insert({
          id: data.user.id,
          full_name: fullName,
          email,
          phone,
          location,
          referral_code: crypto.randomUUID().slice(0, 8),
          inviter_code: referralCode || null,
        });

        toast({
          title: 'Confirm your email 📧',
          description: 'Check your inbox to finish signing up.',
        });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      toast({ title: 'Welcome back 👋' });
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
    <div
      ref={pageRef}
      className="
        min-h-screen flex items-center justify-center px-4 py-10
        text-white overflow-hidden
        bg-[length:400%_400%]
        animate-[gradient_18s_ease_infinite]
        bg-gradient-to-br
        from-[#020617] via-[#020b2d] to-[#020617]
      "
    >
      {/* BACK */}
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-8 text-white/70 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </button>

        <div
          ref={cardRef}
          className="
            bg-white/10 backdrop-blur-xl
            rounded-2xl shadow-2xl
            p-6 sm:p-8
            border border-white/20
          "
        >
          {/* LOGO */}
          <div className="flex justify-center mb-6 gap-2 items-center">
            <Droplets className="w-7 h-7 text-cyan-400" />
            <span className="text-2xl font-bold tracking-tight">
              Bluetides
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>

          {/* FORM SLIDE */}
          <div ref={formWrapperRef}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <Input className={inputClass} placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} />
                  <Input className={inputClass} placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
                  <Input className={inputClass} placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
                  <Input className={inputClass} placeholder="Referral code (optional)" value={referralCode} onChange={e => setReferralCode(e.target.value)} />
                </>
              )}

              <Input className={inputClass} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />

              <div className="relative">
                <Input
                  className={inputClass}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* GLOW BUTTON */}
              <Button
                ref={buttonRef}
                disabled={isLoading}
                className="
                 relative overflow-hidden
  w-full h-12 sm:h-13
  text-white font-semibold
  bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600
  shadow-[0_0_20px_rgba(56,189,248,0.85),0_0_40px_rgba(99,102,241,0.6)]
  hover:shadow-[0_0_30px_rgba(56,189,248,1),0_0_60px_rgba(99,102,241,0.9)]
  transition-all duration-300 ease-out
  before:absolute before:inset-[-6px]
  before:rounded-xl
  before:bg-[radial-gradient(circle_at_top,rgba(147,197,253,0.6),transparent_65%)]
  before:opacity-60
  before:blur-xl
  animate-[pulse_3s_ease-in-out_infinite]
                "
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : isSignUp ? (
                  'Create Account'
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </div>

          <p className="text-center mt-4 text-sm text-white/70">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-cyan-400 font-semibold hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>

      {/* KEYFRAMES */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default Auth;
