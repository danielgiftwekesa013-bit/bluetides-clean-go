import React, { createContext, useContext, useState, ReactNode } from 'react';

export type OrderStatus = 'scheduled' | 'processing' | 'washed' | 'ready_for_delivery' | 'delivered';

export interface OrderItem {
  service: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  status: OrderStatus;
  pickupDate: string;
  pickupTime: string;
  address: string;
  phone: string;
  totalPrice: number;
  loyaltyPointsEarned: number;
  createdAt: string;
  notes?: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'loyaltyPointsEarned'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrdersByCustomer: (customerId: string) => Order[];
  getOrdersByStatus: (status: OrderStatus) => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Sample orders for demo
const SAMPLE_ORDERS: Order[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    items: [
      { service: 'Clothes Washing', quantity: 5, price: 500 },
      { service: 'Duvet Cleaning', quantity: 1, price: 800 },
    ],
    status: 'scheduled',
    pickupDate: '2025-01-10',
    pickupTime: '10:00',
    address: '123 Main Street, Nairobi',
    phone: '0712345678',
    totalPrice: 1300,
    loyaltyPointsEarned: 13,
    createdAt: '2025-01-07T08:00:00Z',
  },
  {
    id: '2',
    customerId: '1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    items: [
      { service: 'Carpet Cleaning', quantity: 2, price: 1500 },
    ],
    status: 'processing',
    pickupDate: '2025-01-08',
    pickupTime: '14:00',
    address: '123 Main Street, Nairobi',
    phone: '0712345678',
    totalPrice: 1500,
    loyaltyPointsEarned: 15,
    createdAt: '2025-01-06T10:00:00Z',
  },
  {
    id: '3',
    customerId: '3',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    items: [
      { service: 'Shoe Cleaning', quantity: 3, price: 450 },
      { service: 'Blanket Cleaning', quantity: 2, price: 600 },
    ],
    status: 'washed',
    pickupDate: '2025-01-05',
    pickupTime: '09:00',
    address: '456 Oak Avenue, Mombasa',
    phone: '0723456789',
    totalPrice: 1050,
    loyaltyPointsEarned: 10,
    createdAt: '2025-01-04T14:00:00Z',
  },
  {
    id: '4',
    customerId: '4',
    customerName: 'Mike Johnson',
    customerEmail: 'mike@example.com',
    items: [
      { service: 'Mat Cleaning', quantity: 4, price: 800 },
    ],
    status: 'ready_for_delivery',
    pickupDate: '2025-01-03',
    pickupTime: '11:00',
    address: '789 Pine Road, Kisumu',
    phone: '0734567890',
    totalPrice: 800,
    loyaltyPointsEarned: 8,
    createdAt: '2025-01-02T09:00:00Z',
  },
];

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'loyaltyPointsEarned'>) => {
    const loyaltyPointsEarned = Math.floor(orderData.totalPrice / 100);
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      loyaltyPointsEarned,
    };
    setOrders((prev) => [newOrder, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  const getOrdersByCustomer = (customerId: string) => {
    return orders.filter((order) => order.customerId === customerId);
  };

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        getOrdersByCustomer,
        getOrdersByStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
