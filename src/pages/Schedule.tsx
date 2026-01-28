import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import FAQChatbot from '@/components/chatbot/FAQChatbot';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

import {
  Clock,
  Plus,
  Minus,
  Check,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

/* =======================
   SERVICES
======================= */
const services = [
  { id: 'clothes', name: 'Clothes Washing', unit: 'kg', price: 100 },
  { id: 'duvet', name: 'Duvet Cleaning', unit: 'each', price: 800 },
  { id: 'blanket', name: 'Blanket Cleaning', unit: 'each', price: 300 },
  { id: 'carpet', name: 'Carpet Cleaning', unit: 'sqm', price: 750 },
  { id: 'mat', name: 'Mat Cleaning', unit: 'each', price: 200 },
  { id: 'shoes', name: 'Shoe Cleaning', unit: 'pair', price: 150 },
];

const timeSlots = [
  '08:00','09:00','10:00','11:00','12:00',
  '14:00','15:00','16:00','17:00','18:00',
];

const Schedule: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  /* =======================
     STATE
  ======================= */
  const [step, setStep] = useState(1);
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  /* =======================
     AUTH GUARD
  ======================= */
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate('/auth', { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) return null;

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
    [items]
  );

  const totalAmount = useMemo(
    () =>
      selectedServices.reduce(
        (sum, s) => sum + s.price * items[s.id],
        0
      ),
    [selectedServices, items]
  );

  /* =======================
     STEP VALIDATION
  ======================= */
  const canContinueStep1 = selectedServices.length > 0;
  const canContinueStep2 = Boolean(pickupDate && pickupTime);
  const canSubmit = Boolean(address && pickupDate && pickupTime && selectedServices.length);

  /* =======================
     SUBMIT ORDER
  ======================= */
  const submitOrder = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!canSubmit) {
      toast({
        title: 'Incomplete order',
        description: 'Please complete all steps before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: addressRow, error: addressError } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          address_line: address,
        })
        .select()
        .single();

      if (addressError) throw addressError;

      const { data: orderRow, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          address_id: addressRow.id,
          pickup_date: format(pickupDate!, 'yyyy-MM-dd'),
          pickup_time_slot: pickupTime!,
          status: 'scheduled',
          total_amount: totalAmount,
          notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = selectedServices.map((s) => ({
        order_id: orderRow.id,
        item_type: s.name,
        quantity: items[s.id],
        price: s.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: 'Pickup scheduled 🎉',
        description: `We’ll arrive on ${format(pickupDate!, 'MMMM d')} at ${pickupTime}`,
      });

      navigate('/dashboard');
    } catch (err: any) {
      toast({
        title: 'Something went wrong',
        description: err.message,
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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto max-w-4xl px-4">

          {/* HERO */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles size={16} />
              Schedule Pickup
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Let’s take care of your laundry
            </h1>
            <p className="text-muted-foreground">
              Select services, choose time, relax.
            </p>
          </div>

          {/* STEPS */}
          <div className="flex justify-center gap-6 mb-12">
            {[1,2,3].map((s) => (
              <div
                key={s}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                  step >= s ? 'gradient-ocean text-white scale-105' : 'bg-muted'
                )}
              >
                {step > s ? <Check size={18} /> : s}
              </div>
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="grid sm:grid-cols-2 gap-6 animate-fade-in">
              {services.map((s) => (
                <div key={s.id} className="p-5 rounded-2xl border bg-card">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-sm text-muted-foreground">
                        KES {s.price} / {s.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button size="icon" variant="outline" onClick={() => updateQty(s.id, -1)}>
                        <Minus size={16} />
                      </Button>
                      <span className="w-6 text-center">{items[s.id] || 0}</span>
                      <Button size="icon" variant="outline" onClick={() => updateQty(s.id, 1)}>
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                className="sm:col-span-2 mt-4"
                disabled={!canContinueStep1}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <Calendar
                mode="single"
                selected={pickupDate ?? undefined}
                onSelect={(date) => date && setPickupDate(date)}
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

              <Button
                className="w-full"
                disabled={!canContinueStep2}
                onClick={() => setStep(3)}
              >
                Continue
              </Button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <Label>Pickup Address</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>

              <div>
                <Label>Notes (optional)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <Button
                className="w-full gap-2"
                disabled={submitting || !canSubmit}
                onClick={submitOrder}
              >
                {submitting && <Loader2 className="animate-spin" />}
                Confirm Order · KES {totalAmount.toLocaleString()}
              </Button>
            </div>
          )}

        </div>
      </main>

      <FAQChatbot />
    </div>
  );
};

export default Schedule;
