import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Clock, MapPin, Phone, Plus, Minus, Truck, Check } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import FAQChatbot from '@/components/chatbot/FAQChatbot';

const services = [
  { id: 'clothes', name: 'Clothes Washing', unit: 'kg', price: 100 },
  { id: 'duvet', name: 'Duvet Cleaning', unit: 'each', price: 800 },
  { id: 'blanket', name: 'Blanket Cleaning', unit: 'each', price: 300 },
  { id: 'carpet', name: 'Carpet Cleaning', unit: 'sqm', price: 750 },
  { id: 'mat', name: 'Mat Cleaning', unit: 'each', price: 200 },
  { id: 'shoes', name: 'Shoe Cleaning', unit: 'pair', price: 150 },
];

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00', '18:00',
];

const Schedule: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Record<string, number>>({});
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const updateItemQuantity = (id: string, delta: number) => {
    setItems((prev) => {
      const current = prev[id] || 0;
      const newValue = Math.max(0, current + delta);
      if (newValue === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newValue };
    });
  };

  const calculateTotal = () => {
    return Object.entries(items).reduce((total, [id, qty]) => {
      const service = services.find((s) => s.id === id);
      return total + (service?.price || 0) * qty;
    }, 0);
  };

  const selectedServices = services.filter((s) => items[s.id]);

  const handleSubmit = async () => {
    if (!date || !time || !address || !phone || selectedServices.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    addOrder({
      customerId: user?.id || '',
      customerName: user?.username || '',
      customerEmail: user?.email || '',
      items: selectedServices.map((s) => ({
        service: s.name,
        quantity: items[s.id],
        price: s.price * items[s.id],
      })),
      status: 'scheduled',
      pickupDate: format(date, 'yyyy-MM-dd'),
      pickupTime: time,
      address,
      phone,
      totalPrice: calculateTotal(),
      notes,
    });

    toast({
      title: 'Pickup Scheduled!',
      description: `We'll pick up your laundry on ${format(date, 'MMMM d')} at ${time}.`,
    });

    navigate('/dashboard');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Schedule a <span className="text-gradient">Pickup</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Free pickup and delivery. We'll be at your doorstep!
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <button
                  onClick={() => s < step && setStep(s)}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                    step >= s
                      ? 'gradient-ocean text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </button>
                {s < 3 && (
                  <div
                    className={cn(
                      'w-16 h-1 rounded-full transition-colors',
                      step > s ? 'gradient-ocean' : 'bg-muted'
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Select Services */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-foreground mb-6">Select Services</h2>
              <div className="grid gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={cn(
                      'p-6 rounded-2xl border-2 transition-all',
                      items[service.id]
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/30'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{service.name}</h3>
                        <p className="text-muted-foreground">
                          KES {service.price}/{service.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateItemQuantity(service.id, -1)}
                          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                          disabled={!items[service.id]}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold text-lg">
                          {items[service.id] || 0}
                        </span>
                        <button
                          onClick={() => updateItemQuantity(service.id, 1)}
                          className="w-10 h-10 rounded-xl gradient-ocean text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-8 p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground">Selected items:</span>
                  <span className="font-semibold">{Object.values(items).reduce((a, b) => a + b, 0)}</span>
                </div>
                <div className="flex items-center justify-between text-xl font-bold">
                  <span>Estimated Total:</span>
                  <span className="text-gradient">KES {calculateTotal().toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Pickup & Delivery: FREE
                </p>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full mt-8"
                onClick={() => setStep(2)}
                disabled={selectedServices.length === 0}
              >
                Continue to Schedule
              </Button>
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-foreground mb-6">Choose Pickup Date & Time</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Calendar */}
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Select Date</h3>
                  </div>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-xl"
                  />
                </div>

                {/* Time Slots */}
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Select Time</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setTime(slot)}
                        className={cn(
                          'p-3 rounded-xl border-2 font-medium transition-all',
                          time === slot
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/30'
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep(3)}
                  disabled={!date || !time}
                >
                  Continue to Details
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Details */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-foreground mb-6">Contact & Address</h2>

              <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Pickup Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Textarea
                      id="address"
                      placeholder="Enter your full address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-10 min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g., 0712345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special care instructions or notes for the pickup"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-8 p-6 rounded-2xl gradient-ocean text-primary-foreground">
                <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                <div className="space-y-2 mb-4">
                  {selectedServices.map((s) => (
                    <div key={s.id} className="flex justify-between">
                      <span>{s.name} × {items[s.id]}</span>
                      <span>KES {(s.price * items[s.id]).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-primary-foreground/20">
                  <div className="flex justify-between items-center">
                    <span>Pickup & Delivery</span>
                    <span className="text-green-300 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xl font-bold">
                    <span>Total</span>
                    <span>KES {calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4 text-sm opacity-80">
                  📅 {date ? format(date, 'MMMM d, yyyy') : ''} at {time}
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button variant="outline" size="lg" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={!address || !phone || isSubmitting}
                >
                  {isSubmitting ? 'Scheduling...' : 'Confirm Pickup'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <FAQChatbot />
    </div>
  );
};

export default Schedule;
