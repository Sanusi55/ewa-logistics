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
  Loader2,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import NotificationBell from "@/components/notification-bell";
import { logout } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";

const roleMenus: Record<string, { name: string; icon: any; href: string }[]> = {
  customer: [
    { name: "My Orders & Bids", icon: Package, href: "/dashboard/customer" },
    { name: "Live Tracking", icon: MapPin, href: "/dashboard/tracking" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  ],
  supplier: [
    { name: "My Orders", icon: Package, href: "/dashboard/supplier" },
    { name: "My Materials", icon: LayoutDashboard, href: "/dashboard/supplier/materials" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  ],
  driver: [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard/driver" },
    { name: "My Deliveries", icon: MapPin, href: "/dashboard/driver/deliveries" },
    { name: "Earnings", icon: CreditCard, href: "/dashboard/driver/earnings" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  ],
  admin: [
    { name: "Overview", icon: LayoutDashboard, href: "/admin" },
    { name: "Users", icon: Users, href: "/admin?tab=users" },
    { name: "Orders", icon: Package, href: "/admin?tab=orders" },
    { name: "Settings", icon: Settings, href: "/admin?tab=settings" },
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
  
  const [currentUser, setCurrentUser] = useState<any>(propUser || null);
  const [isLoadingUser, setIsLoadingUser] = useState(!propUser);

  useEffect(() => {
    setMounted(true);
    
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
  }, [propUser]);

  const userRole = currentUser?.role || "customer";
  const menuItems = roleMenus[userRole] || roleMenus.customer;

  const initials = currentUser?.full_name 
    ? currentUser.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() 
    : "U";

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
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Package className="w-5 h-5 text-orange-500" />
          <span>EWA</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)} 
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* 🧭 Sidebar */}
      {/* ✅ BULLETPROOF FIX: "fixed inset-y-0 left-0" guarantees full screen height on mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">EWA Logistics</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="md:hidden p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Menu Items */}
        {/* ✅ min-h-0 is the magic flexbox fix that allows this to shrink and push the footer down */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar min-h-0">
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

        {/* Sign Out Footer */}
        <div className="p-4 border-t border-border bg-background flex-shrink-0">
          <form action={logout}>
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer">
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[45] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* 🖥️ Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Bar */}
        <header className="h-16 flex-shrink-0 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-6 z-30 mt-16 md:mt-0">
          <h1 className="text-lg font-semibold hidden md:block capitalize">
            {userRole} Dashboard
          </h1>
          <div className="md:hidden" /> 
          
          <div className="flex items-center gap-2 md:gap-4">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
            
            <NotificationBell />
            
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
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}