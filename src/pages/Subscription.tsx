import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Crown,
  CheckCircle2,
  Sparkles,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type Plan = {
  id: string;
  name: string;
  price: number;
  description: string | null;
};

type UserSubscription = {
  id: string;
  status: string;
  expiry_date: string;
  subscription_plans: {
    name: string;
    price: number;
  };
};

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [userSub, setUserSub] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  // -----------------------------------
  // Fetch subscriptions
  // -----------------------------------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select(
          `
          id,
          status,
          expiry_date,
          subscription_plans (
            name,
            price
          )
        `
        )
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      setPlans(plansData || []);
      setUserSub(subData || null);
      setLoading(false);
    };

    fetchData();
  }, []);

  // -----------------------------------
  // Subscribe
  // -----------------------------------
  const handleSubscribe = async (plan: Plan) => {
    setSubscribing(plan.id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);

    const { error } = await supabase.from('user_subscriptions').insert({
      user_id: user.id,
      subscription_plan_id: plan.id,
      amount_paid: plan.price,
      expiry_date: expiry.toISOString().split('T')[0],
      status: 'active',
    });

    setSubscribing(null);

    if (error) {
      toast({
        title: 'Subscription failed',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Subscribed 🎉',
      description: `You are now on the ${plan.name} plan`,
    });

    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="container max-w-3xl mx-auto px-4 py-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Crown className="text-yellow-500" />
          Subscriptions
        </h1>
      </div>

      {/* Current subscription */}
      {userSub && (
        <Card className="mb-8 rounded-2xl border-primary/30 bg-primary/5">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary" />
              <h2 className="font-semibold text-lg">
                Your Current Plan
              </h2>
            </div>

            <p className="font-medium">
              {userSub.subscription_plans.name} — KES{' '}
              {userSub.subscription_plans.price}
            </p>

            <div className="flex gap-3 items-center text-sm">
              <Badge className="capitalize">{userSub.status}</Badge>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Expires on {userSub.expiry_date}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="rounded-2xl shadow-soft hover:shadow-medium transition-all bg-gradient-to-br from-blue-600 to-sky-500 text-white">
  <CardContent className="p-6 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
      <Badge className="bg-white/20 text-white">KES {plan.price}</Badge>
    </div>

                {/* Benefits */}
                <ul className="space-y-2 text-sm">
                  {(plan.description || '')
                    .split('\n')
                    .filter(Boolean)
                    .map((line, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>{line}</span>
                      </li>
                    ))}
                </ul>

                <Button
                  className="w-full mt-4"
                  disabled={!!userSub || subscribing === plan.id}
                  onClick={() => handleSubscribe(plan)}
                >
                  {subscribing === plan.id ? (
                    <Loader2 className="animate-spin" />
                  ) : userSub ? (
                    'Already Subscribed'
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Subscription;
