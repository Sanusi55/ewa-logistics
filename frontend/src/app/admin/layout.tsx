"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Shield, BarChart3, Users, Package, Truck, 
  Megaphone, History, Settings, Menu, X, LogOut, MessageSquare, ArrowLeft, Loader2,
  Layers, CreditCard, AlertTriangle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { name: "Overview", tab: "overview", icon: BarChart3 },
  { name: "Users", tab: "users", icon: Users },
  { name: "Listings", tab: "listings", icon: Layers },
  { name: "Orders", tab: "orders", icon: Package },
  { name: "Deliveries", tab: "deliveries", icon: Truck },
  { name: "Payments", tab: "payments", icon: CreditCard },
  { name: "Disputes", tab: "disputes", icon: AlertTriangle },
  { name: "Messages", tab: "messages", icon: MessageSquare },
  { name: "Broadcast", tab: "broadcast", icon: Megaphone },
  { name: "Audit Logs", tab: "audit", icon: History },
  { name: "Settings", tab: "settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    }>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const currentTab = searchParams.get("tab") || "overview";

  // ✅ UPDATED: Automatic Session Timeout (5 Minutes of Inactivity)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(timeout);
      // Set timeout for 5 minutes (5 * 60 * 1000 milliseconds = 300,000ms)
      timeout = setTimeout(async () => {
        await supabase.auth.signOut();
        router.push("/login");
      }, 5 * 60 * 1000); 
    };

    // List of events that count as "activity"
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    // Add event listeners to the window
    events.forEach(event => window.addEventListener(event, resetTimer));
    
    // Start the timer initially
    resetTimer();

    // Cleanup function to remove listeners and clear timeout when component unmounts
    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearTimeout(timeout);
    };
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleNavClick = (tab: string) => {
    setIsSidebarOpen(false);
    router.push(`/admin?tab=${tab}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex overflow-x-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900/95 backdrop-blur-md border-r border-slate-700 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg shadow-red-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-white text-lg">EWA Admin</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => handleNavClick(item.tab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                  isActive
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen w-full overflow-x-hidden">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-700 px-4 sm:px-6 py-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white mr-4">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1" /> 
          
          <Link href="/">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </button>
          </Link>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}