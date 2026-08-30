"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Shield, BarChart3, Users, Package, Truck, 
  Megaphone, History, Settings, Menu, X, LogOut, MessageSquare, ArrowLeft, Loader2,
  Layers, CreditCard, AlertTriangle, Lock, Key, Smartphone, AlertCircle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { unlockAdminSession } from "@/app/actions/auth";

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
  const [isLocked, setIsLocked] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const currentTab = searchParams.get("tab") || "overview";

  // ✅ UPDATED: Automatic Screen Lock after 1 Minute (60,000ms) of Inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(timeout);
      if (!isLocked) {
        // 1 minute = 60 * 1000 milliseconds
        timeout = setTimeout(() => {
          setIsLocked(true);
        }, 60 * 1000); 
      }
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearTimeout(timeout);
    };
  }, [isLocked]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleNavClick = (tab: string) => {
    setIsSidebarOpen(false);
    router.push(`/admin?tab=${tab}`);
  };

  const handleUnlock = async (formData: FormData) => {
    const result = await unlockAdminSession(formData);
    if (result?.error) {
      alert(result.error); // You can replace this with your toast provider if preferred
    } else {
      setIsLocked(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex overflow-x-hidden relative">
      
      {/* 🔒 AUTO-LOCK SCREEN OVERLAY */}
      {isLocked && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-slate-900 border border-red-900/50 rounded-2xl p-8 shadow-2xl shadow-red-900/20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Session Locked</h2>
              <p className="text-slate-400 text-sm">Inactive for 1 minute. Enter your credentials to unlock.</p>
            </div>

            <form action={handleUnlock} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    name="password"
                    type="password" 
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-white placeholder-slate-600"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">2FA Code</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    name="otpCode"
                    type="text" 
                    required
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-white text-center tracking-[0.5em] font-mono text-xl placeholder-slate-600"
                    placeholder="000000"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:from-red-500 hover:to-red-400 transition-all cursor-pointer shadow-lg shadow-red-900/40"
              >
                <Lock className="w-4 h-4" /> Unlock Session
              </button>
            </form>

            <div className="mt-6 text-center">
              <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-red-400 transition-colors flex items-center justify-center gap-1 mx-auto">
                <LogOut className="w-4 h-4" /> Sign Out Completely
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-30 h-screen w-64 bg-slate-900/95 backdrop-blur-md border-r border-slate-700 
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
        <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-700 px-4 sm:px-6 py-4 flex items-center justify-between">
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