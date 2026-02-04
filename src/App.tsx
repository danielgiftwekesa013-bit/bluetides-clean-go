import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrderProvider } from "@/contexts/OrderContext";
import LenisProvider from "@/providers/LenisProvider";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Subscription from "./pages/Subscription";
import Points from "./pages/Points";

const queryClient = new QueryClient();

/**
 * Admin-only providers
 * Keeps OrderContext scoped to admin pages
 */
const AdminProviders = ({ children }: { children: React.ReactNode }) => (
  <OrderProvider>{children}</OrderProvider>
);

/**
 * User-only wrapper
 * Enables water / blue animated theme
 */
const UserLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="user min-h-screen relative">{children}</div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* 🌊 GLOBAL SMOOTH SCROLL */}
    <LenisProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Routes>
              {/* ================= USER / PUBLIC ROUTES ================= */}
              <Route
                path="/"
                element={
                  <UserLayout>
                    <Index />
                  </UserLayout>
                }
              />

              <Route
                path="/auth"
                element={
                  <UserLayout>
                    <Auth />
                  </UserLayout>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <UserLayout>
                    <Dashboard />
                  </UserLayout>
                }
              />

              <Route
                path="/profile"
                element={
                  <UserLayout>
                    <Profile />
                  </UserLayout>
                }
              />

              <Route
                path="/orders"
                element={
                  <UserLayout>
                    <Orders />
                  </UserLayout>
                }
              />

              <Route
                path="/subscription"
                element={
                  <UserLayout>
                    <Subscription />
                  </UserLayout>
                }
              />

              <Route
                path="/points"
                element={
                  <UserLayout>
                    <Points />
                  </UserLayout>
                }
              />

              <Route
                path="/schedule"
                element={
                  <UserLayout>
                    <Schedule />
                  </UserLayout>
                }
              />

              {/* ================= ADMIN ROUTES ================= */}
              <Route path="/bluetides" element={<AdminLogin />} />

              <Route
                path="/bluetides/dashboard"
                element={
                  <AdminProviders>
                    <AdminDashboard />
                  </AdminProviders>
                }
              />

              <Route
                path="/bluetides/orders"
                element={
                  <AdminProviders>
                    <AdminOrders />
                  </AdminProviders>
                }
              />

              <Route
                path="/bluetides/customers"
                element={
                  <AdminProviders>
                    <AdminCustomers />
                  </AdminProviders>
                }
              />

              <Route
                path="/bluetides/analytics"
                element={
                  <AdminProviders>
                    <AdminAnalytics />
                  </AdminProviders>
                }
              />

              {/* ================= CATCH ALL ================= */}
              <Route
                path="*"
                element={
                  <UserLayout>
                    <NotFound />
                  </UserLayout>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LenisProvider>
  </QueryClientProvider>
);

export default App;
