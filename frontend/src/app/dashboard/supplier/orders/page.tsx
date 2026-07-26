"use client";

import { motion } from "framer-motion";
import { Package, Search, ArrowRight, Clock, CheckCircle, Truck } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserOrders } from "@/app/actions/orders";
import { useToast } from "@/components/providers/toast-provider";
import DashboardLayout from "@/components/dashboard-layout";
import { SkeletonTable } from "@/components/ui/skeleton";

export default function SupplierOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState(searchParams.get("status") || "all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const result = await getUserOrders("supplier");
      if (result.error) {
        addToast({ type: "error", title: "Error", message: result.error });
        return;
      }
      setOrders(result.orders || []);
    } catch (error: any) {
      addToast({ type: "error", title: "Error", message: "Failed to load orders" });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending_supplier_acceptance: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
      driver_searching: "bg-blue-500/10 text-blue-600 border-blue-500/30",
      no_driver_available: "bg-orange-500/10 text-orange-600 border-orange-500/30",
      driver_assigned: "bg-green-500/10 text-green-600 border-green-500/30",
      supplier_driver_assigned: "bg-purple-500/10 text-purple-600 border-purple-500/30",
      loading: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
      in_transit: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
      delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
      cancelled: "bg-red-500/10 text-red-600 border-red-500/30",
    };
    return colors[status] || "bg-gray-500/10 text-gray-600 border-gray-500/30";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending_supplier_acceptance: "Pending Acceptance",
      driver_searching: "Finding Driver",
      no_driver_available: "No Driver Available",
      driver_assigned: "Driver Assigned",
      supplier_driver_assigned: "Your Driver Assigned",
      loading: "Loading",
      in_transit: "In Transit",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return labels[status] || status.replace(/_/g, " ");
  };

  const filteredOrders = orders.filter(order => {
    if (filter === "pending" && !["pending_supplier_acceptance", "driver_searching", "no_driver_available"].includes(order.status)) return false;
    if (filter === "active" && !["driver_assigned", "supplier_driver_assigned", "loading", "in_transit"].includes(order.status)) return false;
    if (filter === "completed" && order.status !== "delivered") return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.material_type?.toLowerCase().includes(query) ||
        order.id?.toLowerCase().includes(query) ||
        order.delivery_location?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="pt-24 px-4 md:px-6"><div className="max-w-7xl mx-auto"><SkeletonTable rows={10} /></div></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pt-24 pb-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Orders</h1>
            <p className="text-muted-foreground">View and manage all your supplier orders</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search by material, order ID, or location..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-orange-500 transition-all" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { value: "all", label: "All", icon: Package },
                { value: "pending", label: "Pending", icon: Clock },
                { value: "active", label: "Active", icon: Truck },
                { value: "completed", label: "Completed", icon: CheckCircle },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.value} onClick={() => setFilter(item.value)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${filter === item.value ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
                    <Icon className="w-4 h-4" /> {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {filteredOrders.length === 0 ? (
              <div className="glass p-12 rounded-2xl border border-border text-center">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Orders Found</h3>
                <p className="text-muted-foreground">{searchQuery || filter !== "all" ? "Try adjusting your filters or search query" : "You haven't received any orders yet"}</p>
              </div>
            ) : (
              <div className="glass rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order ID</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Material</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tonnage</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Location</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order, index) => (
                        <motion.tr key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="border-t border-border hover:bg-muted/30 transition-colors">
                          <td className="p-4"><span className="font-mono text-sm">{order.id.slice(0, 8)}...</span></td>
                          <td className="p-4"><div className="font-medium">{order.material_type}</div></td>
                          <td className="p-4"><span>{order.tonnage} tons</span></td>
                          <td className="p-4 text-sm">{order.delivery_location}</td>
                          <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span></td>
                          <td className="p-4 text-right">
                            <Link href={`/dashboard/supplier/orders/${order.id}`} className="inline-flex items-center gap-1 px-4 py-2 bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500/20 transition-colors text-sm font-medium">
                              View <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}