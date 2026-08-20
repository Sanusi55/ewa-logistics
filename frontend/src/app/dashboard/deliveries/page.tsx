"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, MapPin, Calendar, Clock, Phone, MessageCircle, 
  Search, Filter, CheckCircle, AlertCircle, XCircle, 
  Package, ArrowUpRight, Navigation, User, Loader2, Plus
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import { useToast } from "@/components/providers/toast-provider";
import { createClient } from "@/lib/supabase/client";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  "scheduled": { label: "Scheduled", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30", icon: Clock },
  "loading": { label: "Loading", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", icon: Package },
  "in_transit": { label: "In Transit", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", icon: Navigation },
  "delivered": { label: "Delivered", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30", icon: CheckCircle },
  "completed": { label: "Completed", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30", icon: CheckCircle },
  "cancelled": { label: "Cancelled", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", icon: XCircle },
};

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
    </div>
  );
}

export default function DeliveriesPage() {
  const { addToast } = useToast();
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  
  // Assignment Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [assignTruckId, setAssignTruckId] = useState("");
  const [assignDriverId, setAssignDriverId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchDeliveriesData();
  }, []);

  async function fetchDeliveriesData() {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }

    // 1. Fetch Deliveries assigned to this Fleet Company
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        material_type,
        tonnage,
        pickup_location,
        delivery_location,
        status,
        delivery_fee,
        truck_id,
        driver_id,
        created_at,
        trucks (truck_name, plate_number),
        profiles!orders_driver_id_fkey (full_name, phone)
      `)
      .eq("fleet_company_id", user.id)
      .order("created_at", { ascending: false });

    if (!ordersError && ordersData) {
      setDeliveries(ordersData);
    }

    // 2. Fetch Fleet's Trucks and Drivers for the assignment dropdown
    const { data: trucksData } = await supabase.from("trucks").select("id, truck_name, plate_number, status").eq("company_id", user.id).eq("status", "active");
    if (trucksData) setTrucks(trucksData);

    const { data: driversData } = await supabase.from("fleet_drivers").select("id, full_name, phone, truck_id, status").eq("company_id", user.id).eq("status", "active");
    if (driversData) setDrivers(driversData);

    setIsLoading(false);
  }

  const handleOpenAssignModal = (delivery: any) => {
    setSelectedDelivery(delivery);
    setAssignTruckId(delivery.truck_id || "");
    setAssignDriverId(delivery.driver_id || "");
    setShowAssignModal(true);
  };

  const handleAssignDelivery = async () => {
    if (!selectedDelivery || !assignTruckId || !assignDriverId) {
      addToast({ type: "error", title: "Error", message: "Please select both a truck and a driver." });
      return;
    }

    setIsAssigning(true);
    const { error } = await supabase
      .from("orders")
      .update({ 
        truck_id: assignTruckId, 
        driver_id: assignDriverId,
        status: "loading" // Move to loading once assigned
      })
      .eq("id", selectedDelivery.id);

    if (error) {
      addToast({ type: "error", title: "Error", message: error.message });
    } else {
      addToast({ type: "success", title: "Assigned!", message: "Truck and driver successfully assigned to this delivery." });
      setShowAssignModal(false);
      fetchDeliveriesData(); // Refresh data
    }
    setIsAssigning(false);
  };

  const filteredDeliveries = deliveries.filter((delivery: any) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      delivery.id.toLowerCase().includes(searchLower) || 
      (delivery.profiles?.full_name || "").toLowerCase().includes(searchLower) ||
      delivery.delivery_location.toLowerCase().includes(searchLower) ||
      delivery.material_type.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === "all" || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: deliveries.length,
    active: deliveries.filter((d: any) => ["scheduled", "loading", "in_transit"].includes(d.status)).length,
    completed: deliveries.filter((d: any) => ["delivered", "completed"].includes(d.status)).length,
    totalEarnings: deliveries
      .filter((d: any) => ["delivered", "completed"].includes(d.status))
      .reduce((acc: number, curr: any) => acc + (curr.delivery_fee * 0.95), 0), // 5% commission deducted
  };

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Fleet Deliveries</h1>
            <p className="text-muted-foreground mt-1">Manage and track all deliveries assigned to your fleet.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Deliveries", value: stats.total, icon: Truck, color: "text-orange-500", bg: "bg-orange-500/10" },
            { label: "Active / Loading", value: stats.active, icon: Navigation, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Net Fleet Earnings", value: formatNaira(stats.totalEarnings), icon: ArrowUpRight, color: "text-purple-500", bg: "bg-purple-500/10" },
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
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {["all", "scheduled", "loading", "in_transit", "completed", "cancelled"].map((status) => (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === status 
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                {status.replace("_", " ")}
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
              {filteredDeliveries.map((delivery: any, index: number) => {
                const status = statusConfig[delivery.status] || statusConfig["scheduled"];
                const StatusIcon = status.icon;
                const driverName = delivery.profiles?.full_name || "Unassigned";
                const truckInfo = delivery.trucks ? `${delivery.trucks.truck_name} (${delivery.trucks.plate_number})` : "Pending Assignment";
                
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
                        <span className="font-mono text-sm font-bold text-foreground">ORD-{delivery.id.slice(0, 8).toUpperCase()}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${status.bg} ${status.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatDate(delivery.created_at)}</span>
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
                            <p className="text-sm font-semibold text-foreground">{delivery.pickup_location}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Dropoff Location</p>
                            <p className="text-sm font-semibold text-foreground">{delivery.delivery_location}</p>
                          </div>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Package className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Material</p>
                            <p className="text-sm font-medium text-foreground">{delivery.tonnage} Tons {delivery.material_type}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Truck className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Vehicle & Driver</p>
                            <p className="text-sm font-medium text-foreground">{truckInfo}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <User className="w-3 h-3" /> {driverName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <ArrowUpRight className="w-4 h-4 text-green-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Fleet Net Earnings (95%)</p>
                            <p className="text-sm font-bold text-green-600 dark:text-green-400">
                              {delivery.status === "completed" || delivery.status === "delivered" ? formatNaira(delivery.delivery_fee * 0.95) : "Pending"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      {delivery.status === "scheduled" && (
                        <button 
                          onClick={() => handleOpenAssignModal(delivery)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer shadow-lg shadow-orange-500/20"
                        >
                          <Plus className="w-3.5 h-3.5" /> Assign Truck & Driver
                        </button>
                      )}
                      <button 
                        onClick={() => addToast({ type: "info", title: "Tracking", message: "Live map tracking coming soon!" })}
                        className="flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5" /> View Map
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

      {/* Assign Truck & Driver Modal */}
      <AnimatePresence>
        {showAssignModal && selectedDelivery && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => !isAssigning && setShowAssignModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto shadow-2xl border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Truck className="w-6 h-6 text-orange-500" /> Assign Resources
                  </h3>
                  <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 bg-muted/50 rounded-xl mb-6">
                  <p className="text-xs text-muted-foreground mb-1">Delivery Details</p>
                  <p className="font-bold">{selectedDelivery.tonnage} Tons {selectedDelivery.material_type}</p>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {selectedDelivery.delivery_location}
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Select Truck <span className="text-red-500">*</span></label>
                    <select 
                      value={assignTruckId} 
                      onChange={(e) => setAssignTruckId(e.target.value)}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
                    >
                      <option value="">Choose a truck...</option>
                      {trucks.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.truck_name} ({t.plate_number})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Select Driver <span className="text-red-500">*</span></label>
                    <select 
                      value={assignDriverId} 
                      onChange={(e) => setAssignDriverId(e.target.value)}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
                    >
                      <option value="">Choose a driver...</option>
                      {drivers.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.full_name} ({d.phone})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowAssignModal(false)}
                    disabled={isAssigning}
                    className="flex-1 py-3 rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAssignDelivery}
                    disabled={isAssigning || !assignTruckId || !assignDriverId}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isAssigning ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Assigning...</>
                    ) : (
                      <><CheckCircle className="w-4 h-4" /> Confirm Assignment</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}