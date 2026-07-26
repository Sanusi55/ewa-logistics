"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Package, MapPin, Clock, CheckCircle, Truck, DollarSign, User, Phone, AlertCircle, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getOrderById, supplierAcceptOrder, supplierUseOwnDriver } from "@/app/actions/orders";
import { useToast } from "@/components/providers/toast-provider";
import DashboardLayout from "@/components/dashboard-layout";
import MagneticButton from "@/components/magnetic-button";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isAssigningDriver, setIsAssigningDriver] = useState(false);
  const [materialPrice, setMaterialPrice] = useState("");
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [driverData, setDriverData] = useState({ driver_name: "", driver_phone: "", truck_plate_number: "" });

  useEffect(() => {
    if (params.id) loadOrder();
  }, [params.id]);

  const loadOrder = async () => {
    try {
      const result = await getOrderById(params.id as string);
      if (result.error) {
        addToast({ type: "error", title: "Error", message: result.error });
        router.push("/dashboard/supplier/orders");
        return;
      }
      setOrder(result.order);
    } catch (error: any) {
      addToast({ type: "error", title: "Error", message: "Failed to load order" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptOrder = async () => {
    if (!materialPrice || parseFloat(materialPrice) <= 0) {
      addToast({ type: "error", title: "Invalid Price", message: "Please enter a valid material price" });
      return;
    }
    setIsAccepting(true);
    try {
      const result = await supplierAcceptOrder(params.id as string, parseFloat(materialPrice));
      if (result.error) { addToast({ type: "error", title: "Error", message: result.error }); return; }
      addToast({ type: "success", title: "Order Accepted!", message: "Driver search has started" });
      await loadOrder();
    } catch (error: any) {
      addToast({ type: "error", title: "Error", message: error.message || "Failed to accept order" });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleUseOwnDriver = async () => {
    if (!driverData.driver_name || !driverData.driver_phone || !driverData.truck_plate_number) {
      addToast({ type: "error", title: "Missing Information", message: "Please fill in all driver details" });
      return;
    }
    setIsAssigningDriver(true);
    try {
      const result = await supplierUseOwnDriver(params.id as string, driverData);
      if (result.error) { addToast({ type: "error", title: "Error", message: result.error }); return; }
      addToast({ type: "success", title: "Driver Assigned!", message: "Your driver has been assigned to this order" });
      setShowDriverForm(false);
      await loadOrder();
    } catch (error: any) {
      addToast({ type: "error", title: "Error", message: error.message || "Failed to assign driver" });
    } finally {
      setIsAssigningDriver(false);
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
    };
    return labels[status] || status.replace(/_/g, " ");
  };

  if (isLoading) {
    return <DashboardLayout><div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div></DashboardLayout>;
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
            <Link href="/dashboard/supplier/orders" className="text-orange-500 hover:underline">Back to Orders</Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pt-24 pb-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
            <Link href="/dashboard/supplier/orders" className="inline-flex items-center gap-2 text-muted-foreground hover:text-orange-500 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Orders
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 rounded-3xl border border-border mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Order #{order.id.slice(0, 8)}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div><label className="text-sm text-muted-foreground mb-1 block">Material</label><div className="flex items-center gap-2"><Package className="w-5 h-5 text-orange-500" /><span className="font-medium">{order.material_type}</span></div></div>
                <div><label className="text-sm text-muted-foreground mb-1 block">Tonnage</label><div className="font-medium">{order.tonnage} tons</div></div>
                <div><label className="text-sm text-muted-foreground mb-1 block">Pickup Location</label><div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-orange-500" /><span>{order.pickup_location}</span></div></div>
              </div>
              <div className="space-y-4">
                <div><label className="text-sm text-muted-foreground mb-1 block">Delivery Location</label><div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-orange-500" /><span>{order.delivery_location}</span></div></div>
                <div><label className="text-sm text-muted-foreground mb-1 block">Delivery Address</label><div className="text-sm">{order.delivery_address}</div></div>
                {order.material_price && <div><label className="text-sm text-muted-foreground mb-1 block">Material Price</label><div className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-500" /><span className="font-medium">₦{order.material_price.toLocaleString()}</span></div></div>}
              </div>
            </div>
            {order.customer_notes && <div className="mt-6 p-4 bg-muted/30 rounded-xl"><label className="text-sm text-muted-foreground mb-2 block">Customer Notes</label><p className="text-sm">{order.customer_notes}</p></div>}
          </motion.div>

          {order.status === "pending_supplier_acceptance" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-8 rounded-3xl border border-border mb-6">
              <h2 className="text-2xl font-bold mb-4">Accept Order</h2>
              <p className="text-muted-foreground mb-6">Set the material price to accept this order and start the driver search process.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Material Price (₦) <span className="text-red-500">*</span></label>
                  <input type="number" value={materialPrice} onChange={(e) => setMaterialPrice(e.target.value)} placeholder="Enter price per ton" className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-orange-500 transition-all" />
                </div>
                <MagneticButton onClick={handleAcceptOrder} disabled={isAccepting} className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
                  {isAccepting ? "Accepting..." : "Accept Order & Start Driver Search"}
                </MagneticButton>
              </div>
            </motion.div>
          )}

          {order.status === "no_driver_available" && !showDriverForm && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-8 rounded-3xl border border-orange-500/30 mb-6">
              <div className="flex items-start gap-4 mb-6">
                <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-2">No EWA Driver Available</h2>
                  <p className="text-muted-foreground">No EWA driver was assigned within 30 minutes. You can now assign your own driver to complete this delivery.</p>
                </div>
              </div>
              <MagneticButton onClick={() => setShowDriverForm(true)} className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">Use My Driver</MagneticButton>
            </motion.div>
          )}

          {order.status === "no_driver_available" && showDriverForm && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-8 rounded-3xl border border-border mb-6">
              <h2 className="text-2xl font-bold mb-6">Assign Your Driver</h2>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-2">Driver Name <span className="text-red-500">*</span></label><input type="text" value={driverData.driver_name} onChange={(e) => setDriverData({ ...driverData, driver_name: e.target.value })} placeholder="Enter driver's full name" className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-orange-500 transition-all" /></div>
                <div><label className="block text-sm font-medium mb-2">Driver Phone <span className="text-red-500">*</span></label><input type="tel" value={driverData.driver_phone} onChange={(e) => setDriverData({ ...driverData, driver_phone: e.target.value })} placeholder="Enter driver's phone number" className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-orange-500 transition-all" /></div>
                <div><label className="block text-sm font-medium mb-2">Truck Plate Number <span className="text-red-500">*</span></label><input type="text" value={driverData.truck_plate_number} onChange={(e) => setDriverData({ ...driverData, truck_plate_number: e.target.value })} placeholder="Enter truck plate number" className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-orange-500 transition-all" /></div>
                <div className="flex gap-4">
                  <MagneticButton onClick={handleUseOwnDriver} disabled={isAssigningDriver} className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">{isAssigningDriver ? "Assigning..." : "Assign Driver"}</MagneticButton>
                  <button onClick={() => setShowDriverForm(false)} className="px-8 py-4 border border-border rounded-xl font-semibold hover:bg-muted transition-colors">Cancel</button>
                </div>
              </div>
            </motion.div>
          )}

          {(order.driver_name || order.driver_phone) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-8 rounded-3xl border border-border mb-6">
              <h2 className="text-2xl font-bold mb-6">Driver Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {order.driver_name && <div><label className="text-sm text-muted-foreground mb-1 block">Driver Name</label><div className="flex items-center gap-2"><User className="w-5 h-5 text-orange-500" /><span className="font-medium">{order.driver_name}</span></div></div>}
                {order.driver_phone && <div><label className="text-sm text-muted-foreground mb-1 block">Driver Phone</label><div className="flex items-center gap-2"><Phone className="w-5 h-5 text-orange-500" /><a href={`tel:${order.driver_phone}`} className="font-medium hover:text-orange-500 transition-colors">{order.driver_phone}</a></div></div>}
                {order.truck_plate_number && <div><label className="text-sm text-muted-foreground mb-1 block">Truck Plate Number</label><div className="flex items-center gap-2"><Truck className="w-5 h-5 text-orange-500" /><span className="font-medium">{order.truck_plate_number}</span></div></div>}
                {order.delivery_fee && <div><label className="text-sm text-muted-foreground mb-1 block">Delivery Fee</label><div className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-500" /><span className="font-medium">₦{order.delivery_fee.toLocaleString()}</span></div></div>}
              </div>
            </motion.div>
          )}

          {order.delivery_code && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-8 rounded-3xl border border-border mb-6">
              <h2 className="text-2xl font-bold mb-4">Delivery Code</h2>
              <p className="text-muted-foreground mb-4">Share this code with the customer. They will provide it to the driver upon successful delivery.</p>
              <div className="p-6 bg-orange-500/10 border border-orange-500/30 rounded-xl text-center">
                <div className="text-4xl font-bold text-orange-500 font-mono">{order.delivery_code}</div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}