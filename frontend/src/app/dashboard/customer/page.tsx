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
import { getUserOrders, customerAcceptBid, confirmDeliveryPayment, customerAssignOwnDriver } from "@/app/actions/orders"; // ✅ Added customerAssignOwnDriver
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

  // ✅ Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<any>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

  // ✅ NEW: Own Driver Modal State
  const [showOwnDriverModal, setShowOwnDriverModal] = useState(false);
  const [selectedOrderForOwnDriver, setSelectedOrderForOwnDriver] = useState<any>(null);
  const [ownDriverData, setOwnDriverData] = useState({ driver_name: "", driver_phone: "", truck_plate_number: "" });
  const [isSubmittingOwnDriver, setIsSubmittingOwnDriver] = useState(false);

  // ✅ Dispute State
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

      const sortedOrders = (result.orders || []).sort((a: any, b: any) => {
        if ((a.status === "driver_searching" || a.status === "pending_delivery_payment") && !(b.status === "driver_searching" || b.status === "pending_delivery_payment")) return -1;
        if (!(a.status === "driver_searching" || a.status === "pending_delivery_payment") && (b.status === "driver_searching" || b.status === "pending_delivery_payment")) return 1;
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
      addToast({ type: "success", title: "Driver Selected! 🎉", message: "Please proceed to pay the delivery fee to officially assign the driver." });
      await loadOrders();
    } catch (error: any) {
      addToast({ type: "error", title: "Error", message: error.message || "Failed to accept bid" });
    } finally {
      setAcceptingBidId(null);
    }
  };

  // ✅ NEW: Handle Own Driver Submission
  const handleAssignOwnDriver = async () => {
    if (!selectedOrderForOwnDriver || !ownDriverData.driver_name || !ownDriverData.driver_phone || !ownDriverData.truck_plate_number) {
      addToast({ type: "error", title: "Missing Info", message: "Please fill in all driver details." });
      return;
    }

    setIsSubmittingOwnDriver(true);
    try {
      // Default delivery fee if not set (you can adjust this logic or make it an input field)
      const deliveryFee = selectedOrderForOwnDriver.delivery_fee || selectedOrderForOwnDriver.delivery_fee_offer || 5000;

      const result = await customerAssignOwnDriver(selectedOrderForOwnDriver.id, {
        ...ownDriverData,
        delivery_fee: deliveryFee
      });

      if (result.error) {
        addToast({ type: "error", title: "Error", message: result.error });
      } else {
        addToast({ type: "success", title: "Driver Added!", message: "Please complete the delivery fee payment." });
        setShowOwnDriverModal(false);
        setOwnDriverData({ driver_name: "", driver_phone: "", truck_plate_number: "" });
        
        // ✅ Automatically open the payment modal for this order
        const updatedResult = await getUserOrders("customer");
        const updatedOrder = updatedResult.orders?.find((o: any) => o.id === selectedOrderForOwnDriver.id);
        if (updatedOrder) {
          setSelectedOrderForPayment(updatedOrder);
          setShowPaymentModal(true);
        }
        await loadOrders();
      }
    } catch (error: any) {
      addToast({ type: "error", title: "Error", message: error.message || "Failed to assign driver" });
    } finally {
      setIsSubmittingOwnDriver(false);
    }
  };

  const handleOpenPaymentModal = (order: any) => {
    setSelectedOrderForPayment(order);
    setPaymentProof(null);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedOrderForPayment) return;
    setIsConfirmingPayment(true);
    try {
      const result = await confirmDeliveryPayment(selectedOrderForPayment.id, paymentProof || undefined);
      if (result.error) {
        addToast({ type: "error", title: "Error", message: result.error });
      } else {
        addToast({ type: "success", title: "Payment Confirmed! 🎉", message: result.message });
        setShowPaymentModal(false);
        await loadOrders();
      }
    } catch (error: any) {
      addToast({ type: "error", title: "Error", message: error.message || "Failed to confirm payment" });
    } finally {
      setIsConfirmingPayment(false);
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
        addToast({ type: "success", title: "Dispute Reported! 🚨", message: "Our admin team will review this and contact you shortly." });
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
      pending_delivery_payment: "bg-orange-500/10 text-orange-600",
      driver_searching: "bg-blue-500/10 text-blue-600",
      no_driver_available: "bg-red-500/10 text-red-600",
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
      pending_delivery_payment: "Pending Delivery Payment",
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
                    order.status === "driver_searching" || order.status === "pending_delivery_payment" ? "bg-blue-500/5" : ""
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-xl font-bold">{order.material_type}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
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
                      <div className="flex justify-between pt-2 mt-2 border-t border-border">
                        <span className="font-bold text-foreground">Total Order Value</span>
                        <span className="font-bold text-orange-500 text-base">{formatNaira(totalValue)}</span>
                      </div>
                    </div>
                  </div>

                  {/* DRIVER BIDDING SECTION */}
                  {order.status === "driver_searching" && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Truck className="w-5 h-5 text-blue-500" />
                          <h4 className="text-lg font-bold">Driver Bids ({order.driver_bids?.length || 0})</h4>
                        </div>
                        {/* ✅ NEW: Provide Own Driver Button */}
                        <button
                          onClick={() => { setSelectedOrderForOwnDriver(order); setShowOwnDriverModal(true); }}
                          className="text-sm font-semibold text-purple-600 bg-purple-500/10 px-4 py-2 rounded-lg hover:bg-purple-500/20 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <User className="w-4 h-4" /> Provide Your Own Driver
                        </button>
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
                            const isMatchingOffer = order.delivery_fee_offer && bid.bid_amount === order.delivery_fee_offer;
                            return (
                              <motion.div
                                key={bid.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                                  isMatchingOffer ? "bg-green-500/10" : "bg-muted/20"
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
                                  </div>
                                  {bid.driver_message && <p className="text-xs text-muted-foreground italic mt-1">"{bid.driver_message}"</p>}
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
                                      isMatchingOffer ? "bg-green-500 text-white hover:bg-green-600 shadow-green-500/20" : "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20"
                                    }`}
                                  >
                                    {acceptingBidId === bid.id ? <><Loader2 className="w-4 h-4 animate-spin" /> Accepting...</> : <><CheckCircle className="w-4 h-4" /> Accept</>}
                                  </MagneticButton>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ✅ NO DRIVER AVAILABLE SECTION (with Own Driver option) */}
                  {order.status === "no_driver_available" && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-xl text-center">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                        <h4 className="text-lg font-bold text-red-600 mb-2">No EWA Drivers Available</h4>
                        <p className="text-sm text-muted-foreground mb-4">No drivers accepted this job within the time limit.</p>
                        <MagneticButton
                          onClick={() => { setSelectedOrderForOwnDriver(order); setShowOwnDriverModal(true); }}
                          className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/20 inline-flex items-center gap-2"
                        >
                          <User className="w-4 h-4" /> Provide Your Own Driver
                        </MagneticButton>
                      </div>
                    </div>
                  )}

                  {/* PENDING DELIVERY PAYMENT SECTION */}
                  {order.status === "pending_delivery_payment" && order.driver_name && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5 text-orange-500" />
                        <h4 className="text-lg font-bold">Action Required: Pay Delivery Fee</h4>
                      </div>
                      <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl mb-4">
                        <p className="text-sm text-muted-foreground mb-3">You have selected a driver. Please pay the delivery fee to officially assign them to your order.</p>
                        <div className="flex items-center justify-between p-3 bg-background rounded-lg mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Selected Driver</p>
                            <p className="font-semibold">{order.driver_name}</p>
                            <a href={`tel:${order.driver_phone}`} className="text-xs text-orange-500 hover:underline">{order.driver_phone}</a>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Delivery Fee</p>
                            <p className="text-xl font-bold text-orange-500">{formatNaira(order.delivery_fee)}</p>
                          </div>
                        </div>
                        <MagneticButton
                          onClick={() => handleOpenPaymentModal(order)}
                          className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                        >
                          <DollarSign className="w-4 h-4" /> Make Delivery Payment
                        </MagneticButton>
                      </div>
                    </div>
                  )}

                  {/* ASSIGNED DRIVER SECTION */}
                  {(order.status === "driver_assigned" || order.status === "supplier_driver_assigned" || order.status === "loading" || order.status === "in_transit") && order.driver_name && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <h4 className="text-lg font-bold">Assigned Driver</h4>
                      </div>
                      <div className="p-4 bg-green-500/5 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center"><User className="w-5 h-5 text-green-600" /></div>
                          <div>
                            <p className="text-xs text-muted-foreground">Driver Name</p>
                            <p className="font-semibold">{order.driver_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center"><Truck className="w-5 h-5 text-green-600" /></div>
                          <div>
                            <p className="text-xs text-muted-foreground">Vehicle</p>
                            <p className="font-semibold">{order.truck_plate_number || "Not specified"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center"><MapPin className="w-5 h-5 text-green-600" /></div>
                          <div>
                            <p className="text-xs text-muted-foreground">Contact</p>
                            <a href={`tel:${order.driver_phone}`} className="font-semibold text-orange-500 hover:underline">{order.driver_phone}</a>
                          </div>
                        </div>
                      </div>
                      
                      {(order.status === "in_transit" || order.status === "loading" || order.status === "driver_assigned" || order.status === "supplier_driver_assigned") && order.delivery_code && (
                        <div className="mt-6 p-5 bg-orange-500/5 border border-orange-500/20 rounded-xl flex items-start gap-4">
                          <div className="p-3 bg-orange-500 rounded-full flex-shrink-0"><KeyRound className="w-6 h-6 text-white" /></div>
                          <div className="flex-1">
                            <p className="font-bold text-orange-700 dark:text-orange-400 text-base mb-1">Your Secure Delivery Code</p>
                            <p className="text-3xl font-black text-orange-600 dark:text-orange-400 font-mono tracking-widest mt-2 select-all">{order.delivery_code}</p>
                            <p className="text-sm text-muted-foreground mt-2">Share this 4-digit code with the driver <strong>only when they arrive</strong> to confirm delivery and release the escrow payment.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Delivered / Completed State */}
                  {(order.status === "delivered" || order.status === "completed") && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="p-6 bg-emerald-500/5 rounded-xl text-center">
                        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                        <h4 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">Delivery Completed!</h4>
                        <p className="text-sm text-muted-foreground mt-2">This order has been successfully delivered and payment has been released.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ NEW: Provide Your Own Driver Modal */}
      <AnimatePresence>
        {showOwnDriverModal && selectedOrderForOwnDriver && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isSubmittingOwnDriver && setShowOwnDriverModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-purple-600">
                    <Truck className="w-6 h-6" /> Provide Your Own Driver
                  </h3>
                  <button onClick={() => setShowOwnDriverModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl mb-6">
                  <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-2">
                    ⚠️ No EWA drivers accepted within 20 minutes.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You can assign your own driver. A standard delivery fee will still apply to cover platform coordination and escrow security.
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Driver Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={ownDriverData.driver_name}
                      onChange={(e) => setOwnDriverData({...ownDriverData, driver_name: e.target.value})}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-purple-500/20 focus:border-purple-500 transition-all"
                      placeholder="e.g. John Doe"
                      disabled={isSubmittingOwnDriver}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Driver Phone <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      value={ownDriverData.driver_phone}
                      onChange={(e) => setOwnDriverData({...ownDriverData, driver_phone: e.target.value})}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-purple-500/20 focus:border-purple-500 transition-all"
                      placeholder="e.g. 08012345678"
                      disabled={isSubmittingOwnDriver}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Truck Plate Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={ownDriverData.truck_plate_number}
                      onChange={(e) => setOwnDriverData({...ownDriverData, truck_plate_number: e.target.value})}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-purple-500/20 focus:border-purple-500 transition-all"
                      placeholder="e.g. ABC-123-XY"
                      disabled={isSubmittingOwnDriver}
                    />
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Delivery Fee to Pay</p>
                    <p className="text-2xl font-bold text-orange-500">
                      {formatNaira(selectedOrderForOwnDriver.delivery_fee || selectedOrderForOwnDriver.delivery_fee_offer || 5000)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowOwnDriverModal(false)}
                    disabled={isSubmittingOwnDriver}
                    className="flex-1 py-3 rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <MagneticButton 
                    onClick={handleAssignOwnDriver}
                    disabled={isSubmittingOwnDriver}
                    className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmittingOwnDriver ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : (
                      <><CheckCircle className="w-4 h-4" /> Assign & Pay</>
                    )}
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ✅ EXISTING: Delivery Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedOrderForPayment && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isConfirmingPayment && setShowPaymentModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-orange-500" /> Make Delivery Payment
                  </h3>
                  <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-orange-500/10 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
                    <p className="text-2xl font-bold text-orange-500">{formatNaira(selectedOrderForPayment.delivery_fee)}</p>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-xl text-sm">
                    <p className="font-semibold text-foreground mb-2">Transfer to this account:</p>
                    <p className="font-mono text-lg font-bold">1234567890</p>
                    <p className="text-muted-foreground">EWA Logistics Escrow</p>
                    <p className="text-muted-foreground">Opay / Moniepoint</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">⚠️ Please include your Order ID as reference.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Upload Payment Proof (Optional but recommended)</label>
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/20 rounded-xl cursor-pointer hover:bg-muted/30 transition-colors bg-muted/10">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                        className="hidden"
                        disabled={isConfirmingPayment}
                      />
                      {paymentProof ? (
                        <div className="text-center"><p className="text-sm font-medium truncate max-w-[250px]">{paymentProof.name}</p></div>
                      ) : (
                        <div className="text-center"><p className="text-sm font-medium">Click to upload receipt</p></div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    disabled={isConfirmingPayment}
                    className="flex-1 py-3 rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <MagneticButton 
                    onClick={handleConfirmPayment}
                    disabled={isConfirmingPayment}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isConfirmingPayment ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Confirming...</>
                    ) : (
                      <><CheckCircle className="w-4 h-4" /> I Have Paid</>
                    )}
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dispute Modal (Existing) */}
      <AnimatePresence>
        {showDisputeModal && disputeOrderId && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isSubmittingDispute && setShowDisputeModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-red-500">
                    <AlertTriangle className="w-6 h-6" /> Report Dispute
                  </h3>
                  <button onClick={() => setShowDisputeModal(false)} disabled={isSubmittingDispute} className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 bg-red-500/10 rounded-xl mb-6">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">⚠️ Are you experiencing an issue with this delivery?</p>
                  <p className="text-xs text-muted-foreground mt-1">Our admin team will review your dispute and contact you shortly.</p>
                </div>

                <form onSubmit={handleCreateDispute} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Reason for Dispute <span className="text-red-500">*</span></label>
                    <textarea
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-muted/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
                      placeholder="e.g. Driver unreachable, incorrect delivery location, payment issue..."
                      required
                      disabled={isSubmittingDispute}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowDisputeModal(false)} disabled={isSubmittingDispute} className="flex-1 py-3 rounded-xl font-medium hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmittingDispute || !disputeReason.trim()} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
                      {isSubmittingDispute ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><AlertTriangle className="w-4 h-4" /> Submit Dispute</>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}