"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  MapPin, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu,
  Sun,
  Moon,
  Users,
  ShieldCheck,
  BarChart3,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import NotificationBell from "@/components/notification-bell";
import { logout } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";

// ✅ FIXED: Menu items now point to the pages that actually exist
const roleMenus: Record<string, { name: string; icon: any; href: string }[]> = {
  customer: [
    { name: "My Orders & Bids", icon: Package, href: "/dashboard/customer" },
    { name: "Live Tracking", icon: MapPin, href: "/dashboard/tracking" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  ],
  supplier: [
    // ✅ "My Orders" now points directly to /dashboard/supplier where we built the view
    { name: "My Orders", icon: Package, href: "/dashboard/supplier" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  ],
  driver: [
    { name: "Available Jobs", icon: Truck, href: "/dashboard/driver/jobs" },
    { name: "My Deliveries", icon: MapPin, href: "/dashboard/driver/deliveries" },
    { name: "Earnings", icon: CreditCard, href: "/dashboard/driver/earnings" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  ],
  admin: [
    { name: "Overview", icon: LayoutDashboard, href: "/admin" },
    { name: "Users", icon: Users, href: "/admin/users" },
    { name: "Orders", icon: Package, href: "/admin/orders" },
    { name: "Settings", icon: Settings, href: "/admin/settings" },
  ],
};

export default function DashboardLayout({ 
  children, 
  user: propUser 
}: { 
  children: React.ReactNode;
  user?: any;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Safely manage user state
  const [currentUser, setCurrentUser] = useState<any>(propUser || null);
  const [isLoadingUser, setIsLoadingUser] = useState(!propUser);

  useEffect(() => {
    setMounted(true);
    
    // Only fetch if propUser is not provided by the parent page
    if (!propUser) {
      const fetchUser = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", user.id)
            .single();
          
          if (profile) {
            setCurrentUser({ ...user, ...profile });
          }
        }
        setIsLoadingUser(false);
      };
      fetchUser();
    } else {
      setIsLoadingUser(false);
    }
  }, [propUser]); // Only re-run if propUser changes

  const userRole = currentUser?.role || "customer";
  const menuItems = roleMenus[userRole] || roleMenus.customer;

  const initials = currentUser?.full_name 
    ? currentUser.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() 
    : "U";

  // Show a clean loading state while fetching the user role
  if (isLoadingUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      
      {/* 📱 Mobile Header */}
      <div className="md:hidden fixed top-0 w-full h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Package className="w-5 h-5 text-orange-500" />
          <span>EWA</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* 🧭 Sidebar */}
      <aside className={`
        fixed md:relative z-40 h-full w-64 bg-background border-r border-border flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">EWA Logistics</span>
          </div>
        </div>

        {/* Dynamic Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard/customer" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
                    ${isActive 
                      ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-orange-500" : ""}`} />
                  {item.name}
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          <form action={logout}>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* 🌑 Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* 🖥️ Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 z-30 mt-16 md:mt-0">
          <h1 className="text-lg font-semibold hidden md:block capitalize">
            {userRole} Dashboard
          </h1>
          <div className="flex items-center gap-4">
            {/* ☀️ Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
            
            {/* 🔔 Notification Bell */}
            <NotificationBell />
            
            {/* 👤 User Avatar & Name */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold">{currentUser?.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:ring-2 ring-orange-500/50 transition-all">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}