import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Package,
  Users,
  TrendingUp,
  Calendar,
  ArrowUp,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* =======================
   TYPES
======================= */
type Order = {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  users?: {
    full_name: string;
  };
  order_items?: { id: string }[];
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  /* =======================
     FETCH REAL DATA
  ======================= */
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          users (
            full_name
          ),
          order_items (
            id
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data as Order[]);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  /* =======================
     STATS (REAL DATA)
  ======================= */
  const stats = {
    totalOrders: orders.length,
    scheduled: orders.filter((o) => o.status === 'scheduled').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    washed: orders.filter((o) => o.status === 'washed').length,
    readyForDelivery: orders.filter((o) => o.status === 'ready_for_delivery').length,
    totalRevenue: orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.username}!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Orders */}
          <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-blue-600" />
              <span className="flex items-center gap-1 text-sm text-blue-600 font-medium">
                <ArrowUp className="w-4 h-4" />
                Live
              </span>
            </div>
            <p className="text-3xl font-bold text-blue-900">
              {loading ? '—' : stats.totalOrders}
            </p>
            <p className="text-blue-700">Total Orders</p>
          </div>

          {/* Scheduled */}
          <div className="p-6 rounded-2xl bg-sky-50 border border-sky-200">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-sky-600" />
            </div>
            <p className="text-3xl font-bold text-sky-900">
              {loading ? '—' : stats.scheduled}
            </p>
            <p className="text-sky-700">Scheduled Pickups</p>
          </div>

          {/* Processing */}
          <div className="p-6 rounded-2xl bg-cyan-50 border border-cyan-200">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-cyan-600" />
            </div>
            <p className="text-3xl font-bold text-cyan-900">
              {loading ? '—' : stats.processing + stats.washed}
            </p>
            <p className="text-cyan-700">In Processing</p>
          </div>

          {/* Revenue */}
          <div className="p-6 rounded-2xl gradient-ocean text-primary-foreground shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8" />
              <span className="flex items-center gap-1 text-sm font-medium opacity-80">
                <ArrowUp className="w-4 h-4" />
                Live
              </span>
            </div>
            <p className="text-3xl font-bold">
              KES {stats.totalRevenue.toLocaleString()}
            </p>
            <p className="opacity-80">Total Revenue</p>
          </div>
        </div>

        {/* Order Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Order Status Overview
            </h2>

            <div className="space-y-4">
              {[
                { label: 'Scheduled', count: stats.scheduled, color: 'bg-sky-500' },
                { label: 'Processing', count: stats.processing, color: 'bg-blue-500' },
                { label: 'Washed', count: stats.washed, color: 'bg-cyan-500' },
                { label: 'Ready for Delivery', count: stats.readyForDelivery, color: 'bg-indigo-500' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className={cn('w-3 h-3 rounded-full', color)} />
                  <span className="flex-1 text-foreground">{label}</span>
                  <span className="font-semibold text-foreground">{count}</span>
                  <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', color)}
                      style={{
                        width: `${stats.totalOrders
                          ? (count / stats.totalOrders) * 100
                          : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions (UNCHANGED) */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Quick Actions
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/bluetides/orders')}
                className="p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left"
              >
                <Package className="w-6 h-6 text-primary mb-2" />
                <p className="font-semibold text-foreground">View Orders</p>
                <p className="text-sm text-muted-foreground">
                  Manage all orders
                </p>
              </button>

              <button
                onClick={() => navigate('/bluetides/customers')}
                className="p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left"
              >
                <Users className="w-6 h-6 text-primary mb-2" />
                <p className="font-semibold text-foreground">Customers</p>
                <p className="text-sm text-muted-foreground">
                  View customer list
                </p>
              </button>

              <button
                onClick={() => navigate('/bluetides/analytics')}
                className="p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left"
              >
                <TrendingUp className="w-6 h-6 text-primary mb-2" />
                <p className="font-semibold text-foreground">Analytics</p>
                <p className="text-sm text-muted-foreground">
                  View reports
                </p>
              </button>

              <button
                onClick={() => navigate('/bluetides/orders?tab=picked')}
                className="p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left"
              >
                <Calendar className="w-6 h-6 text-primary mb-2" />
                <p className="font-semibold text-foreground">
                  Picked Clothes
                </p>
                <p className="text-sm text-muted-foreground">
                  Ready to wash
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">
              Recent Orders
            </h2>
            <button
              onClick={() => navigate('/bluetides/orders')}
              className="flex items-center gap-2 text-primary font-medium hover:underline"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Order ID
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Items
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-4 px-4 font-medium text-foreground">
                      #{order.id.slice(-6)}
                    </td>
                    <td className="py-4 px-4 text-foreground">
                      {order.users?.full_name ?? '—'}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {order.order_items?.length || 0} item(s)
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium',
                          order.status === 'scheduled' &&
                            'bg-sky-100 text-sky-700',
                          order.status === 'processing' &&
                            'bg-blue-100 text-blue-700',
                          order.status === 'washed' &&
                            'bg-cyan-100 text-cyan-700',
                          order.status === 'ready_for_delivery' &&
                            'bg-indigo-100 text-indigo-700'
                        )}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-foreground">
                      KES {Number(order.total_amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
