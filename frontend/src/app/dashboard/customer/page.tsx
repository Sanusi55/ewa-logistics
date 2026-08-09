"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Truck, Clock, CheckCircle, DollarSign, 
  User, MapPin, Calendar, Loader2, AlertCircle, Star, Plus, KeyRound,
  AlertTriangle, X
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserOrders, customerAcceptBid } from "@/app/actions/orders";
import { createDispute } from "@/app/actions/disputes";
import { useToast } from "@/components/providers/toast-provider";
import MagneticButton from "@/components/magnetic-button";
import { SkeletonTable } from "@/components/ui/skeleton";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null);

  // ✅ NEW: Dispute State
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeOrderId, setDisputeOrderId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const result = await getUserOrders("customer");
      
      if (result.error) {
        addToast({ type: "error", title: "Error", message: result.error });
        return;
      }

      // Sort orders: 'driver_searching' first, then by date
      const sortedOrders = (result.orders || []).sort((a: any, b: any) => {
        if (a.status === "driver_searching" && b.status !== "driver_searching") return -1;
        if (a.status !== "driver_searching" && b.status === "driver_searching") return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setOrders(sortedOrders);
    } catch (error: any) {
      console.error("❌ Load orders error:", error);
      addToast({ type: "error", title: "Error", message: "Failed to load orders" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptBid = async (orderId: string, bidId: string) => {
    setAcceptingBidId(bidId);
    try {
      const result = await customerAcceptBid(orderId, bidId);
      
      if (result.error) {
        addToast({ type: "error", title: "Error", message: result.error });
        return;
      }

      addToast({ 
        type: "success", 
        title: "Driver Assigned! 🎉", 
        message: "You have successfully accepted this driver's bid." 
      });
      
      await loadOrders(); // Refresh to show updated status
    } catch (error: any) {
      addToast({ type: "error", title: "Error", message: error.message || "Failed to accept bid" });
    } finally {
      setAcceptingBidId(null);
    }
  };

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeOrderId || !disputeReason.trim()) return;

    setIsSubmittingDispute(true);
    try {
      const result = await createDispute(disputeOrderId, disputeReason, "customer");
      
      if (result.error) {
        addToast({ type: "error", title: "Error", message: result.error });
      } else {
        addToast({ 
          type: "success", 
          title: "Dispute Reported! 🚨", 
          message: "Our admin team will review this and contact you shortly." 
        });
        setShowDisputeModal(false);
        setDisputeReason("");
        setDisputeOrderId(null);
      }
    } catch (error: any) {
      addToast({ type: "error", title: "Error", message: error.message || "Failed to report dispute" });
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending_supplier_acceptance: "bg-yellow-500/10 text-yellow-600",
      driver_searching: "bg-blue-500/10 text-blue-600",
      no_driver_available: "bg-orange-500/10 text-orange-600",
      driver_assigned: "bg-green-500/10 text-green-600",
      supplier_driver_assigned: "bg-purple-500/10 text-purple-600",
      loading: "bg-indigo-500/10 text-indigo-600",
      in_transit: "bg-cyan-500/10 text-cyan-600",
      delivered: "bg-emerald-500/10 text-emerald-600",
      completed: "bg-emerald-500/10 text-emerald-600",
      cancelled: "bg-red-500/10 text-red-600",
    };
    return colors[status] || "bg-gray-500/10 text-gray-600";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending_supplier_acceptance: "Pending Supplier Acceptance",
      driver_searching: "Finding Best Driver",
      no_driver_available: "No Driver Available",
      driver_assigned: "Driver Assigned",
      supplier_driver_assigned: "Supplier Driver Assigned",
      loading: "Loading Material",
      in_transit: "In Transit",
      delivered: "Delivered",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return labels[status] || status.replace(/_/g, " ");
  };

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0);
  };

  if (isLoading) {
    return (
      <div className="pt-24 px-4 md:px-6">
        <div className="max-w-5xl mx-auto"><SkeletonTable rows={5} /></div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4 md:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header with "New Order" Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Orders & Bids</h1>
            <p className="text-muted-foreground">Track your deliveries and choose the best driver for your job.</p>
          </div>
          <Link href="/materials">
            <MagneticButton className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Order
            </MagneticButton>
          </Link>
        </motion.div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-12 rounded-2xl text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
            <Link href="/materials">
              <MagneticButton className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
                Browse Materials
              </MagneticButton>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              // Calculate total dynamically based on available data
              const materialCost = order.total_amount || 0;
              const serviceCharge = order.service_charge || 5000;
              const deliveryFee = order.delivery_fee || 0;
              const totalValue = materialCost + serviceCharge + deliveryFee;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass rounded-2xl p-6 md:p-8 transition-all shadow-sm ${
                    order.status === "driver_searching" ? "bg-blue-500/5" : ""
                  }`}
                >
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-xl font-bold">{order.material_type}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        
                        {/* Report Dispute Button */}
                        {order.status !== "cancelled" && order.status !== "pending_supplier_acceptance" && (
                          <button
                            onClick={() => { setDisputeOrderId(order.id); setShowDisputeModal(true); }}
                            className="ml-auto sm:ml-2 px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" /> Report Dispute
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-orange-500" />
                          <span>{order.tonnage} Tons</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          <span>{order.delivery_location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown Section (Plain, no borders) */}
                  <div className="mb-6 p-4 bg-muted/20 rounded-xl">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Order Cost Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Material Cost</span>
                        <span className="font-medium">{formatNaira(materialCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span className="font-medium">
                          {deliveryFee > 0 
                            ? formatNaira(deliveryFee) 
                            : order.delivery_fee_offer 
                              ? `Your offer: ${formatNaira(order.delivery_fee_offer)}` 
                              : "Pending driver bid"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">EWA Service Charge</span>
                        <span className="font-medium text-orange-500">{formatNaira(serviceCharge)}</span>
                      </div>
                      <div className="flex justify-between pt-2 mt-2">
                        <span className="font-bold text-foreground">Total Order Value</span>
                        <span className="font-bold text-orange-500 text-base">
                          {formatNaira(totalValue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DRIVER BIDDING SECTION (No top border) */}
                  {order.status === "driver_searching" && (
                    <div className="mt-6 pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Truck className="w-5 h-5 text-blue-500" />
                        <h4 className="text-lg font-bold">Driver Bids ({order.driver_bids?.length || 0})</h4>
                      </div>

                      {(!order.driver_bids || order.driver_bids.length === 0) ? (
                        <div className="p-6 bg-muted/20 rounded-xl text-center">
                          <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
                          <p className="font-medium text-muted-foreground">Waiting for drivers to submit bids...</p>
                          <p className="text-xs text-muted-foreground mt-1">Drivers in {order.delivery_location} are being notified.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {order.driver_bids.map((bid: any) => {
                            // ✅ Check if this bid matches the customer's original offer
                            const isMatchingOffer = order.delivery_fee_offer && bid.bid_amount === order.delivery_fee_offer;
                            
                            return (
                              <motion.div
                                key={bid.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                                  isMatchingOffer 
                                    ? "bg-green-500/10" 
                                    : "bg-muted/20"
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <User className="w-4 h-4 text-orange-500" />
                                    <span className="font-semibold text-sm">Verified Driver</span>
                                    {bid.estimated_arrival_minutes && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> ~{bid.estimated_arrival_minutes} mins
                                      </span>
                                    )}
                                    {isMatchingOffer && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Matches your offer
                                      </span>
                                    )}
                                  </div>
                                  {bid.driver_message && (
                                    <p className="text-xs text-muted-foreground italic mt-1">"{bid.driver_message}"</p>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Delivery Fee</p>
                                    <p className="text-xl font-bold text-orange-500">{formatNaira(bid.bid_amount)}</p>
                                  </div>
                                  <MagneticButton
                                    onClick={() => handleAcceptBid(order.id, bid.id)}
                                    disabled={acceptingBidId === bid.id}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                      isMatchingOffer
                                        ? "bg-green-500 text-white hover:bg-green-600 shadow-green-500/20"
                                        : "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20"
                                    }`}
                                  >
                                    {acceptingBidId === bid.id ? (
                                      <><Loader2 className="w-4 h-4 animate-spin" /> Accepting...</>
                                    ) : (
                                      <><CheckCircle className="w-4 h-4" /> Accept</>
                                    )}
                                  </MagneticButton>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ASSIGNED DRIVER SECTION (No top border) */}
                  {(order.status === "driver_assigned" || order.status === "supplier_driver_assigned" || order.status === "loading" || order.status === "in_transit") && order.driver_name && (
                    <div className="mt-6 pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <h4 className="text-lg font-bold">Assigned Driver</h4>
                      </div>
                      <div className="p-4 bg-green-500/5 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Driver Name</p>
                            <p className="font-semibold">{order.driver_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Truck className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Vehicle</p>
                            <p className="font-semibold">{order.truck_plate_number || "Not specified"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Contact</p>
                            <a href={`tel:${order.driver_phone}`} className="font-semibold text-orange-500 hover:underline">
                              {order.driver_phone}
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      {/* Delivery Code Reminder (Subtle border) */}
                      {(order.status === "in_transit" || order.status === "loading" || order.status === "driver_assigned" || order.status === "supplier_driver_assigned") && order.delivery_code && (
                        <div className="mt-6 p-5 bg-orange-500/5 border border-orange-500/20 rounded-xl flex items-start gap-4">
                          <div className="p-3 bg-orange-500 rounded-full flex-shrink-0">
                            <KeyRound className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-orange-700 dark:text-orange-400 text-base mb-1">Your Secure Delivery Code</p>
                            <p className="text-3xl font-black text-orange-600 dark:text-orange-400 font-mono tracking-widest mt-2 select-all">
                              {order.delivery_code}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Share this 4-digit code with the driver <strong>only when they arrive</strong> to confirm delivery and release the escrow payment. Do not share it beforehand.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Delivered / Completed State (No top border) */}
                  {(order.status === "delivered" || order.status === "completed") && (
                    <div className="mt-6 pt-6">
                      <div className="p-6 bg-emerald-500/5 rounded-xl text-center">
                        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                        <h4 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">Delivery Completed!</h4>
                        <p className="text-sm text-muted-foreground mt-2">This order has been successfully delivered and payment has been released to the supplier and driver.</p>
                      </div>
                    </div>
                  )}

                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}