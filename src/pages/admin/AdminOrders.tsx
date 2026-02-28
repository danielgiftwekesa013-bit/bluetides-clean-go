import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Package,
  Calendar,
  Clock,
  MapPin,
  Phone,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

/* ----------------------------- Types ----------------------------- */

export type OrderStatus =
  | 'scheduled'
  | 'processing'
  | 'washed'
  | 'ready_for_delivery'
  | 'delivered';

interface OrderItem {
  service: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: OrderStatus;
  pickupDate: string;
  pickupTime: string;
  totalPrice: number;
  loyaltyPointsEarned: number;
  phone: string;
  address: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
}

/* ----------------------------- Status Flow ----------------------------- */

const statusFlow: OrderStatus[] = [
  'scheduled',
  'processing',
  'washed',
  'ready_for_delivery',
  'delivered',
];

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    nextLabel?: string;
    iconBg: string;
    containerBg: string;
    badge: string;
  }
> = {
  scheduled: {
    label: 'Scheduled',
    nextLabel: 'Mark as Picked',
    iconBg: 'bg-yellow-500',
    containerBg: 'bg-yellow-500/10',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  processing: {
    label: 'Processing',
    nextLabel: 'Mark as Washed',
    iconBg: 'bg-blue-500',
    containerBg: 'bg-blue-500/10',
    badge: 'bg-blue-100 text-blue-700',
  },
  washed: {
    label: 'Washed',
    nextLabel: 'Ready for Delivery',
    iconBg: 'bg-green-500',
    containerBg: 'bg-green-500/10',
    badge: 'bg-green-100 text-green-700',
  },
  ready_for_delivery: {
    label: 'Ready for Delivery',
    nextLabel: 'Mark as Delivered',
    iconBg: 'bg-purple-500',
    containerBg: 'bg-purple-500/10',
    badge: 'bg-purple-100 text-purple-700',
  },
  delivered: {
    label: 'Delivered',
    iconBg: 'bg-gray-500',
    containerBg: 'bg-gray-500/10',
    badge: 'bg-gray-100 text-gray-700',
  },
};

/* ----------------------------- Component ----------------------------- */

const AdminOrders: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  /* ----------------------------- Fetch Orders ----------------------------- */

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          id,
          status,
          pickup_date,
          pickup_time_slot,
          total_amount,
          created_at,
          users (
            full_name,
            email,
            phone
          ),
          addresses (
            address_line
          ),
          order_items (
            item_type,
            quantity,
            price
          )
        `
        )
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Failed to load orders',
          description: error.message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const mapped: Order[] =
        data?.map((o: any) => ({
          id: o.id,
          status: o.status,
          pickupDate: o.pickup_date,
          pickupTime: o.pickup_time_slot,
          totalPrice: o.total_amount ?? 0,
          loyaltyPointsEarned: Math.floor(((o.total_amount ?? 0) / 450) * 100),

          customerName: o.users?.full_name ?? 'Unknown',
          customerEmail: o.users?.email ?? '',
          phone: o.users?.phone ?? '',
          address: o.addresses?.address_line ?? '',
          items:
            o.order_items?.map((i: any) => ({
              service: i.item_type,
              quantity: i.quantity,
              price: i.price ?? 0,
            })) ?? [],
        })) ?? [];

      setOrders(mapped);
      setLoading(false);
    };

    fetchOrders();
  }, [toast]);

  /* ----------------------------- Status Update ----------------------------- */

  const handleStatusUpdate = async (
    orderId: string,
    currentStatus: OrderStatus
  ) => {
    const index = statusFlow.indexOf(currentStatus);
    if (index === -1 || index === statusFlow.length - 1) return;

    const nextStatus = statusFlow[index + 1];

    const { error } = await supabase
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', orderId);

    if (error) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: nextStatus } : o
      )
    );

    toast({
      title: 'Status Updated',
      description: `Order marked as ${statusConfig[nextStatus].label}`,
    });
  };

  /* ----------------------------- Base Filter (Daily + Undelivered) ----------------------------- */

  const baseOrders = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    return orders.filter(
      (o) =>
        o.pickupDate === today || o.status !== 'delivered'
    );
  }, [orders]);

  /* ----------------------------- Tabs ----------------------------- */

  const tabs = [
    { id: 'all', label: 'All Orders', count: baseOrders.length },
    {
      id: 'scheduled',
      label: 'Scheduled',
      count: baseOrders.filter((o) => o.status === 'scheduled').length,
    },
    {
      id: 'picked',
      label: 'Picked (Processing)',
      count: baseOrders.filter((o) => o.status === 'processing').length,
    },
    {
      id: 'washed',
      label: 'Washed',
      count: baseOrders.filter((o) => o.status === 'washed').length,
    },
    {
      id: 'delivery',
      label: 'Ready for Delivery',
      count: baseOrders.filter(
        (o) => o.status === 'ready_for_delivery'
      ).length,
    },
  ];

  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case 'scheduled':
        return baseOrders.filter((o) => o.status === 'scheduled');
      case 'picked':
        return baseOrders.filter((o) => o.status === 'processing');
      case 'washed':
        return baseOrders.filter((o) => o.status === 'washed');
      case 'delivery':
        return baseOrders.filter(
          (o) => o.status === 'ready_for_delivery'
        );
      default:
        return baseOrders;
    }
  }, [activeTab, baseOrders]);

  /* ----------------------------- UI ----------------------------- */

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Orders Management
          </h1>
          <p className="text-muted-foreground">
            Today’s orders + pending deliveries
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-card shadow-soft text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted-foreground/20'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Orders */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-muted-foreground">Loading orders…</p>
          ) : filteredOrders.length === 0 ? (
            <p className="text-muted-foreground">No orders found.</p>
          ) : (
            filteredOrders.map((order) => {
              const status = statusConfig[order.status];
              const canProgress = order.status !== 'delivered';

              return (
                <div
                  key={order.id}
                  className={cn(
                    'p-6 rounded-2xl border backdrop-blur-md transition-all',
                    status.containerBg,
                    'border-border hover:border-primary/40'
                  )}
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
  <div className="flex gap-4 flex-1">
    <div
      className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center',
        status.iconBg
      )}
    >
      <Package className="w-6 h-6 text-white" />
    </div>

    <div className="flex-1">
      <div className="flex items-center gap-3">
        <h3 className="font-bold text-lg text-white">
          Order #{order.id.slice(-4)}
        </h3>
        <span
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium',
            status.badge
          )}
        >
          {status.label}
        </span>
      </div>

      <p className="mt-1 font-medium text-white">
        {order.customerName}
      </p>
      <p className="text-sm text-white">
        {order.customerEmail}
      </p>

      <div className="flex flex-wrap gap-4 mt-4 text-sm text-white">
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {order.pickupDate}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {order.pickupTime}
        </span>
        <span className="flex items-center gap-1">
          <Phone className="w-4 h-4" />
          {order.phone}
        </span>
      </div>

      <div className="flex items-center gap-1 mt-2 text-sm text-white">
        <MapPin className="w-4 h-4" />
        {order.address}
      </div>

      <div className="mt-4 p-4 rounded-xl bg-black/20">
        {order.items.map((item, i) => (
          <div
            key={i}
            className="flex justify-between text-sm text-white"
          >
            <span className="text-white">
              {item.service} × {item.quantity}
            </span>
            <span className="font-medium">
              KES {item.price.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>

  <div className="flex flex-col items-end gap-4">
    <div className="text-right">
      <p className="text-sm text-white">
        Total
      </p>
      <p className="text-2xl font-bold text-white">
        KES {order.totalPrice.toLocaleString()}
      </p>
      <p className="text-xs text-white">
        +{order.loyaltyPointsEarned} points
      </p>
    </div>

    {canProgress && (
      <Button
        variant="hero"
        onClick={() =>
          handleStatusUpdate(order.id, order.status)
        }
      >
        {status.nextLabel}
        <ChevronRight className="w-4 h-4" />
      </Button>
    )}
  </div>
</div>
{/* ---- CARD CONTENT (unchanged) ---- */}
                  {/* exactly the same as your current version */}
                  {/* intentionally not modified */}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
