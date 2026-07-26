"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, Truck, Phone, MessageCircle, Package, Clock, 
  CheckCircle, Navigation, ArrowLeft, ShieldCheck, Star,
  Calendar, User, AlertCircle, Loader2, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { useToast } from "@/components/providers/toast-provider";
import { getOrderById } from "@/app/actions/orders";
import { createClient } from "@/lib/supabase/client";
// ✅ IMPORT THE NEW LIVE MAP COMPONENT
import TrackingMap from "@/components/tracking-map";

interface OrderData {
  id: string;
  total_amount: number;
  status: string;
  delivery_address: string;
  delivery_location: string;
  created_at: string;
  material_type: string;
  tonnage: number;
  pickup_location: string;
  driver_id: string | null;
  driver_name: string | null;
  driver_phone: string | null;
}

const steps = [
  { id: 1, label: "Order Confirmed", desc: "Payment secured in escrow", icon: CheckCircle },
  { id: 2, label: "Driver Assigned", desc: "Verified driver on the way", icon: Truck },
  { id: 3, label: "In Transit", desc: "Live GPS tracking active", icon: Navigation },
  { id: 4, label: "Delivered", desc: "Awaiting your confirmation", icon: MapPin },
];

function TrackingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-64 md:h-96 w-full glass rounded-2xl border border-border animate-pulse" />
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass p-6 rounded-2xl border border-border animate-pulse space-y-4">
          <div className="h-6 w-40 bg-muted rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 w-full bg-muted rounded-xl" />)}
          </div>
        </div>
        <div className="glass p-6 rounded-2xl border border-border animate-pulse space-y-4">
          <div className="h-16 w-16 bg-muted rounded-full mx-auto" />
          <div className="h-4 w-32 bg-muted rounded mx-auto" />
          <div className="h-10 w-full bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  
  const { addToast } = useToast();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    } else {
      setError("No order ID provided");
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId || !order) return;

    // ✅ Listen to 'orders' table for real-time GPS and status updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          const updatedOrder = payload.new as OrderData;
          setOrder(updatedOrder);
          setIsRealtimeActive(true);
          
          if (updatedOrder.status !== order.status) {
            addToast({
              type: "success",
              title: "Order Status Updated! 🚛",
              message: `Status changed to: ${updatedOrder.status.replace(/_/g, " ")}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, order?.status, supabase, addToast]);

  async function fetchOrderData() {
    setIsLoading(true);
    const result = await getOrderById(orderId!);
    
    if (result.error) {
      setError(result.error);
    } else if (result.order) {
      setOrder(result.order as OrderData);
    }
    setIsLoading(false);
  }

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleContact = (type: "call" | "message") => {
    if (type === "call" && order?.driver_phone) {
      window.location.href = `tel:${order.driver_phone}`;
    } else {
      addToast({ 
        type: "info", 
        title: "Chat Feature", 
        message: "In-app messaging coming soon! Please call the driver." 
      });
    }
  };

  const handleManualRefresh = async () => {
    addToast({ type: "info", title: "Refreshing...", message: "Fetching latest order status" });
    await fetchOrderData();
    addToast({ type: "success", title: "Updated!", message: "Order status refreshed" });
  };

  const getCurrentStep = () => {
    if (!order) return 1;
    switch (order.status) {
      case "pending_supplier_acceptance": 
      case "driver_searching": 
      case "no_driver_available": 
        return 1;
      case "driver_assigned": 
      case "supplier_driver_assigned": 
      case "loading": 
        return 2;
      case "in_transit": 
        return 3;
      case "delivered": 
        return 4;
      default: 
        return 1;
    }
  };

  const getUpdates = () => {
    if (!order) return [];
    const updates = [
      { time: formatDate(order.created_at), message: "Order confirmed and payment held in escrow.", type: "success" as const },
    ];
    
    if (["driver_assigned", "supplier_driver_assigned", "loading", "in_transit", "delivered"].includes(order.status)) {
      updates.unshift({ time: "Recently", message: "Driver has been assigned to your delivery.", type: "info" as const });
    }
    if (["loading", "in_transit", "delivered"].includes(order.status)) {
      updates.unshift({ time: "Recently", message: "Material loaded and secured. Departed pickup location.", type: "success" as const });
    }
    if (order.status === "delivered") {
      updates.unshift({ time: "Just now", message: "Delivery completed successfully!", type: "success" as const });
    }
    
    return updates;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <TrackingSkeleton />
      </DashboardLayout>
    );
  }

  if (error || !order) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Unable to Load Tracking</h2>
          <p className="text-muted-foreground mb-6">{error || "Order not found"}</p>
          <Link href="/dashboard/customer">
            <button className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer">
              Back to Orders
            </button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const currentStep = getCurrentStep();
  const updates = getUpdates();
  const trackingId = `TRK-${order.id.slice(0, 8).toUpperCase()}`;
  const orderIdShort = `ORD-${order.id.slice(0, 8).toUpperCase()}`;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/customer">
              <button className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Live Tracking</h1>
              <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                Tracking ID: <span className="font-mono font-semibold text-foreground">{trackingId}</span>
                {order.status === "in_transit" && (
                  <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
                  </span>
                )}
                {isRealtimeActive && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Real-time
                  </span>
                )}
              </p>
            </div>
          </div>
          <button 
            onClick={handleManualRefresh}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-500/20 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* ✅ REAL LIVE GPS MAP COMPONENT */}
            <TrackingMap orderId={order.id} />

            <div className="grid lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 space-y-6">
                <div className="glass p-6 rounded-2xl border border-border">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-orange-500" /> Delivery Progress
                  </h3>
                  <div className="relative">
                    <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-muted" />
                    
                    <div className="space-y-8">
                      {steps.map((step, index) => {
                        const isCompleted = index + 1 < currentStep;
                        const isCurrent = index + 1 === currentStep;
                        const Icon = step.icon;

                        return (
                          <motion.div 
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex items-start gap-4"
                          >
                            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                              isCompleted ? "bg-green-500 border-green-500 text-white" :
                              isCurrent ? "bg-orange-500 border-orange-500 text-white ring-4 ring-orange-500/20" :
                              "bg-background border-muted-foreground/30 text-muted-foreground"
                            }`}>
                              {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 pt-1">
                              <h4 className={`font-semibold ${isCurrent ? "text-orange-500" : "text-foreground"}`}>
                                {step.label}
                              </h4>
                              <p className="text-sm text-muted-foreground">{step.desc}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="glass p-6 rounded-2xl border border-border">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" /> Live Updates
                    {isRealtimeActive && (
                      <span className="ml-auto text-xs text-green-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Auto-updating
                      </span>
                    )}
                  </h3>
                  <div className="space-y-4">
                    {updates.map((update, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                      >
                        <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${update.type === "success" ? "bg-green-500" : "bg-blue-500"}`} />
                        <div>
                          <p className="text-sm text-foreground">{update.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{update.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass p-6 rounded-2xl border border-border text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-2xl font-bold mx-auto ring-4 ring-orange-500/20">
                      {order.driver_name ? order.driver_name.charAt(0).toUpperCase() : "?"}
                    </div>
                    {order.driver_id && (
                      <div className="absolute bottom-0 right-0 bg-green-500 text-white p-1.5 rounded-full border-2 border-background">
                        <Phone className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg">
                    {order.driver_name ? order.driver_name : "Awaiting Driver"}
                  </h3>
                  {order.driver_name && (
                    <div className="flex items-center justify-center gap-1 mt-1 mb-4">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.8</span>
                      <span className="text-xs text-muted-foreground">(Verified Driver)</span>
                    </div>
                  )}
                  
                  {!order.driver_name && (
                    <p className="text-sm text-muted-foreground mb-6">
                      A driver will be assigned to your delivery shortly.
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleContact("call")}
                      disabled={!order.driver_id}
                      className="flex items-center justify-center gap-2 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Phone className="w-4 h-4" /> Call
                    </button>
                    <button 
                      onClick={() => handleContact("message")}
                      disabled={!order.driver_id}
                      className="flex items-center justify-center gap-2 py-2.5 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MessageCircle className="w-4 h-4" /> Message
                    </button>
                  </div>
                </div>

                <div className="glass p-6 rounded-2xl border border-border">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-500" /> Order Summary
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID</span>
                      <span className="font-mono font-medium text-foreground">{orderIdShort}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Material</span>
                      <span className="font-medium text-foreground text-right">{order.material_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className="font-medium text-foreground">{order.tonnage} Tons</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium text-foreground">{formatDate(order.created_at)}</span>
                    </div>
                    <div className="border-t border-border pt-3 mt-3 flex justify-between items-center">
                      <span className="font-semibold">Total Value</span>
                      <span className="text-xl font-bold text-foreground">{formatNaira(order.total_amount)}</span>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Funds are securely held in escrow and will only be released once you confirm delivery.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
}