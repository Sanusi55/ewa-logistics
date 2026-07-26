"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, MapPin, Calendar, Clock, Phone, MessageCircle, 
  Search, Filter, CheckCircle, AlertCircle, XCircle, 
  Package, ArrowUpRight, Navigation, User
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import { useToast } from "@/components/providers/toast-provider";

// Mock Deliveries Data (Using Naira ₦)
const mockDeliveries = [
  { 
    id: "DEL-8821", orderId: "ORD-9921", driver: "Emmanuel Okafor", phone: "+234 803 123 4567", 
    vehicle: "Volvo Tipper (ABC-123-DE)", material: "5 tons 1-Inch Granite", 
    pickup: "Sagamu Quarry, Ogun State", dropoff: "Lekki Phase 1, Lagos", 
    status: "in-transit", earnings: 45000, eta: "2 hours", date: "2026-06-01" 
  },
  { 
    id: "DEL-8818", orderId: "ORD-9918", driver: "Musa Abdullahi", phone: "+234 805 987 6543", 
    vehicle: "Man Diesel (XYZ-456-FG)", material: "10 tons Sharp Sand", 
    pickup: "Ota Sand Pit, Ogun State", dropoff: "Ikeja, Lagos", 
    status: "delivered", earnings: 30000, eta: "Completed", date: "2026-05-28" 
  },
  { 
    id: "DEL-8815", orderId: "ORD-9915", driver: "Unassigned", phone: "N/A", 
    vehicle: "Pending Assignment", material: "20 tons Stone Base", 
    pickup: "Abeokuta Quarry, Ogun State", dropoff: "Wuse 2, Abuja", 
    status: "scheduled", earnings: 85000, eta: "Pending", date: "2026-05-25" 
  },
  { 
    id: "DEL-8810", orderId: "ORD-9910", driver: "John T.", phone: "+234 809 111 2222", 
    vehicle: "Mack Truck (JKL-789-HI)", material: "3 tons 3/4 Granite", 
    pickup: "Ibadan Quarry, Oyo State", dropoff: "Port Harcourt, Rivers", 
    status: "failed", earnings: 0, eta: "Cancelled", date: "2026-05-20" 
  },
  { 
    id: "DEL-8805", orderId: "ORD-9905", driver: "Samuel O.", phone: "+234 802 333 4444", 
    vehicle: "Sinotruk (MNO-012-JK)", material: "8 tons Hardcore Granite", 
    pickup: "Ewekoro Cement, Ogun State", dropoff: "Ibadan, Oyo State", 
    status: "delivered", earnings: 55000, eta: "Completed", date: "2026-05-15" 
  },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  "scheduled": { label: "Scheduled", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30", icon: Clock },
  "in-transit": { label: "In Transit", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", icon: Navigation },
  "delivered": { label: "Delivered", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30", icon: CheckCircle },
  "failed": { label: "Failed / Cancelled", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", icon: XCircle },
};

// Skeleton Loader
function DeliverySkeleton() {
  return (
    <div className="glass p-5 rounded-xl border border-border animate-pulse space-y-4">
      <div className="flex justify-between">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-6 w-24 bg-muted rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-muted rounded" />
        <div className="h-3 w-3/4 bg-muted rounded" />
      </div>
      <div className="flex gap-4 pt-2">
        <div className="h-8 w-20 bg-muted rounded-lg" />
        <div className="h-8 w-20 bg-muted rounded-lg" />
      </div>
    </div>
  );
}

export default function DeliveriesPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredDeliveries = mockDeliveries.filter(delivery => {
    const matchesSearch = 
      delivery.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      delivery.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.dropoff.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.material.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockDeliveries.length,
    active: mockDeliveries.filter(d => d.status === "in-transit" || d.status === "scheduled").length,
    completed: mockDeliveries.filter(d => d.status === "delivered").length,
    totalEarnings: mockDeliveries.reduce((acc, curr) => acc + curr.earnings, 0),
  };

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
  };

  const handleContactDriver = (driver: string, phone: string) => {
    if (phone === "N/A") {
      addToast({ type: "warning", title: "Driver Unassigned", message: "This delivery does not have a driver assigned yet." });
    } else {
      addToast({ type: "success", title: "Opening Chat", message: `Connecting you to ${driver}...` });
      // In a real app, this would open WhatsApp or an in-app chat
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Active Deliveries</h1>
            <p className="text-muted-foreground mt-1">Track your materials from quarry to construction site.</p>
          </div>
          <Link href="/materials">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer shadow-lg shadow-orange-500/20">
              <Package className="w-4 h-4" /> Order Materials
            </button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Deliveries", value: stats.total, icon: Truck, color: "text-orange-500", bg: "bg-orange-500/10" },
            { label: "Active / Scheduled", value: stats.active, icon: Navigation, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Total Driver Earnings", value: formatNaira(stats.totalEarnings), icon: ArrowUpRight, color: "text-purple-500", bg: "bg-purple-500/10" },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-5 rounded-xl border border-border flex items-center justify-between"
            >
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="glass p-4 rounded-xl border border-border flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by Delivery ID, Driver, Material, or Location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg outline-none focus:ring-2 ring-orange-500/20 focus:border-orange-500 text-sm transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
            {["all", "scheduled", "in-transit", "delivered", "failed"].map((status) => (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === status 
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                {status.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Deliveries List */}
        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <DeliverySkeleton key={i} />)
          ) : filteredDeliveries.length > 0 ? (
            <AnimatePresence>
              {filteredDeliveries.map((delivery, index) => {
                const status = statusConfig[delivery.status];
                const StatusIcon = status.icon;
                
                return (
                  <motion.div
                    key={delivery.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass p-5 rounded-xl border border-border hover:border-orange-500/30 transition-all group"
                  >
                    {/* Top Row: ID, Status, Date */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-4 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-foreground">{delivery.id}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${status.bg} ${status.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {delivery.date}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> ETA: {delivery.eta}</span>
                      </div>
                    </div>

                    {/* Middle Row: Route & Details */}
                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      {/* Route Visualization */}
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center pt-1">
                          <div className="w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-500/20" />
                          <div className="w-0.5 h-10 bg-border my-1" />
                          <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-500/20" />
                        </div>
                        <div className="space-y-6 flex-1">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Pickup Location</p>
                            <p className="text-sm font-semibold text-foreground">{delivery.pickup}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Dropoff Location</p>
                            <p className="text-sm font-semibold text-foreground">{delivery.dropoff}</p>
                          </div>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Package className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Material</p>
                            <p className="text-sm font-medium text-foreground">{delivery.material}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Truck className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Vehicle & Driver</p>
                            <p className="text-sm font-medium text-foreground">{delivery.vehicle}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <User className="w-3 h-3" /> {delivery.driver}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <ArrowUpRight className="w-4 h-4 text-green-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Driver Earnings</p>
                            <p className="text-sm font-bold text-green-600 dark:text-green-400">{formatNaira(delivery.earnings)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button 
                        onClick={() => addToast({ type: "info", title: "Tracking Details", message: `Opening live map for ${delivery.id}...` })}
                        className="flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5" /> View Map
                      </button>
                      <button 
                        onClick={() => handleContactDriver(delivery.driver, delivery.phone)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" /> Contact Driver
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 glass rounded-xl border border-border border-dashed">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Truck className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-1">No deliveries found</h3>
              <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filter criteria.</p>
              <button 
                onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}