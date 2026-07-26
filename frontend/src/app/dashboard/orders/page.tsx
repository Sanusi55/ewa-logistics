"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Truck, CheckCircle, AlertCircle, Search, 
  Eye, MapPin, Calendar, Plus, XCircle, Clock, 
  Loader2, DollarSign, Star, X, Key, Copy, Check,
  Camera, FileText
} from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard-layout";
import { useToast } from "@/components/providers/toast-provider";
// ✅ FIXED: Import confirmCustomerDelivery instead of confirmDeliveryManually
import { getUserOrders, customerAcceptBid, confirmCustomerDelivery } from "@/app/actions/orders";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  delivery_address: string;
  delivery_location: string;
  created_at: string;
  material_type: string;
  tonnage: number;
  driver_name?: string;
  driver_phone?: string;
  truck_plate_number?: string;
  delivery_code?: string;
  delivery_fee?: number;
  driver_bids?: any[];
  delivery_evidence?: any[];
}

const statusConfig: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  "pending_supplier_acceptance": { label: "Pending Supplier", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/30", icon: Clock },
  "driver_searching": { label: "Awaiting Driver", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", icon: Truck },
  "no_driver_available": { label: "No Driver", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", icon: AlertCircle },
  "driver_assigned": { label: "Driver Assigned", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30", icon: CheckCircle },
  "supplier_driver_assigned": { label: "Supplier Driver", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30", icon: Truck },
  "loading": { label: "Loading", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/30", icon: Package },
  "in_transit": { label: "In Transit", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", icon: Truck },
  "delivered": { label: "Delivered", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30", icon: CheckCircle },
  "cancelled": { label: "Cancelled", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", icon: XCircle },
};

function OrderSkeleton() {
  return (
    <div className="glass p-4 rounded-xl border border-border animate-pulse flex items-center justify-between">
      <div className="space-y-2 flex-1">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-3 w-40 bg-muted rounded" />
      </div>
      <div className="h-8 w-20 bg-muted rounded-full" />
      <div className="h-8 w-8 bg-muted rounded-full" />
    </div>
  );
}

export default function OrdersPage() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showBidsModal, setShowBidsModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<Order | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setIsLoading(true);
    const result = await getUserOrders("customer");
    if (result.error) {
      addToast({ type: "error", title: "Error", message: result.error });
    } else {
      setOrders(result.orders || []);
    }
    setIsLoading(false);
  }

  const handleViewBids = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowBidsModal(true);
  };

  const handleAcceptBid = async (bid: any, orderId: string) => {
    setIsLoading(true);
    const result = await customerAcceptBid(orderId, bid.id);
    if (result.error) {
      addToast({ type: "error", title: "Error", message: result.error });
    } else {
      addToast({ type: "success", title: "Driver Accepted! 🎉", message: result.message });
      setShowBidsModal(false);
      await fetchOrders();
    }
    setIsLoading(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast({ type: "success", title: "Code Copied! 📋", message: "Share this code with your driver to confirm delivery." });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenConfirmModal = (order: Order) => {
    setOrderToConfirm(order);
    setShowConfirmModal(true);
  };

  // ✅ FIXED: Use confirmCustomerDelivery
  const handleConfirmDelivery = async () => {
    if (!orderToConfirm) return;
    setIsConfirming(true);
    const result = await confirmCustomerDelivery(orderToConfirm.id);
    setIsConfirming(false);

    if (result.success) {
      addToast({ type: "success", title: "Delivery Confirmed! 🎉", message: result.message });
      setShowConfirmModal(false);
      setOrderToConfirm(null);
      await fetchOrders();
    } else {
      addToast({ type: "error", title: "Confirmation Failed", message: result.error || "Could not confirm delivery." });
    }
  };

  const filteredOrders = orders.filter(order => {
    const orderShortId = `ORD-${order.id.slice(0, 8).toUpperCase()}`;
    const matchesSearch = 
      orderShortId.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (order.delivery_location && order.delivery_location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.delivery_address && order.delivery_address.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => ["pending_supplier_acceptance", "driver_searching", "no_driver_available"].includes(o.status)).length,
    completed: orders.filter(o => o.status === "delivered").length,
  };

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const shouldShowCode = (order: Order) => {
    return order.delivery_code && ["driver_assigned", "supplier_driver_assigned", "in_transit"].includes(order.status);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Orders</h1>
            <p className="text-muted-foreground mt-1">Track and manage your material purchases.</p>
          </div>
          <Link href="/materials">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer shadow-lg shadow-orange-500/20">
              <Plus className="w-4 h-4" /> New Order
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Orders", value: stats.total, icon: Package, color: "text-orange-500", bg: "bg-orange-500/10" },
            { label: "Active / Pending", value: stats.pending, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
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

        <div className="glass p-4 rounded-xl border border-border flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg outline-none focus:ring-2 ring-orange-500/20 focus:border-orange-500 text-sm transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
            {["all", "pending_supplier_acceptance", "driver_searching", "no_driver_available", "driver_assigned", "supplier_driver_assigned", "loading", "in_transit", "delivered", "cancelled"].map((status) => (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === status 
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
              >
                {status.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <OrderSkeleton key={i} />)
          ) : filteredOrders.length > 0 ? (
            <AnimatePresence>
              {filteredOrders.map((order, index) => {
                const status = statusConfig[order.status] || statusConfig["pending_supplier_acceptance"];
                const StatusIcon = status.icon;
                const orderShortId = `ORD-${order.id.slice(0, 8).toUpperCase()}`;
                const orderBids = order.driver_bids?.filter((b: any) => b.status === "pending") || [];
                const showCode = shouldShowCode(order);
                
                const weighbridge = order.delivery_evidence?.find((e: any) => e.evidence_type === "weighbridge");
                const deliveryProof = order.delivery_evidence?.find((e: any) => e.evidence_type === "proof_of_delivery");

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass p-4 md:p-5 rounded-xl border border-border hover:border-orange-500/30 transition-all group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-sm font-bold text-foreground">{orderShortId}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${status.bg} ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">
                          {order.material_type || "Material Order"} ({order.tonnage} tons)
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(order.created_at)}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.delivery_location}</span>
                        </div>
                        
                        {order.driver_name && (
                          <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-xs text-green-700 dark:text-green-400 font-semibold mb-1 flex items-center gap-1">
                              <Truck className="w-3 h-3" /> Driver Assigned
                            </p>
                            <p className="text-sm font-medium text-foreground">{order.driver_name}</p>
                            {order.truck_plate_number && (
                              <p className="text-xs text-muted-foreground mt-0.5">🚛 {order.truck_plate_number}</p>
                            )}
                            {order.driver_phone && (
                              <a href={`tel:${order.driver_phone}`} className="text-xs text-orange-500 font-medium mt-1 inline-flex items-center gap-1 hover:underline">
                                📞 {order.driver_phone}
                              </a>
                            )}
                          </div>
                        )}

                        <div className="mt-4 space-y-3">
                          {weighbridge && (
                            <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                              <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 bg-indigo-500 rounded-lg">
                                    <FileText className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Weighbridge Ticket</p>
                                    <p className="text-sm text-foreground font-medium">Uploaded by supplier</p>
                                  </div>
                                </div>
                                <a href={weighbridge.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors cursor-pointer">
                                  <Eye className="w-4 h-4" /> View Document
                                </a>
                              </div>
                            </div>
                          )}

                          {deliveryProof && (
                            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                              <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 bg-green-500 rounded-lg">
                                    <Camera className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Delivery Proof</p>
                                    <p className="text-sm text-foreground font-medium">Uploaded by driver</p>
                                    {deliveryProof.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{deliveryProof.notes}"</p>}
                                  </div>
                                </div>
                                <a href={deliveryProof.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors cursor-pointer">
                                  <Eye className="w-4 h-4" /> View Proof
                                </a>
                              </div>
                            </div>
                          )}

                          {showCode && !deliveryProof && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-4 bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent border-2 border-orange-500/30 rounded-xl">
                              <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 bg-orange-500 rounded-lg">
                                    <Key className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Delivery Code</p>
                                    <p className="text-sm text-foreground font-medium">Share this with your driver to confirm delivery</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="font-mono text-3xl md:text-4xl font-black text-orange-500 tracking-widest">
                                    {order.delivery_code}
                                  </div>
                                  <button onClick={() => order.delivery_code && handleCopyCode(order.delivery_code)} className="p-2.5 bg-background hover:bg-muted border border-border rounded-lg transition-colors cursor-pointer" title="Copy Code">
                                    {copiedCode === order.delivery_code ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-muted-foreground" />}
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {deliveryProof && order.status === "in_transit" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent border-2 border-green-500/40 rounded-xl">
                              <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 bg-green-500 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Confirm Delivery</p>
                                    <p className="text-sm text-foreground font-medium">Verify the proof above and confirm delivery is complete</p>
                                  </div>
                                </div>
                                <button onClick={() => handleOpenConfirmModal(order)} className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-colors cursor-pointer shadow-lg shadow-green-500/20">
                                  <CheckCircle className="w-4 h-4" /> Confirm Delivery
                                </button>
                              </div>
                            </motion.div>
                          )}

                          {order.status === "delivered" && (
                            <div className="p-4 bg-green-500/10 border-2 border-green-500/30 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-green-500 rounded-lg">
                                  <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Delivery Complete</p>
                                  <p className="text-sm text-green-700 dark:text-green-400 font-bold">✓ Delivered successfully</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:text-right">
                        <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                        <p className="text-xl font-bold text-orange-500">{formatNaira(order.total_amount)}</p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {orderBids.length > 0 && order.status === "driver_searching" && (
                          <button onClick={() => handleViewBids(order.id)} className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-colors cursor-pointer">
                            <DollarSign className="w-3.5 h-3.5" /> View Bids ({orderBids.length})
                          </button>
                        )}
                        <button onClick={() => addToast({ type: "info", title: "Order Details", message: `Viewing details for ${orderShortId}` })} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 glass rounded-xl border border-border border-dashed">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-1">No orders found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {orders.length === 0 ? "You haven't placed any orders yet. Start by browsing our materials!" : "Try adjusting your search or filter criteria."}
              </p>
              {orders.length === 0 ? (
                <Link href="/materials">
                  <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors cursor-pointer">Browse Materials</button>
                </Link>
              ) : (
                <button onClick={() => { setSearchQuery(""); setStatusFilter("all"); }} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors cursor-pointer">Clear Filters</button>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Bids Modal */}
      <AnimatePresence>
        {showBidsModal && selectedOrderId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBidsModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto border border-border shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="w-7 h-7 text-orange-500" /> Driver Bids</h3>
                  <button onClick={() => setShowBidsModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"><X className="w-6 h-6" /></button>
                </div>
                <div className="space-y-4">
                  {orders.find(o => o.id === selectedOrderId)?.driver_bids?.filter((b: any) => b.status === "pending").map((bid: any, index: number) => (
                    <motion.div key={bid.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="p-5 rounded-xl border-2 border-border hover:border-orange-500/50 transition-all bg-muted/30">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">D</div>
                          <div>
                            <h4 className="font-bold text-lg flex items-center gap-2">Verified Driver <span className="flex items-center gap-1 text-xs text-yellow-500"><Star className="w-3 h-3 fill-yellow-500" /> 4.9</span></h4>
                            {bid.driver_message && <p className="text-sm text-muted-foreground mt-1 italic">"{bid.driver_message}"</p>}
                            {bid.estimated_arrival_minutes && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> ETA: ~{bid.estimated_arrival_minutes} mins</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Delivery Fee</p>
                          <p className="text-2xl font-bold text-orange-500">{formatNaira(bid.bid_amount)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-border">
                        <button onClick={() => handleAcceptBid(bid, selectedOrderId)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors cursor-pointer shadow-lg shadow-orange-500/20">
                          <CheckCircle className="w-4 h-4" /> Accept This Driver
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {(!orders.find(o => o.id === selectedOrderId)?.driver_bids?.filter((b: any) => b.status === "pending").length) && (
                  <div className="text-center py-12">
                    <Truck className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                    <p className="text-muted-foreground">No bids yet. Drivers are reviewing your delivery.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirm Delivery Modal */}
      <AnimatePresence>
        {showConfirmModal && orderToConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isConfirming && setShowConfirmModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto border border-border shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2"><CheckCircle className="w-6 h-6 text-green-500" /> Confirm Delivery</h3>
                  <button onClick={() => setShowConfirmModal(false)} disabled={isConfirming} className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer disabled:opacity-50"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium mb-2">⚠️ Please verify before confirming</p>
                    <p className="text-xs text-muted-foreground">Once you confirm, the delivery will be marked as complete and payment will be released to the supplier.</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground mb-2">Order Summary</p>
                    <p className="font-bold text-foreground">{orderToConfirm.material_type}</p>
                    <p className="text-sm text-muted-foreground mt-1">{orderToConfirm.tonnage} tons</p>
                  </div>
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">✓ By clicking confirm, you acknowledge that:</p>
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                      <li>Material has been delivered to your location</li>
                      <li>Quantity and quality meet your expectations</li>
                      <li>Payment will be released to the supplier</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowConfirmModal(false)} disabled={isConfirming} className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer disabled:opacity-50">Cancel</button>
                  <button onClick={handleConfirmDelivery} disabled={isConfirming} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors cursor-pointer shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isConfirming ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming...</> : <><CheckCircle className="w-4 h-4" /> Confirm Delivery</>}
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