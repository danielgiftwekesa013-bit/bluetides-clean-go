import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from "@/components/Header";
import {
  ArrowLeft,
  Calendar,
  Package,
  Shirt,
  Droplets,
  Truck,
  CheckCircle2,
  Loader2,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type Order = {
  id: string;
  created_at: string;
  pickup_date: string;
  status: string;
  total_amount: number;
  order_items: {
    id: string;
    item_type: string;
    quantity: number;
  }[];
};

const statusSteps = [
  'scheduled',
  'picked',
  'washed',
  'ready for delivery',
  'delivered',
];

const statusIcons: Record<string, any> = {
  scheduled: Calendar,
  picked: Package,
  washed: Droplets,
  'ready for delivery': Truck,
  delivered: CheckCircle2,
};

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'recent' | 'weekly' | 'monthly'>(
    'recent'
  );

  // -----------------------------------
  // Fetch orders
  // -----------------------------------
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      let query = supabase
        .from('orders')
        .select(
          `
          id,
          created_at,
          pickup_date,
          status,
          total_amount,
          order_items (
            id,
            item_type,
            quantity
          )
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter === 'recent') {
        query = query.limit(10);
      }

      if (filter === 'weekly') {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        query = query.gte('created_at', lastWeek.toISOString());
      }

      if (filter === 'monthly') {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        query = query.gte('created_at', lastMonth.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load orders',
          variant: 'destructive',
        });
        return;
      }

      setOrders(data || []);
      setLoading(false);
    };

    fetchOrders();
  }, [filter, toast]);

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
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="container max-w-2xl mx-auto px-4 py-6"
    >
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shirt className="text-primary" />
          Order History
        </h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['recent', 'weekly', 'monthly'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f as any)}
            className="capitalize"
          >
            <Filter className="w-4 h-4 mr-1" />
            {f}
          </Button>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {orders.map((order, index) => (
          <motion.div
            key={order.id.slice(-6)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="rounded-2xl shadow-soft p-6 bg-gradient-to-br from-blue-600 to-sky-500 backdrop-blur-sm">
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-white mt-10">
                      Pickup: {order.pickup_date}
                    </p>
                    <p className="font-semibold text-white mt-10">
                      Total: KES {order.total_amount}
                    </p>
                  </div>
                  <Badge className="capitalize text-white mt-10">{order.status}</Badge>
                </div>

                {/* Items */}
                <div className="flex flex-wrap gap-2">
                  {order.order_items.map((item) => (
                    <Badge
                      key={item.id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Shirt className="w-3 h-3" />
                      {item.item_type} × {item.quantity}
                    </Badge>
                  ))}
                </div>

                {/* Lifecycle */}
                <div className="flex justify-between items-center mt-4">
                  {statusSteps.map((step, idx) => {
                    const Icon = statusIcons[step];
                    const active =
                      statusSteps.indexOf(order.status) >= idx;

                    return (
                      <motion.div
                        key={step}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                          scale: active ? 1 : 0.9,
                          opacity: active ? 1 : 0.4,
                        }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center text-xs text-center text-white mt-10"
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            active ? 'text-primary' : 'text-white mt-10'
                          }`}
                        />
                        <span className="mt-1 capitalize">{step}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {orders.length === 0 && (
          <div className="text-center text-white mt-10">
            No orders found 🧺
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Orders;
