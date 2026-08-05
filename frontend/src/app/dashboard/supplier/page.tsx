"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Truck, Clock, CheckCircle, DollarSign, 
  MapPin, Calendar, Loader2, AlertCircle, Building2,
  TrendingUp, Users, BarChart3, Eye, Phone, Navigation,
  Filter, Search, Plus, Download, MoreVertical, Upload, Camera, X, FileText, Wallet, AlertTriangle
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserOrders, supplierAcceptOrder, uploadSupplierEvidence } from "@/app/actions/orders";
import { createDispute } from "@/app/actions/disputes";
import { useToast } from "@/components/providers/toast-provider";
import DashboardLayout from "@/components/dashboard-layout";
import MagneticButton from "@/components/magnetic-button";
import { SkeletonTable } from "@/components/ui/skeleton";

export default function SupplierDashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "tracking" | "withdrawals" | "account">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [materialPrice, setMaterialPrice] = useState("");
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  
  // Evidence Upload State
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidenceOrder, setEvidenceOrder] = useState<any>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Account Details State
  const [accountDetails, setAccountDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // ✅ NEW: Withdrawal State
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [isRequestingWithdrawal, setIsRequestingWithdrawal] = useState(false);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

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

  useEffect(() => {
    loadOrders();
    loadAccountDetails();
    loadWithdrawals();
  }, []);

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const result = await getUserOrders("supplier");
      
      if (result.error) {
        addToast({ type: "error", title: "Error", message: result.error });
        return;
      }

      const sortedOrders = (result.orders || []).sort((a: any, b: any) => {
        if (a.status === "pending_supplier_acceptance" && b.status !== "pending_supplier_acceptance") return -1;
        if (a.status !== "pending_supplier_acceptance" && b.status === "pending_supplier_acceptance") return 1;
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

  const loadAccountDetails = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("supplier_profiles") 
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

  // ✅ NEW: Load Withdrawal History
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

  const handleSaveAccountDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAccount(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("supplier_profiles")
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

  // ✅ NEW: Handle Withdrawal Request
  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      addToast({ type: "error", title: "Error", message: "Please enter a valid amount." });
      return;
    }
    if (amount > stats.revenue) {
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
      role: "supplier",
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
    }
    setIsRequestingWithdrawal(false);
  };

  // ✅ NEW: Handle Dispute Submission
  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeOrderId || !disputeReason.trim()) return;

    setIsSubmittingDispute(true);
    try {
      const result = await createDispute(disputeOrderId, disputeReason, "supplier");
      
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

  const handleOpenAcceptModal = (order: any) => {
    setSelectedOrder(order);
    const defaultPrice = order.total_amount || 0;
    setMaterialPrice(defaultPrice.toString());
    setShowAcceptModal(true);
  };

  const handleAcceptOrder = async () => {
    if (!selectedOrder || !materialPrice) return;
    
    setAcceptingOrderId(selectedOrder.id);
    try {
      const price = parseFloat(materialPrice);
      if (isNaN(price) || price <= 0) {
        addToast({ type: "error", title: "Error", message: "Please enter a valid price" });
        return;
      }

      const result = await supplierAcceptOrder(selectedOrder.id, price);
      
      if (result.error) {
        addToast({ type: "error", title: "Error", message: result.error });
        return;
      }

      addToast({ 
        type: "success", 
        title: "Order Accepted! ", 
        message: "Driver search has started for this order." 
      });
      
      setShowAcceptModal(false);
      setSelectedOrder(null);
      setMaterialPrice("");
      await loadOrders();
    } catch (error: any) {
      addToast({ type: "error", title: "Error", message: error.message || "Failed to accept order" });
    } finally {
      setAcceptingOrderId(null);
    }
  };

  const handleViewTracking = (order: any) => {
    setTrackingOrder(order);
    setShowTrackingModal(true);
  };

  const handleOpenEvidenceModal = (order: any) => {
    setEvidenceOrder(order);
    setEvidenceFile(null);
    setEvidenceNotes("");
    setShowEvidenceModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEvidenceFile(e.target.files[0]);
    }
  };

  const handleUploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceOrder || !evidenceFile) {
      addToast({ type: "error", title: "Missing File", message: "Please select a file to upload." });
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadSupplierEvidence(evidenceOrder.id, evidenceFile, evidenceNotes || undefined);
      
      if (result.error) {
        addToast({ type: "error", title: "Upload Failed", message: result.error });
      } else {
        addToast({ type: "success", title: "Evidence Uploaded! 📸", message: "Proof of delivery has been recorded." });
        setShowEvidenceModal(false);
        await loadOrders();
      }
    } catch (err: any) {
      addToast({ type: "error", title: "Error", message: err.message || "Failed to upload evidence" });
    } finally {
      setIsUploading(false);
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
      driver_searching: "Searching Driver",
      no_driver_available: "No Driver",
      driver_assigned: "Driver Assigned",
      supplier_driver_assigned: "Own Driver",
      loading: "Loading",
      in_transit: "In Transit",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return labels[status] || status.replace(/_/g, " ");
  };

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.material_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.delivery_location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending_supplier_acceptance").length,
    active: orders.filter(o => ["driver_searching", "driver_assigned", "in_transit", "loading"].includes(o.status)).length,
    completed: orders.filter(o => o.status === "delivered").length,
    revenue: orders.filter(o => o.status === "delivered").reduce((sum, o) => sum + (o.total_amount || 0), 0)
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="pt-24 px-4 md:px-6">
          <div className="max-w-7xl mx-auto"><SkeletonTable rows={5} /></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pt-24 pb-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Supplier Dashboard</h1>
              <p className="text-muted-foreground">Manage orders, track deliveries, and monitor performance.</p>
            </div>
            <div className="flex gap-2">
              <MagneticButton className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" /> Export
              </MagneticButton>
              <Link href="/dashboard/supplier/materials">
                <MagneticButton className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Material
                </MagneticButton>
              </Link>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-5 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground font-medium">Total Orders</p>
                <div className="p-2 rounded-lg bg-blue-500/10"><Package className="w-5 h-5 text-blue-500" /></div>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> All time</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-5 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground font-medium">Pending</p>
                <div className="p-2 rounded-lg bg-yellow-500/10"><Clock className="w-5 h-5 text-yellow-500" /></div>
              </div>
              <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
              <p className="text-xs text-muted-foreground mt-1">Awaiting acceptance</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-5 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground font-medium">Active</p>
                <div className="p-2 rounded-lg bg-purple-500/10"><Truck className="w-5 h-5 text-purple-500" /></div>
              </div>
              <p className="text-2xl font-bold text-purple-500">{stats.active}</p>
              <p className="text-xs text-muted-foreground mt-1">In progress</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass p-5 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground font-medium">Revenue</p>
                <div className="p-2 rounded-lg bg-green-500/10"><DollarSign className="w-5 h-5 text-green-500" /></div>
              </div>
              <p className="text-2xl font-bold text-green-500">{formatNaira(stats.revenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">From completed orders</p>
            </motion.div>
          </div>

          {/* ✅ UPDATED: Tabs now include "withdrawals" */}
          <div className="flex gap-2 border-b border-border overflow-x-auto">
            {["overview", "orders", "tracking", "withdrawals", "account"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab 
                    ? "border-orange-500 text-orange-500" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "account" ? "Account Details" : tab === "withdrawals" ? "Withdrawals" : tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2"><Package className="w-5 h-5 text-orange-500" /> Recent Orders</h2>
                  <button onClick={() => setActiveTab("orders")} className="text-sm text-orange-500 hover:underline cursor-pointer bg-transparent border-none p-0 font-medium">View All</button>
                </div>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center"><Package className="w-5 h-5 text-orange-500" /></div>
                        <div>
                          <p className="font-semibold text-sm">{order.material_type}</p>
                          <p className="text-xs text-muted-foreground">{order.tonnage} tons • {order.delivery_location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                        <p className="font-bold text-sm">{formatNaira(order.total_amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass rounded-2xl border border-border p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-500" /> Order Status Distribution</h3>
                  <div className="space-y-3">
                    {["pending_supplier_acceptance", "driver_searching", "in_transit", "delivered"].map((status) => {
                      const count = orders.filter(o => o.status === status).length;
                      const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                      return (
                        <div key={status}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-muted-foreground">{getStatusLabel(status)}</span>
                            <span className="text-sm font-semibold">{count}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="glass rounded-2xl border border-border p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-green-500" /> Quick Actions</h3>
                  <div className="space-y-3">
                    <Link href="/dashboard/supplier/materials">
                      <MagneticButton className="w-full py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                        <Package className="w-4 h-4" /> Manage Materials
                      </MagneticButton>
                    </Link>
                    <MagneticButton className="w-full py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> Download Reports
                    </MagneticButton>
                    <button onClick={() => setActiveTab("account")} className="w-full py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer border-none">
                      <Building2 className="w-4 h-4" /> Update Account Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="glass p-4 rounded-xl border border-border flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm" />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {["all", "pending_supplier_acceptance", "driver_searching", "in_transit", "delivered"].map((status) => (
                    <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-2 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all ${statusFilter === status ? "bg-orange-500 text-white" : "bg-muted hover:bg-muted/80 text-muted-foreground"}`}>
                      {getStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="glass p-12 rounded-2xl border border-border text-center">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No orders found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters</p>
                  </div>
                ) : (
                  filteredOrders.map((order, index) => (
                    <motion.div key={order.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className={`glass rounded-2xl border p-6 transition-all ${order.status === "pending_supplier_acceptance" ? "border-2 border-yellow-500/30 bg-yellow-500/5" : "border-border"}`}>
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <h3 className="text-xl font-bold">{order.material_type}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                            
                            {/* ✅ NEW: Report Dispute Button */}
                            {order.status !== "cancelled" && order.status !== "pending_supplier_acceptance" && (
                              <button
                                onClick={() => { setDisputeOrderId(order.id); setShowDisputeModal(true); }}
                                className="px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" /> Report Dispute
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2"><Package className="w-4 h-4 text-orange-500" /><span>{order.tonnage} Tons</span></div>
                            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" /><span>{order.delivery_location}</span></div>
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-500" /><span>{new Date(order.created_at).toLocaleDateString()}</span></div>
                            <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-500" /><span className="font-semibold text-foreground">{formatNaira(order.total_amount)}</span></div>
                          </div>
                        </div>
                      </div>

                      {order.driver_name && (
                        <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/20 mb-4">
                          <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-5 h-5 text-green-500" /><h4 className="font-bold">Driver Assigned</h4></div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /><span>{order.driver_name}</span></div>
                            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span>{order.driver_phone}</span></div>
                            <div className="flex items-center gap-2"><Navigation className="w-4 h-4 text-muted-foreground" /><button onClick={() => handleViewTracking(order)} className="text-orange-500 hover:underline">Track Location</button></div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 flex-wrap">
                        {order.status === "pending_supplier_acceptance" && (
                          <MagneticButton onClick={() => handleOpenAcceptModal(order)} className="px-6 py-2.5 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Accept Order
                          </MagneticButton>
                        )}
                        {order.status === "delivered" && (
                          <MagneticButton onClick={() => handleOpenEvidenceModal(order)} className="px-6 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Upload Evidence
                          </MagneticButton>
                        )}
                        <MagneticButton onClick={() => router.push(`/dashboard/tracking?id=${order.id}`)} className="px-6 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors flex items-center gap-2">
                          <Eye className="w-4 h-4" /> View Details
                        </MagneticButton>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Tracking Tab */}
          {activeTab === "tracking" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="glass rounded-2xl border border-border p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Navigation className="w-5 h-5 text-blue-500" /> Live Tracking</h2>
                <div className="space-y-4">
                  {orders.filter(o => o.driver_name && ["driver_assigned", "in_transit", "loading"].includes(o.status)).map((order) => (
                    <div key={order.id} className="p-4 rounded-xl bg-muted/30 border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-bold">{order.material_type}</h3>
                          <p className="text-sm text-muted-foreground">{order.delivery_location}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /><span>{order.driver_name}</span></div>
                        <button onClick={() => handleViewTracking(order)} className="text-orange-500 hover:underline flex items-center gap-1">
                          <Navigation className="w-4 h-4" /> Track Live
                        </button>
                      </div>
                    </div>
                  ))}
                  {orders.filter(o => o.driver_name && ["driver_assigned", "in_transit", "loading"].includes(o.status)).length === 0 && (
                    <div className="text-center py-12">
                      <Navigation className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No active deliveries to track</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ✅ NEW: Withdrawals Tab */}
          {activeTab === "withdrawals" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass rounded-2xl border border-border p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Wallet className="w-6 h-6 text-green-500" /> Withdrawals
                    </h2>
                    <p className="text-sm text-muted-foreground">Request a payout of your earned revenue.</p>
                  </div>
                  <button
                    onClick={() => setShowWithdrawalModal(true)}
                    className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-green-500/20"
                  >
                    <Plus className="w-4 h-4" /> Request Withdrawal
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                    <p className="text-3xl font-bold text-green-500">{formatNaira(stats.revenue)}</p>
                  </div>
                  <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Pending Withdrawals</p>
                    <p className="text-3xl font-bold text-blue-500">
                      {formatNaira(withdrawals.filter(w => w.status === "pending").reduce((sum, w) => sum + (w.amount || 0), 0))}
                    </p>
                  </div>
                  <div className="p-5 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Total Withdrawn</p>
                    <p className="text-3xl font-bold text-purple-500">
                      {formatNaira(withdrawals.filter(w => w.status === "approved").reduce((sum, w) => sum + (w.amount || 0), 0))}
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-4">Recent Requests</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
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
                        withdrawals.map((w) => (
                          <tr key={w.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                            <td className="p-4">{new Date(w.created_at).toLocaleDateString()}</td>
                            <td className="p-4 font-semibold">{formatNaira(w.amount)}</td>
                            <td className="p-4 text-muted-foreground">{w.account_number} ({w.bank_name})</td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                w.status === "approved" ? "bg-green-500/10 text-green-600 border-green-500/30" :
                                w.status === "rejected" ? "bg-red-500/10 text-red-600 border-red-500/30" :
                                "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
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
          )}

          {/* Account Details Tab */}
          {activeTab === "account" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
              <div className="glass rounded-2xl border border-border p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-orange-500/10 rounded-xl">
                    <Building2 className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Account Details</h2>
                    <p className="text-sm text-muted-foreground">Add your bank account information to receive payouts for completed orders.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveAccountDetails} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Bank Name <span className="text-red-500">*</span></label>
                    <select
                      value={accountDetails.bankName}
                      onChange={(e) => setAccountDetails({...accountDetails, bankName: e.target.value})}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>Select your bank</option>
                      {nigerianBanks.map((bank) => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Account Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={accountDetails.accountNumber}
                      onChange={(e) => setAccountDetails({...accountDetails, accountNumber: e.target.value})}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      placeholder="e.g. 0123456789"
                      maxLength={10}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Account Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={accountDetails.accountName}
                      onChange={(e) => setAccountDetails({...accountDetails, accountName: e.target.value})}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      placeholder="e.g. John Doe Enterprises"
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSavingAccount}
                      className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSavingAccount ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                      ) : (
                        <><CheckCircle className="w-4 h-4" /> Save Account Details</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Accept Order Modal */}
      <AnimatePresence>
        {showAcceptModal && selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !acceptingOrderId && setShowAcceptModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto border border-border shadow-2xl">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center"><CheckCircle className="w-8 h-8 text-yellow-500" /></div>
                  <h3 className="text-xl font-bold mb-2">Accept Order?</h3>
                  <p className="text-sm text-muted-foreground">You are accepting this order for <span className="font-semibold text-foreground">{selectedOrder.tonnage} tons</span> of {selectedOrder.material_type}.</p>
                </div>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Material Price (₦)</label>
                    <input type="number" value={materialPrice} onChange={(e) => setMaterialPrice(e.target.value)} className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500" placeholder="Enter price" disabled={acceptingOrderId !== null} />
                    <p className="text-xs text-muted-foreground mt-1">This is the price for the material. Delivery fee will be added separately.</p>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <p className="text-sm text-blue-700 dark:text-blue-300"><strong>Note:</strong> After accepting, the system will search for available drivers for 30 minutes.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowAcceptModal(false)} disabled={acceptingOrderId !== null} className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer disabled:opacity-50">Cancel</button>
                  <button onClick={handleAcceptOrder} disabled={acceptingOrderId !== null || !materialPrice} className="flex-1 py-3 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition-colors cursor-pointer shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {acceptingOrderId === selectedOrder.id ? (<><Loader2 className="w-4 h-4 animate-spin" /> Accepting...</>) : (<><CheckCircle className="w-4 h-4" /> Accept Order</>)}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Upload Evidence Modal */}
      <AnimatePresence>
        {showEvidenceModal && evidenceOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isUploading && setShowEvidenceModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto border border-border shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Upload className="w-5 h-5 text-blue-500" /> Upload Delivery Evidence</h3>
                  <button onClick={() => setShowEvidenceModal(false)} disabled={isUploading} className="p-2 hover:bg-muted rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="mb-6 p-4 bg-muted/50 rounded-xl border border-border">
                  <p className="text-sm font-semibold">{evidenceOrder.material_type}</p>
                  <p className="text-xs text-muted-foreground">{evidenceOrder.tonnage} Tons • {evidenceOrder.delivery_location}</p>
                  <p className="text-xs text-muted-foreground mt-1">Delivered: {new Date(evidenceOrder.delivered_at || evidenceOrder.updated_at).toLocaleDateString()}</p>
                </div>
                <form onSubmit={handleUploadEvidence} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Proof of Delivery <span className="text-red-500">*</span></label>
                    <div onClick={() => !isUploading && fileInputRef.current?.click()} className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors">
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf" className="hidden" disabled={isUploading} />
                      {evidenceFile ? (
                        <div className="flex items-center justify-center gap-2 text-green-600"><FileText className="w-5 h-5" /><span className="text-sm font-medium truncate">{evidenceFile.name}</span></div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground"><Camera className="w-8 h-8" /><span className="text-sm font-medium">Tap to upload photo or document</span><span className="text-xs text-muted-foreground">JPG, PNG, or PDF</span></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Notes (Optional)</label>
                    <textarea value={evidenceNotes} onChange={(e) => setEvidenceNotes(e.target.value)} rows={3} className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" placeholder="e.g. Materials delivered in good condition..." disabled={isUploading} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowEvidenceModal(false)} disabled={isUploading} className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors disabled:opacity-50">Cancel</button>
                    <button type="submit" disabled={isUploading || !evidenceFile} className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {isUploading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>) : (<><Upload className="w-4 h-4" /> Upload Evidence</>)}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tracking Modal */}
      <AnimatePresence>
        {showTrackingModal && trackingOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTrackingModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="glass rounded-2xl max-w-2xl w-full p-6 pointer-events-auto border border-border shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Navigation className="w-6 h-6 text-blue-500" /> Track Order</h3>
                  <button onClick={() => setShowTrackingModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <span className="sr-only">Close</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border">
                    <h4 className="font-bold mb-3">{trackingOrder.material_type}</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-muted-foreground">Tonnage</p><p className="font-semibold">{trackingOrder.tonnage} tons</p></div>
                      <div><p className="text-muted-foreground">Delivery</p><p className="font-semibold">{trackingOrder.delivery_location}</p></div>
                    </div>
                  </div>
                  {trackingOrder.driver_name && (
                    <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                      <h4 className="font-bold mb-3 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Driver Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /><span>{trackingOrder.driver_name}</span></div>
                        <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><a href={`tel:${trackingOrder.driver_phone}`} className="text-orange-500 hover:underline">{trackingOrder.driver_phone}</a></div>
                      </div>
                    </div>
                  )}
                  <div className="p-4 rounded-xl bg-muted/30 border border-border">
                    <h4 className="font-bold mb-4">Order Status</h4>
                    <div className="space-y-3">
                      {[
                        { status: "pending_supplier_acceptance", label: "Order Created", icon: Package },
                        { status: "driver_searching", label: "Searching Driver", icon: Search },
                        { status: "driver_assigned", label: "Driver Assigned", icon: CheckCircle },
                        { status: "loading", label: "Loading Material", icon: Truck },
                        { status: "in_transit", label: "In Transit", icon: Navigation },
                        { status: "delivered", label: "Delivered", icon: CheckCircle },
                      ].map((step, index) => {
                        const isCompleted = Object.keys(getStatusLabel).indexOf(trackingOrder.status) >= Object.keys(getStatusLabel).indexOf(step.status);
                        const StepIcon = step.icon;
                        return (
                          <div key={step.status} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}>
                              <StepIcon className="w-4 h-4" />
                            </div>
                            <span className={`text-sm ${isCompleted ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ✅ NEW: Withdrawal Request Modal */}
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
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto border border-border shadow-2xl">
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

                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl mb-6">
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold text-green-500">{formatNaira(stats.revenue)}</p>
                </div>

                <form onSubmit={handleRequestWithdrawal} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Withdrawal Amount (₦) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-lg font-bold"
                      placeholder="0.00"
                      required
                      disabled={isRequestingWithdrawal}
                    />
                  </div>

                  <div className="p-4 bg-muted/30 rounded-xl border border-border text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground mb-2">Funds will be sent to:</p>
                    <p>{accountDetails.bankName || "No bank account set"}</p>
                    <p>{accountDetails.accountNumber || "****"}</p>
                    <p>{accountDetails.accountName || "****"}</p>
                    {!accountDetails.bankName && (
                      <button 
                        type="button"
                        onClick={() => { setShowWithdrawalModal(false); setActiveTab("account"); }}
                        className="mt-2 text-orange-500 hover:underline font-medium"
                      >
                        Update Account Details
                      </button>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setShowWithdrawalModal(false)}
                      disabled={isRequestingWithdrawal}
                      className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
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

      {/* ✅ NEW: Dispute Modal */}
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
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto border border-border shadow-2xl">
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

                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    ⚠️ Are you experiencing an issue with this order?
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
                      className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                      placeholder="e.g. Driver arrived late, material was damaged, incorrect quantity delivered..."
                      required
                      disabled={isSubmittingDispute}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setShowDisputeModal(false)}
                      disabled={isSubmittingDispute}
                      className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
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
    </DashboardLayout>
  );
}