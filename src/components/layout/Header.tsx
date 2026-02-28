import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Menu,
  X,
  Droplets,
  User,
  LogOut,
  Package,
  Crown,
  Sparkles,
  LogIn,
  UserPlus,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"

const Header: React.FC = () => {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  const isAuthenticated = !!user

  /* =====================
     AUTH LISTENER
  ===================== */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  /* =====================
     LOGOUT
  ===================== */
  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/auth")
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.email?.split("@")[0]

  /* =====================
     USER MENU ITEMS
  ===================== */
  const profileItems = [
    { label: "Profile", icon: User, action: () => navigate("/profile") },
    { label: "Orders", icon: Package, action: () => navigate("/orders") },
    { label: "Subscription", icon: Crown, action: () => navigate("/subscription") },
    { label: "My Points", icon: Sparkles, action: () => navigate("/points") },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050b1a] border-b border-white/10">
      <div className="container mx-auto px-4 ">
        <div className="flex items-center justify-between h-16 ">

          {/* LOGO */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl gradient-ocean flex items-center justify-center shadow-soft group-hover:shadow-medium transition-all">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold tracking-wide text-user-foreground">
              Bluetides Laundry
            </span>
          </Link>

          {/* DESKTOP AUTH / PROFILE */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 border-white/20 text-user-foreground hover:bg-white/10"
                  >
                    <User className="w-4 h-4" />
                    {displayName}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-[#050b1a] text-white border border-white/10"
                >
                  {profileItems.map((item) => (
                    <DropdownMenuItem
                      key={item.label}
                      onClick={item.action}
                      className="flex items-center gap-3 cursor-pointer hover:bg-white/10"
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
                <Button
                  variant="ghost"
                  className="text-user-foreground hover:bg-white/10"
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-soft"
                  onClick={() => navigate("/auth?mode=signup")}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button
            className="md:hidden p-2 rounded-xl text-user-foreground hover:bg-white/10"
            onClick={() => setMobileMenuOpen((p) => !p)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col gap-3">

              {!isAuthenticated && (
                <>
                  <Button
                    variant="default"
                    className="justify-start gap-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white"
                    onClick={() => {
                      navigate("/auth")
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start gap-3 border-white/20 text-user-foreground"
                    onClick={() => {
                      navigate("/auth?mode=signup")
                      setMobileMenuOpen(false)
                    }}
                  >
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </Button>
                </>
              )}

              {isAuthenticated && (
                <>
                  {profileItems.map((item) => (
                    <Button
                      key={item.label}
                      variant="ghost"
                      className="justify-start gap-3 text-user-foreground hover:bg-white/10"
                      onClick={() => {
                        item.action()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  ))}

                  <Button
                    variant="destructive"
                    className="justify-start gap-3"
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
