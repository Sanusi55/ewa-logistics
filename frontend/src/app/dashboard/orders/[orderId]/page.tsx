"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { MapPin, Phone, MessageSquare, Star, CheckCircle2, Clock, Truck, Package, Loader2, AlertCircle } from "lucide-react";
import { getOrderById } from "@/app/actions/orders";
import { useToast } from "@/components/providers/toast-provider";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const { addToast } = useToast();

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      setIsLoading(true);
      const result = await getOrderById(orderId);
      if (result.error) {
        setError(result.error);
        addToast({ type: "error", title: "Error", message: result.error });
      } else {
        setOrder(result.order);
      }
      setIsLoading(false);
    }
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, addToast]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !order) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold">Order Not Found</h2>
          <p className="text-muted-foreground">{error || "We couldn't find the details for this order."}</p>
        </div>
      </DashboardLayout>
    );
  }

  // Map status to timeline steps
  const getStatusStep = (status: string) => {
    const statusMap: Record<string, number> = {
      "pending_payment": 0,
      "pending_supplier_acceptance": 1,
      "driver_searching": 2,
      "driver_assigned": 3,
      "supplier_driver_assigned": 3,
      "loading": 3,
      "in_transit": 4,
      "delivered": 5,
      "completed": 5,
      "cancelled": -1,
    };
    return statusMap[status] || 0;
  };

  const currentStep = getStatusStep(order.status);

  const steps = [
    { title: "Order Placed", done: currentStep >= 0 },
    { title: "Supplier Confirmed", done: currentStep >= 1 },
    { title: "Driver Assigned", done: currentStep >= 2 },
    { title: "In Transit", done: currentStep >= 3, active: currentStep === 3 },
    { title: "Delivered", done: currentStep >= 4 },
  ];

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
            <p className="text-sm text-muted-foreground mt-1">Placed on {formatDate(order.created_at)}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${
            order.status === 'delivered' || order.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse'
          }`}>
            {order.status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Timeline & Locations */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass p-6 rounded-xl">
              <h3 className="font-semibold mb-4">Delivery Timeline</h3>
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                        step.done ? "bg-green-500 border-green-500 text-white" : 
                        step.active ? "border-blue-500 bg-white dark:bg-slate-900" : "border-muted text-muted"
                      }`}>
                        {step.done && <CheckCircle2 className="w-3 h-3" />}
                        {step.active && <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />}
                      </div>
                      {i < steps.length - 1 && <div className={`w-0.5 h-8 ${step.done ? "bg-green-500" : "bg-muted"}`} />}
                    </div>
                    <div className={`pb-6 ${!step.done && !step.active ? "opacity-50" : ""}`}>
                      <p className={`font-medium ${step.active ? "text-blue-500" : ""}`}>{step.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ✅ UPDATED: Shows Exact Pickup and Delivery Locations */}
            <div className="glass p-6 rounded-xl">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" /> Route Details
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-500/20 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Exact Pickup Location</p>
                    <p className="text-sm font-semibold text-foreground">{order.pickup_location || "Supplier Warehouse"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-500/20 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Delivery Location</p>
                    <p className="text-sm font-semibold text-foreground">{order.delivery_location}</p>
                    <p className="text-xs text-muted-foreground mt-1">{order.delivery_address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="glass p-6 rounded-xl h-64 relative overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <div className="absolute inset-0 grid-pattern opacity-30" />
              <div className="text-center z-10">
                <MapPin className="w-8 h-8 text-primary mx-auto mb-2 animate-bounce" />
                <p className="font-medium">Live GPS Tracking</p>
                <p className="text-sm text-muted-foreground">Mapbox / Google Maps integration coming next!</p>
              </div>
            </div>
          </div>

          {/* Right: Driver & Order Info */}
          <div className="space-y-6">
            {order.driver_name && (
              <div className="glass p-6 rounded-xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-orange-500" /> Your Driver
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                    {order.driver_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold">{order.driver_name}</p>
                    {order.truck_plate_number && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Truck className="w-3 h-3" /> {order.truck_plate_number}
                      </p>
                    )}
                  </div>
                </div>
                {order.driver_phone && (
                  <a href={`tel:${order.driver_phone}`} className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium cursor-pointer shadow-lg shadow-orange-500/20">
                    <Phone className="w-4 h-4" /> Call Driver
                  </a>
                )}
              </div>
            )}

            <div className="glass p-6 rounded-xl">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" /> Order Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Material</span>
                  <span className="font-medium text-right">{order.material_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{order.tonnage} Tons</span>
                </div>
                {order.delivery_fee && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-medium">{formatNaira(order.delivery_fee)}</span>
                  </div>
                )}
                <div className="h-px bg-border" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total Amount</span>
                  <span className="text-orange-500">{formatNaira(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}