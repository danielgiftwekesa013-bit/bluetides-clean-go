import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  Droplets,
  LayoutDashboard,
  Package,
  Users,
  TrendingUp,
  LogOut,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/bluetides/dashboard" },
  { label: "Orders", icon: Package, path: "/bluetides/orders" },
  { label: "Customers", icon: Users, path: "/bluetides/customers" },
  { label: "Analytics", icon: TrendingUp, path: "/bluetides/analytics" },
];

interface WasherAdmin {
  id: string;
  email: string;
  role: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<WasherAdmin | null>(null);

  // ----------------------------------------
  // Load auth user + washer role
  // ----------------------------------------
  useEffect(() => {
    const loadAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/bluetides");
        return;
      }

      const { data, error } = await supabase
        .from("washer_one")
        .select("id,email,role")
        .eq("id", user.id)
        .single();

      if (error || !data || data.role !== "admin") {
        navigate("/bluetides");
        return;
      }

      setAdmin(data);
      setLoading(false);
    };

    loadAdmin();
  }, [navigate]);

  // ----------------------------------------
  // Logout
  // ----------------------------------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading || !admin) return null;

  return (
    <div className="admin min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 h-screen",
          "bg-white/5 backdrop-blur-xl",
          "border-r border-white/10",
          "shadow-[0_0_40px_rgba(0,180,255,0.08)]",
          "transition-transform duration-300",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link to="/bluetides/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shadow-inner">
                <Droplets className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <span className="text-lg font-semibold text-white">
                  Bluetides
                </span>
                <p className="text-xs text-muted-foreground tracking-wide">
                  Admin Control
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "sidebar-item group flex items-center gap-3 px-4 py-3 rounded-xl",
                    "transition-all duration-300",
                    isActive
                      ? "active bg-cyan-500/15 text-cyan-400"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <span className="text-cyan-400 font-bold">
                  {admin.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="overflow-hidden">
                <p className="font-medium text-white truncate">
                  {admin.email}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  {admin.role}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-white/10 hover:bg-red-500/10 hover:text-red-400"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 h-16 bg-background/80 backdrop-blur border-b border-white/10 flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <span className="ml-4 font-semibold text-white">
            Admin Panel
          </span>
        </header>

        {/* Page content with animation */}
        <main
          key={location.pathname}
          className="flex-1 p-6 lg:p-8 overflow-y-auto
                     animate-fade-slide"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
