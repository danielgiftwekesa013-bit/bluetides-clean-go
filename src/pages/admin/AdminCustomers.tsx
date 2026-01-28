import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Users, Gift, Crown, Package, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 10;

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  loyaltyPoints: number;
  subscription: {
    plan: string;
    status: string;
  } | null;
  totalOrders: number;
  totalSpent: number;
};

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchCustomers = async () => {
    setLoading(true);

    /**
     * 1. Get users ordered by most recent order
     */
    const { data: users, error, count } = await supabase
      .from('users')
      .select(
        `
        id,
        full_name,
        email,
        phone,
        loyalty_points,
        orders (
          id,
          total_amount,
          created_at
        ),
        user_subscriptions (
          status,
          expiry_date,
          subscription_plans (
            name
          )
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { foreignTable: 'orders', ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setTotalCount(count || 0);

    /**
     * 2. Shape data to match your UI
     */
    const mapped: CustomerRow[] =
      users?.map((u: any) => {
        const orders = u.orders || [];
        const totalSpent = orders.reduce(
          (sum: number, o: any) => sum + (o.total_amount || 0),
          0
        );

        const activeSub =
          u.user_subscriptions?.find((s: any) => s.status === 'active') || null;

        return {
          id: u.id,
          name: u.full_name,
          email: u.email,
          phone: u.phone,
          loyaltyPoints: u.loyalty_points || 0,
          subscription: activeSub
            ? {
                plan: activeSub.subscription_plans?.name,
                status: activeSub.status,
              }
            : null,
          totalOrders: orders.length,
          totalSpent,
        };
      }) || [];

    setCustomers(mapped);
    setLoading(false);
  };

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
            <p className="text-3xl font-bold">{totalCount}</p>
            <p className="text-muted-foreground">Total Customers</p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border">
            <Crown className="w-8 h-8 text-yellow-500 mb-4" />
            <p className="text-3xl font-bold">
              {customers.filter((c) => c.subscription).length}
            </p>
            <p className="text-muted-foreground">Active Subscriptions</p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border">
            <Gift className="w-8 h-8 text-green-500 mb-4" />
            <p className="text-3xl font-bold">
              {customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)}
            </p>
            <p className="text-muted-foreground">Loyalty Points</p>
          </div>

          <div className="p-6 rounded-2xl gradient-ocean text-primary-foreground">
            <Package className="w-8 h-8 mb-4" />
            <p className="text-3xl font-bold">
              KES{' '}
              {customers
                .reduce((sum, c) => sum + c.totalSpent, 0)
                .toLocaleString()}
            </p>
            <p className="opacity-80">Lifetime Value</p>
          </div>
        </div>

        {/* Customer List */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <h2 className="text-xl font-bold mb-6">All Customers</h2>

          {loading ? (
            <p className="text-muted-foreground text-center py-10">
              Loading customers…
            </p>
          ) : customers.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">
              No customers found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Contact</th>
                    <th className="text-left py-3 px-4">Subscription</th>
                    <th className="text-center py-3 px-4">Points</th>
                    <th className="text-center py-3 px-4">Orders</th>
                    <th className="text-right py-3 px-4">Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full gradient-ocean flex items-center justify-center">
                            <span className="font-bold text-primary-foreground">
                              {customer.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium">{customer.name}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            {customer.phone}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {customer.subscription ? (
                          <span
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-medium',
                              customer.subscription.plan === 'Premium' &&
                                'bg-purple-100 text-purple-700',
                              customer.subscription.plan === 'Standard' &&
                                'bg-blue-100 text-blue-700',
                              customer.subscription.plan === 'Basic' &&
                                'bg-green-100 text-green-700'
                            )}
                          >
                            {customer.subscription.plan}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs bg-muted">
                            No Plan
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Gift className="w-4 h-4 text-yellow-500" />
                          <span className="font-semibold">
                            {customer.loyaltyPoints}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        {customer.totalOrders}
                      </td>

                      <td className="py-4 px-4 text-right font-bold">
                        KES {customer.totalSpent.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-end gap-4 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>

            <button
              onClick={() =>
                setPage((p) =>
                  (p + 1) * PAGE_SIZE < totalCount ? p + 1 : p
                )
              }
              disabled={(page + 1) * PAGE_SIZE >= totalCount}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;
