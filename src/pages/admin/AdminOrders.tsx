import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { useOrders, OrderStatus } from '@/contexts/OrderContext';
import { Button } from '@/components/ui/button';
import { Package, Calendar, Clock, MapPin, Phone, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const statusFlow: OrderStatus[] = ['scheduled', 'processing', 'washed', 'ready_for_delivery', 'delivered'];

const statusConfig: Record<OrderStatus, { label: string; nextLabel?: string; color: string }> = {
  scheduled: { label: 'Scheduled', nextLabel: 'Mark as Picked', color: 'bg-yellow-500' },
  processing: { label: 'Processing', nextLabel: 'Mark as Washed', color: 'bg-blue-500' },
  washed: { label: 'Washed', nextLabel: 'Ready for Delivery', color: 'bg-green-500' },
  ready_for_delivery: { label: 'Ready for Delivery', nextLabel: 'Mark as Delivered', color: 'bg-purple-500' },
  delivered: { label: 'Delivered', color: 'bg-gray-500' },
};

const AdminOrders: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { orders, updateOrderStatus } = useOrders();
  const { toast } = useToast();

  const tabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'scheduled', label: 'Scheduled', count: orders.filter((o) => o.status === 'scheduled').length },
    { id: 'picked', label: 'Picked (Processing)', count: orders.filter((o) => o.status === 'processing').length },
    { id: 'washed', label: 'Washed', count: orders.filter((o) => o.status === 'washed').length },
    { id: 'delivery', label: 'Ready for Delivery', count: orders.filter((o) => o.status === 'ready_for_delivery').length },
  ];

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'scheduled':
        return orders.filter((o) => o.status === 'scheduled');
      case 'picked':
        return orders.filter((o) => o.status === 'processing');
      case 'washed':
        return orders.filter((o) => o.status === 'washed');
      case 'delivery':
        return orders.filter((o) => o.status === 'ready_for_delivery');
      default:
        return orders;
    }
  };

  const handleStatusUpdate = (orderId: string, currentStatus: OrderStatus) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1];
      updateOrderStatus(orderId, nextStatus);
      toast({
        title: 'Status Updated',
        description: `Order status changed to ${statusConfig[nextStatus].label}`,
      });
    }
  };

  const filteredOrders = getFilteredOrders();

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
          <p className="text-muted-foreground">View and manage all customer orders</p>
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
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs',
                activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20'
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-card border border-border">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                There are no orders in this category.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const status = statusConfig[order.status];
              const canProgress = order.status !== 'delivered';

              return (
                <div
                  key={order.id}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', status.color)}>
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-bold text-foreground text-lg">
                              Order #{order.id.slice(-6)}
                            </h3>
                            <span className={cn(
                              'px-3 py-1 rounded-full text-xs font-medium',
                              order.status === 'scheduled' && 'bg-yellow-100 text-yellow-700',
                              order.status === 'processing' && 'bg-blue-100 text-blue-700',
                              order.status === 'washed' && 'bg-green-100 text-green-700',
                              order.status === 'ready_for_delivery' && 'bg-purple-100 text-purple-700',
                              order.status === 'delivered' && 'bg-gray-100 text-gray-700'
                            )}>
                              {status.label}
                            </span>
                          </div>
                          
                          <p className="text-foreground font-medium mt-1">{order.customerName}</p>
                          <p className="text-sm text-muted-foreground">{order.customerEmail}</p>

                          <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
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

                          <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{order.address}</span>
                          </div>

                          {/* Items */}
                          <div className="mt-4 p-4 rounded-xl bg-muted/50">
                            <p className="text-sm font-medium text-foreground mb-2">Items:</p>
                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {item.service} × {item.quantity}
                                  </span>
                                  <span className="font-medium text-foreground">
                                    KES {item.price.toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-2xl font-bold text-foreground">
                          KES {order.totalPrice.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          +{order.loyaltyPointsEarned} points
                        </p>
                      </div>

                      {canProgress && (
                        <Button
                          variant="hero"
                          onClick={() => handleStatusUpdate(order.id, order.status)}
                        >
                          {status.nextLabel}
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
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
