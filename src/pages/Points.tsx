import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

import {
  Gift,
  Plus,
  Minus,
  Clock,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const POINT_TO_KES = 0.75;

const timeSlots = [
  '08:00','09:00','10:00','11:00','12:00',
  '14:00','15:00','16:00','17:00','18:00',
];

const Points: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [services, setServices] = useState<any[]>([]);
  const [items, setItems] = useState<Record<string, number>>({});
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [userPoints, setUserPoints] = useState({
    loyalty: 0,
    referral: 0,
    total: 0,
  });

  /* =======================
     FETCH USER POINTS
  ======================= */
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase
        .from('users')
        .select('loyalty_points, referral_points, total_points')
        .eq('id', user!.id)
        .single();

      if (data) {
        setUserPoints({
          loyalty: data.loyalty_points,
          referral: data.referral_points,
          total: data.total_points,
        });
      }
    };

    fetchUser();
  }, [user]);

  /* =======================
     FETCH SERVICES
  ======================= */
  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true);

      setServices(data || []);
    };

    fetchServices();
  }, []);

  /* =======================
     HELPERS
  ======================= */
  const updateQty = (id: string, delta: number) => {
    setItems((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const selectedServices = useMemo(
    () => services.filter((s) => items[s.id]),
    [items, services]
  );

  const serviceTotal = useMemo(
    () =>
      selectedServices.reduce(
        (sum, s) => sum + s.price * items[s.id],
        0
      ),
    [selectedServices, items]
  );

  const redeemValueKES = redeemPoints * POINT_TO_KES;

  const canRedeem =
    redeemPoints >= 600 &&
    redeemPoints <= userPoints.total &&
    serviceTotal === redeemValueKES &&
    pickupDate &&
    pickupTime &&
    address;

  /* =======================
     REDEEM
  ======================= */
  const redeem = async () => {
    if (!canRedeem) return;

    setSubmitting(true);

    try {
      const { data: addressRow } = await supabase
        .from('addresses')
        .insert({
          user_id: user!.id,
          address_line: address,
        })
        .select()
        .single();

      const { data: orderRow } = await supabase
        .from('orders')
        .insert({
          user_id: user!.id,
          address_id: addressRow.id,
          pickup_date: format(pickupDate!, 'yyyy-MM-dd'),
          pickup_time_slot: pickupTime!,
          status: 'scheduled',
          total_amount: 0,
          notes: 'Redeemed with loyalty points',
        })
        .select()
        .single();

      const orderItems = selectedServices.map((s) => ({
        order_id: orderRow.id,
        service_id: s.id,
        item_type: s.name,
        quantity: items[s.id],
        price: s.price,
      }));

      await supabase.from('order_items').insert(orderItems);

      await supabase.from('loyalty_transactions').insert({
        user_id: user!.id,
        order_id: orderRow.id,
        points: -redeemPoints,
        transaction_type: 'redeem',
      });

      await supabase
        .from('users')
        .update({
          total_points: userPoints.total - redeemPoints,
        })
        .eq('id', user!.id);

      toast({
        title: 'Redemption successful 🎉',
        description: 'Your free pickup has been scheduled!',
      });

      navigate('/dashboard');
    } catch (e: any) {
      toast({
        title: 'Redemption failed',
        description: e.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================
     UI
  ======================= */
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />

      <main className="pt-24 pb-20 container max-w-4xl mx-auto px-4">

        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8 text-center">
          <Gift className="mx-auto text-primary mb-2" />
          <h1 className="text-3xl font-bold">Your Points</h1>
          <p className="text-muted-foreground">
            600 points = KES 450 free service
          </p>
        </div>

        {/* POINTS SUMMARY */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Loyalty', value: userPoints.loyalty },
            { label: 'Referral', value: userPoints.referral },
            { label: 'Total', value: userPoints.total },
          ].map((p) => (
            <div key={p.label} className="p-4 rounded-xl border text-center">
              <p className="text-sm text-muted-foreground">{p.label}</p>
              <p className="text-2xl font-bold">{p.value}</p>
            </div>
          ))}
        </div>

        {/* REDEEM */}
        <div className="space-y-6">
          <div>
            <Label>Points to Redeem</Label>
            <Input
              type="number"
              min={600}
              value={redeemPoints}
              onChange={(e) => setRedeemPoints(Number(e.target.value))}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Value: KES {redeemValueKES}
            </p>
          </div>

          {/* SERVICES */}
          <div className="grid sm:grid-cols-2 gap-4">
            {services.map((s) => (
              <div key={s.id} className="p-4 border rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-sm text-muted-foreground">
                      KES {s.price}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button size="icon" variant="outline" onClick={() => updateQty(s.id, -1)}>
                      <Minus size={14} />
                    </Button>
                    <span>{items[s.id] || 0}</span>
                    <Button size="icon" variant="outline" onClick={() => updateQty(s.id, 1)}>
                      <Plus size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DATE & TIME */}
          <Calendar
            mode="single"
            selected={pickupDate ?? undefined}
            onSelect={(d) => d && setPickupDate(d)}
          />

          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map((t) => (
              <Button
                key={t}
                variant={pickupTime === t ? 'default' : 'outline'}
                onClick={() => setPickupTime(t)}
              >
                <Clock size={14} className="mr-2" />
                {t}
              </Button>
            ))}
          </div>

          <div>
            <Label>Pickup Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <Button
            className="w-full gap-2"
            disabled={!canRedeem || submitting}
            onClick={redeem}
          >
            {submitting && <Loader2 className="animate-spin" />}
            Redeem & Schedule Pickup
          </Button>
        </div>

      </main>
    </div>
  );
};

export default Points;
