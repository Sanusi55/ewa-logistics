"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Truck, MapPin, CheckCircle, Clock, Loader2, 
  AlertCircle, Upload, X, Camera, KeyRound 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/dashboard-layout";
import { getUserOrders, confirmDriverDelivery } from "@/app/actions/orders";
import { useToast } from "@/components/providers/toast-provider";
// ✅ ADDED: Import the new GPS sharing component
import DriverLocationShare from "@/components/driver-location-share";

export default function DriverDeliveriesPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deliveryCode, setDeliveryCode] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    async function checkAuthAndLoad() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.push("/login");
          return;
        }

        const result = await getUserOrders("driver");
        
        if (result.error) {
          setError(result.error);
        } else {
          setDeliveries(result.orders || []);
        }
      } catch (err: any) {
        console.error("❌ Load deliveries error:", err);
        setError(err.message || "Failed to load deliveries");
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuthAndLoad();
  }, [router, supabase]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      driver_assigned: "bg-purple-500/10 text-purple-600 border-purple-500/30",
      loading: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
      in_transit: "bg-blue-500/10 text-blue-600 border-blue-500/30",
      delivered: "bg-green-500/10 text-green-600 border-green-500/30",
    };
    return colors[status] || "bg-gray-500/10 text-gray-600 border-gray-500/30";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      driver_assigned: "Assigned",
      loading: "Loading",
      in_transit: "In Transit",
      delivered: "Delivered",
    };
    return labels[status] || status.replace(/_/g, " ");
  };

  const handleOpenConfirmModal = (delivery: any) => {
    setSelectedDelivery(delivery);
    setDeliveryCode("");
    setEvidenceFile(null);
    setIsConfirmModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEvidenceFile(e.target.files[0]);
    }
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelivery || deliveryCode.length !== 4) {
      addToast({ type: "error", title: "Invalid Code", message: "Please enter the exact 4-digit delivery code." });
      return;
    }

    setIsConfirming(true);
    try {
      const result = await confirmDriverDelivery(selectedDelivery.id, deliveryCode, evidenceFile || undefined);
      
      if (result.error) {
        addToast({ type: "error", title: "Confirmation Failed", message: result.error });
      } else {
        addToast({ type: "success", title: "Delivery Confirmed! 🎉", message: "Payment will be released to you shortly." });
        setIsConfirmModalOpen(false);
        
        // Refresh deliveries
        const refreshResult = await getUserOrders("driver");
        if (!refreshResult.error) {
          setDeliveries(refreshResult.orders || []);
        }
      }
    } catch (err: any) {
      addToast({ type: "error", title: "Error", message: err.message || "Failed to confirm delivery" });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Deliveries</h1>
          <p className="text-muted-foreground mt-1">Track your active and completed deliveries</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div className="glass p-8 rounded-2xl border border-red-500/30 bg-red-500/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-700 dark:text-red-400 mb-1">Error Loading Deliveries</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="glass p-12 rounded-2xl border border-border text-center">
            <Truck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Deliveries Yet</h3>
            <p className="text-muted-foreground">Your assigned deliveries will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <motion.div 
                key={delivery.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-2xl border border-border"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{delivery.material_type}</h3>
                    <p className="text-sm text-muted-foreground">{delivery.tonnage} Tons</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(delivery.status)}`}>
                    {getStatusLabel(delivery.status)}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-orange-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pickup</p>
                      <p className="text-sm font-medium">{delivery.pickup_location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Delivery</p>
                      <p className="text-sm font-medium">{delivery.delivery_location}</p>
                    </div>
                  </div>
                </div>

                {/* ✅ LIVE GPS TRACKING COMPONENT (Only shows for active deliveries) */}
                {["loading", "in_transit"].includes(delivery.status) && (
                  <div className="mb-4">
                    <DriverLocationShare orderId={delivery.id} orderStatus={delivery.status} />
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(delivery.created_at).toLocaleDateString()}
                  </div>
                  
                  {delivery.status !== "delivered" ? (
                    <button 
                      onClick={() => handleOpenConfirmModal(delivery)}
                      className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Confirm Delivery
                    </button>
                  ) : (
                    <span className="px-4 py-2 bg-green-500/10 text-green-600 rounded-lg text-sm font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Completed
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Confirm Delivery Modal */}
      <AnimatePresence>
        {isConfirmModalOpen && selectedDelivery && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => !isConfirming && setIsConfirmModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto border border-border shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Confirm Delivery</h3>
                  <button 
                    onClick={() => setIsConfirmModalOpen(false)}
                    disabled={isConfirming}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-muted/50 rounded-xl border border-border">
                  <p className="text-sm font-semibold">{selectedDelivery.material_type}</p>
                  <p className="text-xs text-muted-foreground">{selectedDelivery.tonnage} Tons • {selectedDelivery.delivery_location}</p>
                </div>

                <form onSubmit={handleConfirmDelivery} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      4-Digit Delivery Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={deliveryCode}
                        onChange={(e) => setDeliveryCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        required
                        maxLength={4}
                        className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-center text-2xl font-mono font-bold tracking-widest"
                        placeholder="0000"
                        disabled={isConfirming}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Ask the customer for this code. Do not guess.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Proof of Delivery (Photo) <span className="text-muted-foreground text-xs">(Optional but recommended)</span>
                    </label>
                    <div 
                      onClick={() => !isConfirming && fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        disabled={isConfirming}
                      />
                      {evidenceFile ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium truncate">{evidenceFile.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Camera className="w-8 h-8" />
                          <span className="text-sm font-medium">Tap to upload photo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setIsConfirmModalOpen(false)}
                      disabled={isConfirming}
                      className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isConfirming || deliveryCode.length !== 4}
                      className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isConfirming ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Confirming...</>
                      ) : (
                        <><CheckCircle className="w-4 h-4" /> Confirm Delivery</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}