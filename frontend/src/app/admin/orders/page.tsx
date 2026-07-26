"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Loader2, Key, Eye } from "lucide-react";
import Link from "next/link";
import { getAdminOrders } from "@/app/actions/admin";

export default function AdminOrdersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderFilter, setOrderFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, [orderFilter]);

  async function fetchOrders() {
    setIsLoading(true);
    const result = await getAdminOrders(orderFilter);
    if (result.data) setOrders(result.data);
    setIsLoading(false);
  }

  const formatNaira = (amount: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0);
  
  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const statusConfig: Record<string, { color: string; label: string }> = {
    "pending_supplier_acceptance": { color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", label: "Pending Supplier" },
    "driver_searching": { color: "bg-blue-500/10 text-blue-400 border-blue-500/30", label: "Searching Driver" },
    "no_driver_available": { color: "bg-orange-500/10 text-orange-400 border-orange-500/30", label: "No Driver Available" },
    "driver_assigned": { color: "bg-purple-500/10 text-purple-400 border-purple-500/30", label: "Driver Assigned" },
    "supplier_driver_assigned": { color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30", label: "Supplier Driver" },
    "loading": { color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30", label: "Loading" },
    "in_transit": { color: "bg-blue-500/10 text-blue-400 border-blue-500/30", label: "In Transit" },
    "delivered": { color: "bg-green-500/10 text-green-400 border-green-500/30", label: "Delivered" },
    "cancelled": { color: "bg-red-500/10 text-red-400 border-red-500/30", label: "Cancelled" },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      
      {/* Filters */}
      <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700 flex gap-2 flex-wrap">
        {["all", "pending_supplier_acceptance", "driver_searching", "no_driver_available", "driver_assigned", "supplier_driver_assigned", "loading", "in_transit", "delivered", "cancelled"].map((filter) => (
          <button 
            key={filter} 
            onClick={() => setOrderFilter(filter)}
            className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
              orderFilter === filter 
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white" 
                : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}
          >
            {filter === "all" ? "All" : filter.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/50 text-slate-400">
                <tr>
                  <th className="text-left p-4 font-medium">Order ID</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium hidden lg:table-cell">Material</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Delivery Code</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Status</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Date</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const status = statusConfig[order.status] || { color: "bg-slate-500/10 text-slate-400 border-slate-500/30", label: order.status };
                  return (
                    <tr key={order.id} className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-mono text-xs text-slate-300">
                        ORD-{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="p-4">
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{order.profiles?.full_name || "Unknown"}</p>
                          <p className="text-xs text-slate-400 truncate">{order.profiles?.email}</p>
                        </div>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <p className="text-sm text-white">{order.material_type || "N/A"}</p>
                        <p className="text-xs text-slate-400">{order.tonnage ? `${order.tonnage} Tons` : ""}</p>
                      </td>
                      <td className="p-4 font-semibold text-white">
                        {formatNaira(order.total_amount)}
                      </td>
                      
                      {/* ✅ PREMIUM: 4-Digit Delivery Code Badge */}
                      <td className="p-4">
                        {order.delivery_code ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30 font-mono tracking-wider">
                            <Key className="w-3.5 h-3.5" />
                            {order.delivery_code}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">-</span>
                        )}
                      </td>
                      
                      <td className="p-4 hidden md:table-cell">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-xs hidden md:table-cell">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/dashboard/tracking?id=${order.id}`} target="_blank">
                          <button className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 ml-auto">
                            <Eye className="w-3.5 h-3.5" /> Track & Evidence
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Empty State */}
          {orders.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No orders found for this filter</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}