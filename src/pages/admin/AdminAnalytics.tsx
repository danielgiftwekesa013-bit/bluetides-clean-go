import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useOrders } from '@/contexts/OrderContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { TrendingUp, Package, Users, Gift, ArrowUp, ArrowDown } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdminAnalytics: React.FC = () => {
  const { orders } = useOrders();

  // Calculate service breakdown
  const serviceBreakdown = orders.reduce((acc, order) => {
    order.items.forEach((item) => {
      const existing = acc.find((s) => s.name === item.service);
      if (existing) {
        existing.value += item.quantity;
        existing.revenue += item.price;
      } else {
        acc.push({ name: item.service, value: item.quantity, revenue: item.price });
      }
    });
    return acc;
  }, [] as { name: string; value: number; revenue: number }[]);

  // Monthly revenue data (mock)
  const monthlyRevenue = [
    { month: 'Aug', revenue: 45000, orders: 32 },
    { month: 'Sep', revenue: 52000, orders: 38 },
    { month: 'Oct', revenue: 48000, orders: 35 },
    { month: 'Nov', revenue: 61000, orders: 45 },
    { month: 'Dec', revenue: 72000, orders: 52 },
    { month: 'Jan', revenue: 68000, orders: 48 },
  ];

  // Subscription data (mock)
  const subscriptionData = [
    { name: 'Basic', value: 45, color: '#10B981' },
    { name: 'Standard', value: 35, color: '#3B82F6' },
    { name: 'Premium', value: 20, color: '#8B5CF6' },
  ];

  // Key metrics
  const metrics = {
    totalRevenue: orders.reduce((sum, o) => sum + o.totalPrice, 0),
    totalOrders: orders.length,
    avgOrderValue: orders.length ? Math.round(orders.reduce((sum, o) => sum + o.totalPrice, 0) / orders.length) : 0,
    totalLoyaltyPoints: orders.reduce((sum, o) => sum + o.loyaltyPointsEarned, 0),
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Business insights and performance metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                <ArrowUp className="w-4 h-4" />
                12%
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              KES {metrics.totalRevenue.toLocaleString()}
            </p>
            <p className="text-muted-foreground">Total Revenue</p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-blue-500" />
              <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                <ArrowUp className="w-4 h-4" />
                8%
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground">{metrics.totalOrders}</p>
            <p className="text-muted-foreground">Total Orders</p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-purple-500" />
              <span className="flex items-center gap-1 text-sm text-red-600 font-medium">
                <ArrowDown className="w-4 h-4" />
                3%
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              KES {metrics.avgOrderValue.toLocaleString()}
            </p>
            <p className="text-muted-foreground">Avg Order Value</p>
          </div>

          <div className="p-6 rounded-2xl gradient-ocean text-primary-foreground">
            <div className="flex items-center justify-between mb-4">
              <Gift className="w-8 h-8" />
              <span className="flex items-center gap-1 text-sm font-medium opacity-80">
                <ArrowUp className="w-4 h-4" />
                15%
              </span>
            </div>
            <p className="text-3xl font-bold">{metrics.totalLoyaltyPoints}</p>
            <p className="opacity-80">Points Issued</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Revenue Trend</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))' }}
                    name="Revenue (KES)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders by Month */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Monthly Orders</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Breakdown */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Service Breakdown</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {serviceBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subscription Distribution */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">Subscription Plans</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriptionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Service Revenue Table */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h2 className="text-xl font-bold text-foreground mb-6">Service Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Service</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Units</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Revenue</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {serviceBreakdown.map((service, idx) => (
                  <tr key={service.name} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="font-medium text-foreground">{service.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-foreground">{service.value}</td>
                    <td className="py-4 px-4 text-right font-semibold text-foreground">
                      KES {service.revenue.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right text-muted-foreground">
                      {metrics.totalRevenue
                        ? ((service.revenue / metrics.totalRevenue) * 100).toFixed(1)
                        : 0}%
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

export default AdminAnalytics;
