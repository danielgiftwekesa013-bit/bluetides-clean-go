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
  ArrowLeft,
  Shirt,
  Bed,
  Layers,
  Footprints,
  Square,
} from 'lucide-react';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';

/* =======================
   ICON MAP
======================= */
const serviceIcons: Record<string, any> = {
  Clothes: Shirt,
  Duvet: Bed,
  Blanket: Layers,
  Carpet: Square,
  Mat: Square,
  Shoe: Footprints,
};

const timeSlots = [
  '08:00','09:00','10:00','11:00','12:00',
  '14:00','15:00','16:00','17:00','18:00',
];

const Schedule: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Record<string, number>>({});
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* =======================
     AUTH GUARD
  ======================= */
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, isLoading, navigate]);

  /* =======================
     FETCH SERVICES
  ======================= */
  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name');

      setServices(data || []);
      setLoadingServices(false);
    };

    fetchServices();
  }, []);

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
    [items, services]
  );

  const totalAmount = useMemo(
    () => selectedServices.reduce(
      (sum, s) => sum + s.price * items[s.id], 0),
    [selectedServices, items]
  );

  const canContinueStep1 = selectedServices.length > 0;
  const canContinueStep2 = Boolean(pickupDate && pickupTime);
  const canSubmit = Boolean(
    address && pickupDate && pickupTime && selectedServices.length
  );

  /* =======================
     SUBMIT
  ======================= */
  const submitOrder = async () => {
    if (!canSubmit) return;

    setSubmitting(true);

    try {
      const { data: addressRow } = await supabase
        .from('addresses')
        .insert({ user_id: user.id, address_line: address })
        .select()
        .single();

      const { data: orderRow } = await supabase
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

      await supabase.from('order_items').insert(
        selectedServices.map((s) => ({
          order_id: orderRow.id,
          service_id: s.id,
          item_type: s.name,
          quantity: items[s.id],
          price: s.price,
        }))
      );

      toast({
        title: 'Pickup scheduled 🌊',
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
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white">
      <Header />

      <main className="pt-24 pb-24">
        <div className="max-w-4xl mx-auto px-4">

          {/* BACK */}
          <Button
            variant="ghost"
            className="mb-6 text-white/70 hover:text-white"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>

          {/* HERO */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur text-blue-300 mb-4">
              <Sparkles size={16} />
              Schedule Pickup
            </div>
            <h1 className="text-3xl font-bold">Let’s handle your laundry</h1>
            <p className="text-white/70 mt-2">
              Select services, pick a time, relax ✨
            </p>
          </div>

          {/* STEPS */}
          <div className="flex justify-center gap-6 mb-10">
            {[1,2,3].map((s) => (
              <div
                key={s}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition',
                  step >= s
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-900/50'
                    : 'bg-white/10 text-white/60'
                )}
              >
                {step > s ? <Check size={18} /> : s}
              </div>
            ))}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {loadingServices ? (
                <p className="col-span-full text-center text-white/70">
                  Loading services…
                </p>
              ) : (
                services.map((s) => {
                  const Icon = serviceIcons[s.name.split(' ')[0]] || Shirt;

                  return (
                    <div
                      key={s.id}
                      className="
                        p-5 rounded-2xl
                        bg-white/10 backdrop-blur
                        border border-white/20
                        hover:border-blue-400/40
                        transition
                      "
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex gap-3 items-center">
                          <Icon className="text-blue-400" />
                          <div>
                            <p className="font-semibold">{s.name}</p>
                            <p className="text-sm text-white/60">
                              KES {s.price} / {s.unit}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="outline" onClick={() => updateQty(s.id, -1)}>
                            <Minus size={14} />
                          </Button>
                          <span className="w-6 text-center">
                            {items[s.id] || 0}
                          </span>
                          <Button size="icon" variant="outline" onClick={() => updateQty(s.id, 1)}>
                            <Plus size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              <Button
                disabled={!canContinueStep1}
                onClick={() => setStep(2)}
                className="
                  sm:col-span-2 mt-6
                  bg-gradient-to-r from-blue-500 to-indigo-600
                  hover:from-blue-600 hover:to-indigo-700
                  shadow-lg shadow-blue-900/40
                "
              >
                Continue
              </Button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <Calendar
                mode="single"
                selected={pickupDate ?? undefined}
                onSelect={(d) => d && setPickupDate(d)}
              />

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
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
                disabled={!canContinueStep2}
                onClick={() => setStep(3)}
                className="
                  w-full
                  bg-gradient-to-r from-blue-500 to-indigo-600
                  hover:from-blue-600 hover:to-indigo-700
                  shadow-lg shadow-blue-900/40
                "
              >
                Continue
              </Button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="text-white">Pickup Address</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} className="text-black"/>
              </div>

              <div>
                <Label className="text-white">Notes (optional)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="text-black"/>
              </div>

              <Button
                disabled={submitting || !canSubmit}
                onClick={submitOrder}
                className="
                  w-full gap-2
                  bg-gradient-to-r from-blue-500 to-indigo-600
                  hover:from-blue-600 hover:to-indigo-700
                  shadow-xl shadow-blue-900/50
                "
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
