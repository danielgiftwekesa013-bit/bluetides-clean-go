import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import FAQChatbot from '@/components/chatbot/FAQChatbot';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

import {
  Calendar,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  Gift,
  Crown,
  ArrowRight,
} from 'lucide-react';

/* =====================
   TYPES (DB-ACCURATE)
===================== */
type OrderStatus =
  | 'scheduled'
  | 'processing'
  | 'washed'
  | 'ready_for_delivery'
  | 'delivered';

interface OrderItem {
  id: number;
  item_type: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  pickup_date: string;
  pickup_time_slot: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  order_items: OrderItem[];
}

interface UserRow {
  id: number;
  full_name: string;
  loyalty_points: number;
  total_points: number;
}

/* =====================
   STATUS STYLES
===================== */
const statusMap: Record<
  OrderStatus,
  { label: string; icon: React.ElementType; color: string }
> = {
  scheduled: { label: 'Scheduled', icon: Calendar, color: 'bg-yellow-500' },
  processing: { label: 'Processing', icon: Package, color: 'bg-blue-500' },
  washed: { label: 'Washed', icon: CheckCircle2, color: 'bg-green-500' },
  ready_for_delivery: {
    label: 'Out for Delivery',
    icon: Truck,
    color: 'bg-purple-500',
  },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'bg-gray-500' },
};

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [userRow, setUserRow] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(true);

  /* =====================
     AUTH GUARD
  ===================== */
  useEffect(() => {
    if (isLoading) return;
    if (!user) navigate('/auth', { replace: true });
  }, [user, isLoading, navigate]);

  /* =====================
     FETCH USER + ORDERS
  ===================== */
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setLoading(true);

      const { data: userData } = await supabase
        .from('users')
        .select('id, full_name, loyalty_points, total_points')
        .eq('id', user.id)
        .single();

      setUserRow(userData);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: orderData } = await supabase
        .from('orders')
        .select(`
          id,
          pickup_date,
          pickup_time_slot,
          status,
          total_amount,
          created_at,
          order_items (
            id,
            item_type,
            quantity,
            price
          )
        `)
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      setOrders((orderData || []) as Order[]);
      setLoading(false);
    };

    fetchDashboardData();
  }, [user]);

  if (isLoading || !user || loading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* WELCOME */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold">Welcome back 👋</h1>
            <p className="text-muted-foreground">
              {userRow?.full_name}
            </p>
          </div>

          {/* SCHEDULE ORDER CTA */}
          <div
            onClick={() => navigate('/schedule')}
            className="mb-12 cursor-pointer rounded-3xl p-6 sm:p-8
              bg-gradient-to-r from-primary to-sky-500 text-white
              hover:scale-[1.01] transition-all shadow-lg hover:shadow-xl"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  Schedule a Pickup
                </h2>
                <p className="opacity-90">
                  Choose a date & time — we’ll handle the rest
                </p>
              </div>

              <Button
                variant="secondary"
                className="gap-2 text-primary font-semibold"
              >
                Schedule Now
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white">
              <div className="flex justify-between mb-3">
                <Gift />
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                  Loyalty
                </span>
              </div>
              <p className="text-4xl font-bold">
                {userRow?.loyalty_points ?? 0}
              </p>
              <p className="text-sm opacity-80">
                Total points: {userRow?.total_points ?? 0}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border">
              <div className="flex justify-between mb-3">
                <Crown className="text-primary" />
                <span className="text-xs bg-muted px-3 py-1 rounded-full">
                  Subscription
                </span>
              </div>
              <p className="text-xl font-semibold">
                No active plan
              </p>
              <p className="text-sm text-muted-foreground">
                Subscribe to save more
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border">
              <div className="flex justify-between mb-3">
                <Package className="text-primary" />
                <span className="text-xs bg-muted px-3 py-1 rounded-full">
                  Last 7 Days
                </span>
              </div>
              <p className="text-4xl font-bold">{orders.length}</p>
              <p className="text-sm text-muted-foreground">
                Orders placed
              </p>
            </div>
          </div>

          {/* ORDERS */}
          <h2 className="text-2xl font-bold mb-6">
            Recent Orders
          </h2>

          {orders.length === 0 ? (
            <div className="text-center p-12 rounded-2xl bg-card border">
              <Package className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">
                No orders in the past 7 days
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = statusMap[order.status];
                const Icon = status.icon;

                return (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-card border hover:border-primary/40 transition"
                  >
                    <div className="flex justify-between gap-4">
                      <div className="flex gap-4">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center',
                            status.color
                          )}
                        >
                          <Icon className="text-white" />
                        </div>

                        <div>
                          <p className="font-semibold">
                            Order #{order.id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.order_items.map(i => i.item_type).join(', ')}
                          </p>
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {order.pickup_date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {order.pickup_time_slot}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold">
                          KES {order.total_amount?.toLocaleString()}
                        </p>
                        <span className="inline-block mt-1 text-xs px-3 py-1 rounded-full bg-muted">
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 🚫 No Footer on Dashboard */}
      <FAQChatbot />
    </div>
  );
};

export default Dashboard;
