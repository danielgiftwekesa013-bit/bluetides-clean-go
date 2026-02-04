import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import FAQChatbot from '@/components/chatbot/FAQChatbot'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

import {
  Calendar,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  Gift,
  Crown,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

/* =====================
   TYPES
===================== */
type OrderStatus =
  | 'scheduled'
  | 'processing'
  | 'washed'
  | 'ready_for_delivery'
  | 'delivered'

interface OrderItem {
  id: string
  item_type: string
  quantity: number
  price: number
}

interface Order {
  id: string
  pickup_date: string
  pickup_time_slot: string
  status: OrderStatus
  total_amount: number
  created_at: string
  order_items: OrderItem[]
}

interface UserRow {
  full_name: string
  loyalty_points: number
  total_points: number
}

interface Subscription {
  name: string
  expiry_date: string
}

/* =====================
   STATUS MAP (BLUE THEME)
===================== */
const statusMap: Record<
  OrderStatus,
  { label: string; icon: React.ElementType }
> = {
  scheduled: { label: 'Scheduled', icon: Calendar },
  processing: { label: 'Processing', icon: Package },
  washed: { label: 'Washed', icon: CheckCircle2 },
  ready_for_delivery: { label: 'Out for Delivery', icon: Truck },
  delivered: { label: 'Delivered', icon: CheckCircle2 },
}

const PAGE_SIZE = 10

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  const [userRow, setUserRow] = useState<UserRow | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)

  /* =====================
     AUTH GUARD
  ===================== */
  useEffect(() => {
    if (!isLoading && !user) navigate('/auth', { replace: true })
  }, [user, isLoading, navigate])

  /* =====================
     FETCH DATA
  ===================== */
  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setLoading(true)

      /* USER */
      const { data: userData } = await supabase
        .from('users')
        .select('full_name, loyalty_points, total_points')
        .eq('id', user.id)
        .single()

      setUserRow(userData)

      /* ACTIVE SUBSCRIPTION */
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('expiry_date, subscription_plans(name)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('expiry_date', new Date().toISOString())
        .single()

      if (subData) {
        setSubscription({
          name: subData.subscription_plans.name,
          expiry_date: subData.expiry_date,
        })
      }

      /* ORDERS (LAST 7 DAYS, NOT DELIVERED) */
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: ordersData } = await supabase
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
        .neq('status', 'delivered')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

      setOrders((ordersData || []) as Order[])
      setLoading(false)
    }

    fetchData()
  }, [user, page])

  if (isLoading || loading || !user) return null

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto max-w-5xl px-4">

          {/* WELCOME */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold">Welcome back 👋</h1>
            <p className="text-muted-foreground">{userRow?.full_name}</p>
          </div>

          {/* CTA */}
          <div
            onClick={() => navigate('/schedule')}
            className="mb-12 cursor-pointer rounded-3xl p-6 sm:p-8
              bg-gradient-to-r from-blue-600 to-sky-500 text-white
              hover:scale-[1.01] transition shadow-lg"
          >
            <div className="flex justify-between items-center gap-6">
              <div>
                <h2 className="text-2xl font-bold">Schedule a Pickup</h2>
                <p className="opacity-90">Fast, clean, reliable</p>
              </div>
              <Button variant="secondary" className="gap-2 text-blue-600">
                Schedule
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>

          {/* STATS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* LOYALTY */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-600 to-sky-500 text-white">
              <div className="flex justify-between mb-3">
                <Gift />
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                  Loyalty
                </span>
              </div>
              <p className="text-4xl font-bold">{userRow?.loyalty_points ?? 0}</p>
              <p className="text-sm opacity-90">
                Total points: {userRow?.total_points ?? 0}
              </p>
            </div>

            {/* SUBSCRIPTION */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-600 to-sky-500 text-white">
              <div className="flex justify-between mb-3">
                <Crown />
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                  Subscription
                </span>
              </div>
              {subscription ? (
                <>
                  <p className="text-xl font-semibold">{subscription.name}</p>
                  <p className="text-sm opacity-90">
                    Expires {new Date(subscription.expiry_date).toDateString()}
                  </p>
                </>
              ) : (
                <p className="opacity-90">No active plan</p>
              )}
            </div>

            {/* ORDERS COUNT */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-600 to-sky-500 text-white">
              <div className="flex justify-between mb-3">
                <Package />
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                  Last 7 Days
                </span>
              </div>
              <p className="text-4xl font-bold">{orders.length}</p>
              <p className="text-sm opacity-90">Active orders</p>
            </div>
          </div>

          {/* RECENT ORDERS */}
          <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>

          <div className="space-y-4">
            {orders.map((order) => {
              const Icon = statusMap[order.status].icon

              return (
                <div
                  key={order.id}
                  className="rounded-2xl p-5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900"
                >
                  <div className="flex justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                        <Icon className="text-white" />
                      </div>

                      <div>
                        <p className="font-semibold">Order #{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.order_items.map(i => i.item_type).join(', ')}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} /> {order.pickup_date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {order.pickup_time_slot}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">
                        KES {order.total_amount?.toLocaleString()}
                      </p>
                      <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                        {statusMap[order.status].label}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* PAGINATION */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
            >
              <ChevronLeft size={16} /> Prev
            </Button>

            <Button
              variant="outline"
              disabled={orders.length < PAGE_SIZE}
              onClick={() => setPage(p => p + 1)}
            >
              Next <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </main>

      <FAQChatbot />
    </div>
  )
}

export default Dashboard
