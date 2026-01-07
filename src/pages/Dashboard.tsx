import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders, OrderStatus } from '@/contexts/OrderContext';
import { Gift, Calendar, Package, Truck, Clock, CheckCircle2, ArrowRight, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import FAQChatbot from '@/components/chatbot/FAQChatbot';

const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; color: string }> = {
  scheduled: { label: 'Scheduled', icon: Calendar, color: 'bg-yellow-500' },
  processing: { label: 'Processing', icon: Package, color: 'bg-blue-500' },
  washed: { label: 'Washed', icon: CheckCircle2, color: 'bg-green-500' },
  ready_for_delivery: { label: 'Ready for Delivery', icon: Truck, color: 'bg-purple-500' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'bg-gray-500' },
};

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { orders, getOrdersByCustomer } = useOrders();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const userOrders = getOrdersByCustomer(user.id);
  const activeOrders = userOrders.filter((o) => o.status !== 'delivered');

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome back, <span className="text-gradient">{user.username}</span>!
            </h1>
            <p className="text-muted-foreground">
              Manage your laundry orders and track your rewards.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Loyalty Points */}
            <div className="p-6 rounded-2xl gradient-ocean text-primary-foreground">
              <div className="flex items-center justify-between mb-4">
                <Gift className="w-8 h-8" />
                <span className="text-xs font-medium bg-primary-foreground/20 px-3 py-1 rounded-full">
                  Loyalty Points
                </span>
              </div>
              <p className="text-4xl font-bold mb-2">{user.loyaltyPoints}</p>
              <p className="text-sm opacity-80">
                {100 - (user.loyaltyPoints % 100)} more points to redeem KES 100
              </p>
            </div>

            {/* Subscription */}
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-4">
                <Crown className="w-8 h-8 text-primary" />
                <span className={cn(
                  'text-xs font-medium px-3 py-1 rounded-full',
                  user.subscription?.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {user.subscription?.status === 'active' ? 'Active' : 'No Plan'}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground mb-2">
                {user.subscription?.plan || 'No Subscription'}
              </p>
              <p className="text-sm text-muted-foreground">
                {user.subscription
                  ? `Expires: ${user.subscription.expiresAt}`
                  : 'Subscribe to save more!'}
              </p>
            </div>

            {/* Active Orders */}
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-4">
                <Package className="w-8 h-8 text-primary" />
                <span className="text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                  In Progress
                </span>
              </div>
              <p className="text-4xl font-bold text-foreground mb-2">{activeOrders.length}</p>
              <p className="text-sm text-muted-foreground">Active orders</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 mb-12">
            <Button variant="hero" size="lg" onClick={() => navigate('/schedule')}>
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Pickup
            </Button>
            <Button variant="outline" size="lg">
              View Subscription Plans
            </Button>
          </div>

          {/* Orders Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Your Orders</h2>
              {userOrders.length > 5 && (
                <Button variant="ghost" className="text-primary">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            {userOrders.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-2xl bg-card border border-border">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-6">
                  Schedule your first pickup and experience our premium laundry service!
                </p>
                <Button variant="hero" onClick={() => navigate('/schedule')}>
                  Schedule First Pickup
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.slice(0, 5).map((order) => {
                  const statusInfo = statusConfig[order.status];
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={order.id}
                      className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center',
                            statusInfo.color
                          )}>
                            <StatusIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              Order #{order.id.slice(-6)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.items.map((i) => i.service).join(', ')}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {order.pickupDate}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {order.pickupTime}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-foreground">
                              KES {order.totalPrice.toLocaleString()}
                            </p>
                            <span className={cn(
                              'inline-block text-xs font-medium px-3 py-1 rounded-full mt-1',
                              order.status === 'scheduled' && 'bg-yellow-100 text-yellow-700',
                              order.status === 'processing' && 'bg-blue-100 text-blue-700',
                              order.status === 'washed' && 'bg-green-100 text-green-700',
                              order.status === 'ready_for_delivery' && 'bg-purple-100 text-purple-700',
                              order.status === 'delivered' && 'bg-gray-100 text-gray-700'
                            )}>
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-6">
                        <div className="flex items-center gap-2">
                          {['scheduled', 'processing', 'washed', 'ready_for_delivery'].map((status, idx) => {
                            const statusOrder = ['scheduled', 'processing', 'washed', 'ready_for_delivery'];
                            const currentIdx = statusOrder.indexOf(order.status);
                            const isComplete = idx <= currentIdx;

                            return (
                              <React.Fragment key={status}>
                                <div
                                  className={cn(
                                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                                    isComplete
                                      ? 'gradient-ocean text-primary-foreground'
                                      : 'bg-muted text-muted-foreground'
                                  )}
                                >
                                  {isComplete ? '✓' : idx + 1}
                                </div>
                                {idx < 3 && (
                                  <div
                                    className={cn(
                                      'flex-1 h-1 rounded-full',
                                      idx < currentIdx ? 'gradient-ocean' : 'bg-muted'
                                    )}
                                  />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                          <span>Scheduled</span>
                          <span>Processing</span>
                          <span>Washed</span>
                          <span>Delivery</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <FAQChatbot />
    </div>
  );
};

export default Dashboard;
