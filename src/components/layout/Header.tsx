import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Droplets,
  User,
  LogOut,
  Package,
  Crown,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const isAuthenticated = !!user;

  // ----------------------------------------
  // Supabase Auth Listener
  // ----------------------------------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ----------------------------------------
  // Logout
  // ----------------------------------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.email?.split("@")[0];

  // ----------------------------------------
  // Menu Items (logged-in only)
  // ----------------------------------------
  const profileItems = [
    { label: "Profile", icon: User, action: () => console.log("Open Profile") },
    { label: "Orders", icon: Package, action: () => console.log("Open Orders") },
    { label: "Subscription", icon: Crown, action: () => console.log("Open subscription") },
    { label: "My Points", icon: Sparkles, action: () => console.log("Open Points") },
    { label: "Settings", icon: Settings, action: () => console.log("Open Settings") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center shadow-soft group-hover:shadow-medium transition-all">
              <Droplets className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient">
              Bluetides
            </span>
          </Link>

          {/* Desktop Navigation (ONLY when logged out) */}
          {!isAuthenticated && (
            <nav className="hidden md:flex items-center gap-6">
              <Link className="nav-link" to="/">Home</Link>
              <a className="nav-link" href="#services">Services</a>
              <a className="nav-link" href="#pricing">Pricing</a>
              <a className="nav-link" href="#benefits">Benefits</a>
            </nav>
          )}

          {/* Desktop Auth / Profile */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 hover:shadow-glow transition-all"
                  >
                    <User className="w-4 h-4" />
                    {displayName}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56 glass animate-in fade-in zoom-in-95"
                >
                  {profileItems.map((item) => (
                    <DropdownMenuItem
                      key={item.label}
                      onClick={item.action}
                      className="flex items-center gap-3 cursor-pointer hover:bg-primary/10 hover:text-primary"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button variant="default" onClick={() => navigate("/auth?mode=signup")}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2">
            <nav className="flex flex-col gap-4">
              {!isAuthenticated && (
                <>
                  <Link to="/" className="nav-link">Home</Link>
                  <a href="#services" className="nav-link">Services</a>
                  <a href="#pricing" className="nav-link">Pricing</a>
                  <a href="#benefits" className="nav-link">Benefits</a>
                </>
              )}

              {isAuthenticated && (
                <div className="flex flex-col gap-2">
                  {profileItems.map((item) => (
                    <Button
                      key={item.label}
                      variant="ghost"
                      className="justify-start gap-3 hover:bg-primary/10 hover:text-primary"
                      onClick={() => {
                        item.action();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  ))}

                  <Button
                    variant="destructive"
                    className="justify-start"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
