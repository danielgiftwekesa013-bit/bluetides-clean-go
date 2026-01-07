import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useOrders } from '@/contexts/OrderContext';
import { Users, Gift, Crown, Package, Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock customer data (in real app, would come from Supabase)
const mockCustomers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '0712345678',
    loyaltyPoints: 150,
    subscription: { plan: 'Premium', status: 'active' },
    totalOrders: 12,
    totalSpent: 15600,
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '0723456789',
    loyaltyPoints: 85,
    subscription: { plan: 'Standard', status: 'active' },
    totalOrders: 8,
    totalSpent: 8500,
  },
  {
    id: '4',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '0734567890',
    loyaltyPoints: 45,
    subscription: null,
    totalOrders: 3,
    totalSpent: 4500,
  },
  {
    id: '5',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    phone: '0745678901',
    loyaltyPoints: 220,
    subscription: { plan: 'Basic', status: 'active' },
    totalOrders: 15,
    totalSpent: 22000,
  },
];

const AdminCustomers: React.FC = () => {
  const { orders } = useOrders();

  // Get unique customers from orders
  const customerStats = mockCustomers.map((customer) => {
    const customerOrders = orders.filter((o) => o.customerId === customer.id);
    return {
      ...customer,
      recentOrderCount: customerOrders.length,
    };
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
          <p className="text-muted-foreground">View and manage customer information</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border">
            <Users className="w-8 h-8 text-primary mb-4" />
            <p className="text-3xl font-bold text-foreground">{mockCustomers.length}</p>
            <p className="text-muted-foreground">Total Customers</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border">
            <Crown className="w-8 h-8 text-yellow-500 mb-4" />
            <p className="text-3xl font-bold text-foreground">
              {mockCustomers.filter((c) => c.subscription).length}
            </p>
            <p className="text-muted-foreground">Active Subscriptions</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border">
            <Gift className="w-8 h-8 text-green-500 mb-4" />
            <p className="text-3xl font-bold text-foreground">
              {mockCustomers.reduce((sum, c) => sum + c.loyaltyPoints, 0)}
            </p>
            <p className="text-muted-foreground">Total Loyalty Points</p>
          </div>
          <div className="p-6 rounded-2xl gradient-ocean text-primary-foreground">
            <Package className="w-8 h-8 mb-4" />
            <p className="text-3xl font-bold">
              KES {mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
            </p>
            <p className="opacity-80">Lifetime Value</p>
          </div>
        </div>

        {/* Customer List */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h2 className="text-xl font-bold text-foreground mb-6">All Customers</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Subscription</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Loyalty Points</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Orders</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {customerStats.map((customer) => (
                  <tr key={customer.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-ocean flex items-center justify-center">
                          <span className="text-primary-foreground font-bold">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{customer.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {customer.subscription ? (
                        <span className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium',
                          customer.subscription.plan === 'Premium' && 'bg-purple-100 text-purple-700',
                          customer.subscription.plan === 'Standard' && 'bg-blue-100 text-blue-700',
                          customer.subscription.plan === 'Basic' && 'bg-green-100 text-green-700'
                        )}>
                          {customer.subscription.plan}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          No Plan
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Gift className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold text-foreground">{customer.loyaltyPoints}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-medium text-foreground">
                      {customer.totalOrders}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-foreground">
                      KES {customer.totalSpent.toLocaleString()}
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

export default AdminCustomers;
