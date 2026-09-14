"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, Package, Truck, Wallet, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";

export default function DriverSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  // Helper to check if a link is currently active
  const isActive = (tab: string) => {
    if (tab === "dashboard") return pathname === "/dashboard/driver" && !currentTab;
    return currentTab === tab;
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-background border-r border-border hidden md:flex md:flex-col">
      {/* Logo Area */}
      <div className="p-6 border-b border-border">
        <h2 className="text-2xl font-bold text-orange-500">EWA Logistics</h2>
        <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wider">Driver Portal</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <Link
          href="/dashboard/driver"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive("dashboard") 
              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium">Overview</span>
        </Link>

        <Link
          href="/dashboard/driver?tab=jobs"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive("jobs") 
              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="font-medium">Available Jobs</span>
        </Link>

        <Link
          href="/dashboard/driver?tab=deliveries"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive("deliveries") 
              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="font-medium">My Deliveries</span>
        </Link>

        <Link
          href="/dashboard/driver?tab=earnings"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            isActive("earnings") 
              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="font-medium">Earnings</span>
        </Link>
      </nav>

      {/* Logout Area */}
      <div className="p-4 border-t border-border">
        <form action={logout}>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-medium cursor-pointer">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}