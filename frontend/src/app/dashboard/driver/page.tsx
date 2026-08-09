"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, MapPin, Wallet, Star, Navigation, Phone, MessageCircle, 
  CheckCircle, Clock, AlertCircle, Calendar, TrendingUp, Power,
  Package, Settings, ChevronRight, Loader2, DollarSign, X, Key,
  Camera, FileUp, Building2, Plus, AlertTriangle, LogOut
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/providers/toast-provider";
import { createClient } from "@/lib/supabase/client";
import { getAvailableJobs, submitDriverBid, confirmDriverDelivery } from "@/app/actions/orders";
import { createDispute } from "@/app/actions/disputes";
import { logout } from "@/app/actions/auth";
import MagneticButton from "@/components/magnetic-button";

interface Order {
  id: string;
  material_type: string;
  tonnage: number;
  pickup_location: string;
  delivery_location: string;
  delivery_address: string;
  status: string;
  delivery_fee: number;
  delivery_fee_offer?: number | null;
  driver_id: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  truck_plate_number: string | null;
  delivery_code: string | null;
  delivery_code_confirmed: boolean;
  created_at: string;
  hasBid?: boolean;
}

interface DriverBid {
  id: string;
  order_id: string;
  bid_amount: number;
  estimated_arrival_minutes: number | null;
  driver_message: string | null;
  status: string;
  created_at: string;
}

function DriverSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass p-5 rounded-xl animate-pulse">
            <div className="h-4 w-20 bg-muted rounded mb-3" />
            <div className="h-8 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="glass p-6 rounded-2xl animate-pulse h-64" />
    </div>
  );
}

export default function DriverDashboardPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [availableJobs, setAvailableJobs] = useState<Order[]>([]);
  const [myBids, setMyBids] = useState<DriverBid[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [driverName, setDriverName] = useState("Driver");
  const [driverState, setDriverState] = useState("");
  
  // Modals
  const [showBidModal, setShowBidModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Form States
  const [bidAmount, setBidAmount] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [driverMessage, setDriverMessage] = useState("");
  const [deliveryCode, setDeliveryCode] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Account Details State
  const [accountDetails, setAccountDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // ✅ NEW: Withdrawal & Earnings State
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [isRequestingWithdrawal, setIsRequestingWithdrawal] = useState(false);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);

  // ✅ NEW: Dispute State
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeOrderId, setDisputeOrderId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  const nigerianBanks = [
    "Access Bank", "Citibank", "Ecobank", "Fidelity Bank", "First Bank",
    "First City Monument Bank (FCMB)", "Globus Bank", "Guaranty Trust Bank (GTBank)",
    "Heritage Bank", "Jaiz Bank", "Keystone Bank", "Kuda Bank", "Opay",
    "Palmpay", "Polaris Bank", "Providus Bank", "Stanbic IBTC Bank",
    "Standard Chartered Bank", "Sterling Bank", "SunTrust Bank",
    "Titan Trust Bank", "Union Bank", "United Bank for Africa (UBA)",
    "Unity Bank", "Wema Bank", "Zenith Bank"
  ];
  
  const supabase = createClient();

  useEffect(() => {
    fetchDriverData();
    loadAccountDetails();
    loadWithdrawals();
    loadEarnings();
  }, []);

  async function fetchDriverData() {
    setIsLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, state")
      .eq("id", user.id)
      .single();

    if (profile?.full_name) setDriverName(profile.full_name);
    if (profile?.state) setDriverState(profile.state);

    const jobsResult = await getAvailableJobs();
    if (!jobsResult.error) {
      setAvailableJobs(jobsResult.jobs || []);
    }

    const { data: bidsData } = await supabase
      .from("driver_bids")
      .select("*")
      .eq("driver_id", user.id)
      .order("created_at", { ascending: false });

    if (bidsData) setMyBids(bidsData);

    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .eq("driver_id", user.id)
      .in("status", ["loading", "in_transit", "delivered", "completed"])
      .order("created_at", { ascending: false });

    if (ordersData) setActiveOrders(ordersData);

    setIsLoading(false);
  }

  const loadAccountDetails = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("driver_profiles") 
      .select("bank_name, account_number, account_name")
      .eq("user_id", user.id)
      .single();

    if (data && !error) {
      setAccountDetails({
        bankName: data.bank_name || "",
        accountNumber: data.account_number || "",
        accountName: data.account_name || "",
      });
    }
  };

  const loadWithdrawals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setWithdrawals(data);
  };

  const loadEarnings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("driver_earnings")
      .select("amount")
      .eq("user_id", user.id)
      .eq("status", "available");

    if (data) {
      const total = data.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
      setAvailableBalance(total);
    }
  };

  const handleSaveAccountDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAccount(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("driver_profiles")
        .upsert({
          user_id: user.id,
          bank_name: accountDetails.bankName,
          account_number: accountDetails.accountNumber,
          account_name: accountDetails.accountName,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      addToast({ 
        type: "success", 
        title: "Account Details Saved! ✅", 
        message: "Your payout information has been updated successfully." 
      });
    } catch (error: any) {
      addToast({ 
        type: "error", 
        title: "Error", 
        message: error.message || "Failed to save account details" 
      });
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      addToast({ type: "error", title: "Error", message: "Please enter a valid amount." });
      return;
    }
    if (amount > availableBalance) {
      addToast({ type: "error", title: "Error", message: "Insufficient balance." });
      return;
    }
    if (!accountDetails.bankName) {
      addToast({ type: "error", title: "Error", message: "Please set up your account details first." });
      return;
    }

    setIsRequestingWithdrawal(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("withdrawal_requests").insert({
      user_id: user.id,
      role: "driver",
      amount: amount,
      status: "pending",
      bank_name: accountDetails.bankName,
      account_number: accountDetails.accountNumber,
      account_name: accountDetails.accountName,
    });

    if (error) {
      addToast({ type: "error", title: "Error", message: error.message || "Failed to request withdrawal." });
    } else {
      addToast({ type: "success", title: "Success! 🎉", message: "Withdrawal request submitted. Admin will review it shortly." });
      setShowWithdrawalModal(false);
      setWithdrawalAmount("");
      loadWithdrawals();
      loadEarnings();
    }
    setIsRequestingWithdrawal(false);
  };

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeOrderId || !disputeReason.trim()) return;

    setIsSubmittingDispute(true);
    try {
      const result = await createDispute(disputeOrderId, disputeReason, "driver");
      
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

  // ✅ UPDATED: Accept optional preFillAmount for customer offers
  const handleOpenBidModal = (order: Order, preFillAmount?: number | null) => {
    setSelectedOrder(order);
    setBidAmount(preFillAmount ? preFillAmount.toString() : "");
    setEstimatedTime("");
    setDriverMessage("");
    setShowBidModal(true);
  };

  const handleSubmitBid = async () => {
    if (!selectedOrder || !bidAmount || parseFloat(bidAmount) <= 0) {
      addToast({ type: "error", title: "Invalid Amount", message: "Please enter a valid delivery fee." });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitDriverBid(selectedOrder.id, {
        bid_amount: parseFloat(bidAmount),
        estimated_arrival_minutes: estimatedTime ? parseInt(estimatedTime) : undefined,
        driver_message: driverMessage || undefined,
      });

      if (result.error) {
        addToast({ type: "error", title: "Error", message: result.error });
        return;
      }

      addToast({ 
        type: "success", 
        title: "Bid Submitted! 🎉", 
        message: "The customer will review your bid shortly." 
      });
      
      setShowBidModal(false);
      await fetchDriverData();
    } catch (error: any) {
      addToast({ type: "error", title: "Error", message: error.message || "Failed to submit bid" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCodeModal = (order: Order) => {
    setSelectedOrder(order);
    setDeliveryCode("");
    setShowCodeModal(true);
  };

  const handleVerifyCode = async () => {
    if (!selectedOrder || !deliveryCode) {
      addToast({ type: "error", title: "Error", message: "Please enter the delivery code." });
      return;
    }

    setIsVerifying(true);
    try {
      const result = await confirmDriverDelivery(selectedOrder.id, deliveryCode);
      
      if (result.error) {
        addToast({ type: "error", title: "Invalid Code", message: result.error });
        return;
      }

      addToast({ 
        type: "success", 
        title: "Delivery Completed! 🎉", 
        message: "The delivery has been marked as completed successfully." 
      });
      setShowCodeModal(false);
      await fetchDriverData();
    } catch (error: any) {
      addToast({ type: "error", title: "Error", message: error.message || "Failed to verify code" });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOpenProofModal = (order: Order) => {
    setSelectedOrder(order);
    setProofFile(null);
    setDeliveryNotes("");
    setShowProofModal(true);
  };

  const handleUploadProof = async () => {
    if (!selectedOrder || !proofFile) {
      addToast({ type: "error", title: "Error", message: "Please select a file." });
      return;
    }

    setIsUploading(true);
    try {
      const { uploadFile } = await import("@/lib/supabase/upload");
      const { url, error } = await uploadFile(proofFile, "delivery-proof");

      if (error || !url) {
        addToast({ type: "error", title: "Upload Failed", message: error || "Could not upload" });
        setIsUploading(false);
        return;
      }

      addToast({ 
        type: "success", 
        title: "Proof Uploaded! 📸", 
        message: "Delivery proof uploaded successfully." 
      });
      
      setShowProofModal(false);
      setProofFile(null);
      setDeliveryNotes("");
    } catch (error: any) {
      addToast({ type: "error", title: "Error", message: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    addToast({ 
      type: !isOnline ? "success" : "info", 
      title: !isOnline ? "You are now Online" : "You are now Offline", 
      message: !isOnline ? "You will start receiving delivery requests." : "You will no longer receive new requests." 
    });
  };

  const activeDelivery = activeOrders.find(o => o.status === "in_transit" || o.status === "loading");
  const completedDeliveries = activeOrders.filter(o => o.status === "delivered" || o.status === "completed");
  
  const todayEarnings = availableBalance;

  if (isLoading) {
    return (
      <div className="pt-24 px-4 md:px-6">
        <div className="max-w-5xl mx-auto"><DriverSkeleton /></div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 md:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Driver Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {driverName}. 
              {driverState && <span className="text-orange-500 font-medium"> Operating in: {driverState}</span>}
            </p>
          </div>
          <button 
            onClick={toggleOnlineStatus}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl font-semibold transition-all cursor-pointer shadow-lg ${
              isOnline 
                ? "bg-green-500 text-white shadow-green-500/20 hover:bg-green-600" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Power className={`w-5 h-5 ${isOnline ? "animate-pulse" : ""}`} />
            {isOnline ? "Online & Receiving Requests" : "Go Offline"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Available Balance", value: formatNaira(todayEarnings), icon: Wallet, color: "text-green-500", bg: "bg-green-500/10" },
                { label: "Active Trips", value: activeDelivery ? 1 : 0, icon: Truck, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "My Bids", value: myBids.length, icon: DollarSign, color: "text-orange-500", bg: "bg-orange-500/10" },
                { label: "Driver Rating", value: "4.9 / 5.0", icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
              ].map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass p-5 rounded-xl flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <span className="text-xl md:text-2xl font-bold">{stat.value}</span>
                </motion.div>
              ))}
            </div>

            {availableJobs.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-500" /> Available Jobs {driverState && `in ${driverState}`}
                  <span className="text-sm font-normal text-muted-foreground">({availableJobs.length})</span>
                </h2>
                {availableJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass rounded-xl p-6 bg-orange-500/5 hover:bg-orange-500/10 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">{job.material_type}</h3>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                            Awaiting Driver
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {job.tonnage} Tons
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">Pickup</p>
                          <p className="text-sm font-medium truncate">{job.pickup_location}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Navigation className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">Drop-off</p>
                          <p className="text-sm font-medium truncate">{job.delivery_location}</p>
                        </div>
                      </div>
                    </div>

                    {/* ✅ NEW: Conditional rendering for Customer Offers vs Standard Bids */}
                    {job.delivery_fee_offer && job.delivery_fee_offer > 0 ? (
                      <div className="flex items-center justify-between pt-4 mt-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Customer Delivery Offer</span>
                          <span className="text-lg font-bold text-green-500">{formatNaira(job.delivery_fee_offer)}</span>
                        </div>
                        {job.hasBid ? (
                          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-lg">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-semibold text-sm">Bid Submitted</span>
                          </div>
                        ) : (
                          <MagneticButton
                            onClick={() => handleOpenBidModal(job, job.delivery_fee_offer)}
                            className="px-6 py-2.5 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" /> Accept Offer
                          </MagneticButton>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-4 mt-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(job.created_at)}
                        </div>
                        {job.hasBid ? (
                          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-lg">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-semibold text-sm">Bid Submitted</span>
                          </div>
                        ) : (
                          <MagneticButton
                            onClick={() => handleOpenBidModal(job, null)}
                            className="px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 flex items-center gap-2"
                          >
                            <DollarSign className="w-4 h-4" /> Place Bid
                          </MagneticButton>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {activeDelivery ? (
                  <div className="glass p-6 rounded-2xl bg-orange-500/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Navigation className="w-32 h-32 text-orange-500" />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold mb-2">
                            <Clock className="w-3 h-3" /> ACTIVE DELIVERY
                          </span>
                          <h2 className="text-xl font-bold">ORD-{activeDelivery.id.slice(0, 8).toUpperCase()}</h2>
                          <p className="text-sm text-muted-foreground">{activeDelivery.tonnage} Tons {activeDelivery.material_type}</p>
                          <p className="text-xs text-muted-foreground mt-1 capitalize">Status: {activeDelivery.status.replace("_", " ")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Trip Earnings</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatNaira(activeDelivery.delivery_fee || 0)}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 mb-6 p-4 bg-background/50 rounded-xl">
                        <div className="flex flex-col items-center pt-1">
                          <div className="w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-500/20" />
                          <div className="w-0.5 h-12 bg-muted my-1" />
                          <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-500/20" />
                        </div>
                        <div className="flex-1 space-y-6">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Pickup</p>
                            <p className="text-sm font-semibold text-foreground">{activeDelivery.pickup_location}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Dropoff</p>
                            <p className="text-sm font-semibold text-foreground">{activeDelivery.delivery_location}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-muted hover:bg-muted/80 rounded-xl font-medium transition-colors cursor-pointer">
                          <Phone className="w-4 h-4" /> Contact Customer
                        </button>
                        
                        <MagneticButton 
                          onClick={() => handleOpenProofModal(activeDelivery)}
                          className="flex-[2] flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                        >
                          <Camera className="w-4 h-4" /> Upload Delivery Proof
                        </MagneticButton>
                        
                        <MagneticButton 
                          onClick={() => handleOpenCodeModal(activeDelivery)}
                          className="flex-[2] flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                        >
                          <Key className="w-4 h-4" /> Complete with Code
                        </MagneticButton>
                      </div>

                      <div className="mt-4">
                        <button
                          onClick={() => { setDisputeOrderId(activeDelivery.id); setShowDisputeModal(true); }}
                          className="w-full sm:w-auto px-4 py-3 text-sm font-semibold text-red-500 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <AlertTriangle className="w-4 h-4" /> Report Dispute
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass p-12 rounded-2xl text-center bg-muted/20">
                    <Truck className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-bold mb-2">No Active Deliveries</h3>
                    <p className="text-muted-foreground">
                      {availableJobs.length > 0 
                        ? "Check available jobs above to place a bid!"
                        : "You don't have any active deliveries right now."}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="glass p-6 rounded-2xl text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-3xl font-bold mx-auto ring-4 ring-orange-500/20">
                      {driverName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                  </div>
                  <h3 className="font-bold text-xl">{driverName}</h3>
                  <p className="text-sm text-muted-foreground mb-4">Verified Driver • {completedDeliveries.length} Trips</p>
                </div>

                <div className="glass p-6 rounded-2xl">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-orange-500" /> Vehicle Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Vehicle & Plate</p>
                        <p className="text-sm font-semibold text-foreground">Volvo Tipper (ABC-123-DE)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass p-6 rounded-2xl mb-10">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-orange-500" /> Account Details
                  </h3>
                  <form onSubmit={handleSaveAccountDetails} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Bank Name <span className="text-red-500">*</span></label>
                      <select
                        value={accountDetails.bankName}
                        onChange={(e) => setAccountDetails({...accountDetails, bankName: e.target.value})}
                        className="w-full px-3 py-2.5 bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 appearance-none cursor-pointer text-sm"
                        required
                      >
                        <option value="" disabled>Select your bank</option>
                        {nigerianBanks.map((bank) => (
                          <option key={bank} value={bank}>{bank}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Account Number <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={accountDetails.accountNumber}
                        onChange={(e) => setAccountDetails({...accountDetails, accountNumber: e.target.value})}
                        className="w-full px-3 py-2.5 bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 text-sm"
                        placeholder="0123456789"
                        maxLength={10}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Account Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={accountDetails.accountName}
                        onChange={(e) => setAccountDetails({...accountDetails, accountName: e.target.value})}
                        className="w-full px-3 py-2.5 bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 text-sm"
                        placeholder="Account Name"
                        required
                      />
                    </div>
                    
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSavingAccount}
                        className="w-full py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                      >
                        {isSavingAccount ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                        ) : (
                          <><CheckCircle className="w-4 h-4" /> Save Account Details</>
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="mt-8 pt-6">
                    <form action={logout}>
                      <button className="w-full py-3 bg-red-500/10 text-red-600 rounded-lg font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-green-500" /> Withdrawals
                  </h2>
                  <p className="text-sm text-muted-foreground">Request a payout of your earned delivery fees.</p>
                </div>
                <button
                  onClick={() => setShowWithdrawalModal(true)}
                  className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-green-500/20"
                >
                  <Plus className="w-4 h-4" /> Request Withdrawal
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="p-5 bg-green-500/10 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                  <p className="text-3xl font-bold text-green-500">{formatNaira(availableBalance)}</p>
                </div>
                <div className="p-5 bg-blue-500/10 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Pending Withdrawals</p>
                  <p className="text-3xl font-bold text-blue-500">
                    {formatNaira(withdrawals.filter(w => w.status === "pending").reduce((sum: number, w: any) => sum + (w.amount || 0), 0))}
                  </p>
                </div>
                <div className="p-5 bg-purple-500/10 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Total Withdrawn</p>
                  <p className="text-3xl font-bold text-purple-500">
                    {formatNaira(withdrawals.filter(w => w.status === "approved").reduce((sum: number, w: any) => sum + (w.amount || 0), 0))}
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-4">Recent Requests</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Amount</th>
                      <th className="text-left p-4 font-medium">Bank Account</th>
                      <th className="text-left p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">No withdrawal requests yet.</td>
                      </tr>
                    ) : (
                      withdrawals.map((w: any) => (
                        <tr key={w.id} className="border-t border-muted/30 hover:bg-muted/20 transition-colors">
                          <td className="p-4">{new Date(w.created_at).toLocaleDateString()}</td>
                          <td className="p-4 font-semibold">{formatNaira(w.amount)}</td>
                          <td className="p-4 text-muted-foreground">{w.account_number} ({w.bank_name})</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              w.status === "approved" ? "bg-green-500/10 text-green-600" :
                              w.status === "rejected" ? "bg-red-500/10 text-red-600" :
                              "bg-yellow-500/10 text-yellow-600"
                            }`}>
                              {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Bid Modal */}
      <AnimatePresence>
        {showBidModal && selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setShowBidModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-orange-500" /> {selectedOrder.delivery_fee_offer ? "Review & Accept Offer" : "Place Your Bid"}
                  </h3>
                  <button onClick={() => setShowBidModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">Delivery Details</p>
                    <p className="font-bold">{selectedOrder.material_type}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.tonnage} Tons</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {selectedOrder.delivery_location}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Your Delivery Fee (₦) <span className="text-red-500">*</span></label>
                    <input 
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-muted/50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-lg font-bold"
                      placeholder="e.g. 25000"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Estimated Arrival (Minutes)</label>
                    <input 
                      type="number"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      className="w-full px-4 py-3 bg-muted/50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                      placeholder="e.g. 45"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Message to Customer (Optional)</label>
                    <textarea 
                      value={driverMessage}
                      onChange={(e) => setDriverMessage(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 bg-muted/50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                      placeholder="e.g. I can arrive within 30 mins..."
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowBidModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <MagneticButton 
                    onClick={handleSubmitBid}
                    disabled={isSubmitting || !bidAmount}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : (
                      <><CheckCircle className="w-4 h-4" /> {selectedOrder.delivery_fee_offer ? "Accept Offer" : "Submit Bid"}</>
                    )}
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delivery Code Modal */}
      <AnimatePresence>
        {showCodeModal && selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => !isVerifying && setShowCodeModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Key className="w-6 h-6 text-orange-500" /> Complete Delivery
                  </h3>
                  <button onClick={() => setShowCodeModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-blue-500/10 rounded-xl">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
                      📞 Ask the customer for the delivery code
                    </p>
                    <p className="text-xs text-muted-foreground">
                      The customer will provide you with a unique 4-digit code to confirm delivery.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Enter Delivery Code <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      value={deliveryCode}
                      onChange={(e) => setDeliveryCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full px-4 py-4 bg-muted/50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-2xl font-bold text-center tracking-widest uppercase"
                      placeholder="0000"
                      disabled={isVerifying}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowCodeModal(false)}
                    disabled={isVerifying}
                    className="flex-1 py-3 rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <MagneticButton 
                    onClick={handleVerifyCode}
                    disabled={isVerifying || deliveryCode.length < 4}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                    ) : (
                      <><CheckCircle className="w-4 h-4" /> Complete</>
                    )}
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delivery Proof Upload Modal */}
      <AnimatePresence>
        {showProofModal && selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => !isUploading && setShowProofModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Camera className="w-6 h-6 text-green-500" /> Upload Delivery Proof
                  </h3>
                  <button onClick={() => setShowProofModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-green-500/10 rounded-xl">
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">
                      📸 Upload Proof of Delivery
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Upload a photo of the delivered material, signed receipt, or delivery note.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Select File <span className="text-red-500">*</span></label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/20 rounded-xl cursor-pointer hover:bg-muted/30 transition-colors bg-muted/10">
                      <input
                        type="file"
                        accept="image/*,application/pdf,video/mp4"
                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                        className="hidden"
                        disabled={isUploading}
                      />
                      {proofFile ? (
                        <div className="text-center">
                          <FileUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm font-medium truncate max-w-[250px]">{proofFile.name}</p>
                          <p className="text-xs text-muted-foreground">{(proofFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm font-medium">Click to upload</p>
                          <p className="text-xs text-muted-foreground">JPG, PNG, PDF, or MP4 (max 10MB)</p>
                        </div>
                      )}
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Delivery Notes (Optional)</label>
                    <textarea
                      rows={2}
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="w-full px-4 py-3 bg-muted/50 rounded-xl outline-none focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
                      placeholder="e.g. Delivered to back entrance, signed by John..."
                      disabled={isUploading}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowProofModal(false)}
                    disabled={isUploading}
                    className="flex-1 py-3 rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <MagneticButton 
                    onClick={handleUploadProof}
                    disabled={isUploading || !proofFile}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                    ) : (
                      <><Camera className="w-4 h-4" /> Upload Proof</>
                    )}
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Withdrawal Request Modal */}
      <AnimatePresence>
        {showWithdrawalModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => !isRequestingWithdrawal && setShowWithdrawalModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-green-500" /> Request Withdrawal
                  </h3>
                  <button 
                    onClick={() => setShowWithdrawalModal(false)}
                    disabled={isRequestingWithdrawal}
                    className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 bg-green-500/10 rounded-xl mb-6">
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold text-green-500">{formatNaira(availableBalance)}</p>
                </div>

                <form onSubmit={handleRequestWithdrawal} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Withdrawal Amount (₦) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-muted/50 rounded-xl outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-lg font-bold"
                      placeholder="0.00"
                      required
                      disabled={isRequestingWithdrawal}
                    />
                  </div>

                  <div className="p-4 bg-muted/30 rounded-xl text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground mb-2">Funds will be sent to:</p>
                    <p>{accountDetails.bankName || "No bank account set"}</p>
                    <p>{accountDetails.accountNumber || "****"}</p>
                    <p>{accountDetails.accountName || "****"}</p>
                    {!accountDetails.bankName && (
                      <button 
                        type="button"
                        onClick={() => { setShowWithdrawalModal(false); }}
                        className="mt-2 text-orange-500 hover:underline font-medium"
                      >
                        Update Account Details Above
                      </button>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setShowWithdrawalModal(false)}
                      disabled={isRequestingWithdrawal}
                      className="flex-1 py-3 rounded-xl font-medium hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isRequestingWithdrawal || !accountDetails.bankName}
                      className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isRequestingWithdrawal ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                      ) : (
                        <><CheckCircle className="w-4 h-4" /> Submit Request</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dispute Modal */}
      <AnimatePresence>
        {showDisputeModal && disputeOrderId && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => !isSubmittingDispute && setShowDisputeModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-red-500">
                    <AlertTriangle className="w-6 h-6" /> Report Dispute
                  </h3>
                  <button 
                    onClick={() => setShowDisputeModal(false)}
                    disabled={isSubmittingDispute}
                    className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 bg-red-500/10 rounded-xl mb-6">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    ⚠️ Are you experiencing an issue with this delivery?
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Our admin team will review your dispute and contact you shortly. Please provide as much detail as possible.
                  </p>
                </div>

                <form onSubmit={handleCreateDispute} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Reason for Dispute <span className="text-red-500">*</span></label>
                    <textarea
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-muted/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
                      placeholder="e.g. Customer unreachable, incorrect delivery location, payment issue..."
                      required
                      disabled={isSubmittingDispute}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setShowDisputeModal(false)}
                      disabled={isSubmittingDispute}
                      className="flex-1 py-3 rounded-xl font-medium hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmittingDispute || !disputeReason.trim()}
                      className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmittingDispute ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                      ) : (
                        <><AlertTriangle className="w-4 h-4" /> Submit Dispute</>
                      )}
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