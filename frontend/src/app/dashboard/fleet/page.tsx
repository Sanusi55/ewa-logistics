"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { 
  Truck, MapPin, Wallet, Star, Navigation, Phone, MessageCircle, 
  CheckCircle, Clock, AlertCircle, Calendar, TrendingUp, Power,
  Package, Settings, ChevronRight, Loader2, DollarSign, X, Key,
  Camera, FileUp, Building2, Plus, AlertTriangle, LogOut, Users,
  LayoutDashboard, ClipboardList, BarChart3, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/providers/toast-provider";
import { createClient } from "@/lib/supabase/client";
import { getAvailableJobs } from "@/app/actions/orders"; 
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
  fleet_company_id: string | null;
  truck_id: string | null;
  created_at: string;
}

interface TruckData {
  id: string;
  truck_name: string;
  plate_number: string;
  capacity_tons: number;
  status: string;
  driver_name?: string;
}

interface DriverData {
  id: string;
  full_name: string;
  phone: string;
  license_number: string;
  truck_id: string | null;
  status: string;
}

interface TruckEarnings {
  truckId: string;
  deliveryCount: number;
  netEarnings: number;
}

export default function FleetDashboardPage() {
  const { addToast } = useToast();
  const supabase = createClient();
  const searchParams = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const urlTab = searchParams.get("tab") as "dashboard" | "fleet" | "deliveries" | "earnings" | "settings";
  const [activeTab, setActiveTab] = useState<"dashboard" | "fleet" | "deliveries" | "earnings" | "settings">(urlTab || "dashboard");
  
  const [companyName, setCompanyName] = useState("Fleet Company");
  const [rcNumber, setRcNumber] = useState("");
  
  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  const [availableJobs, setAvailableJobs] = useState<Order[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<Order[]>([]);
  
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  
  const [truckEarnings, setTruckEarnings] = useState<TruckEarnings[]>([]);
  const [selectedTruckForDrillDown, setSelectedTruckForDrillDown] = useState<TruckData | null>(null);
  const [truckDeliveries, setTruckDeliveries] = useState<any[]>([]);
  const [showTruckDrillDownModal, setShowTruckDrillDownModal] = useState(false);

  // Modals
  const [showBidModal, setShowBidModal] = useState(false);
  const [showAddTruckModal, setShowAddTruckModal] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [selectedTruckId, setSelectedTruckId] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  
  const [newTruck, setNewTruck] = useState({ truck_name: "", plate_number: "", capacity_tons: "" });
  const [newDriver, setNewDriver] = useState({ full_name: "", phone: "", license_number: "" });
  
  // ✅ NEW: Withdrawal & Bank Details States
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [isRequestingWithdrawal, setIsRequestingWithdrawal] = useState(false);
  const [accountDetails, setAccountDetails] = useState({ bankName: "", accountNumber: "", accountName: "" });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Nigerian Banks List for Dropdown
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
    fetchFleetData();
  }, []);

  async function fetchFleetData() {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }

    // 1. Fetch Profile & Bank Details
    const { data: profile } = await supabase.from("profiles").select("full_name, rc_number, bank_name, account_number, account_name").eq("id", user.id).single();
    if (profile) {
      setCompanyName(profile.full_name || "Fleet Company");
      setRcNumber(profile.rc_number || "");
      setAccountDetails({
        bankName: profile.bank_name || "",
        accountNumber: profile.account_number || "",
        accountName: profile.account_name || "",
      });
    }

    // 2. Fetch Trucks
    const { data: trucksData } = await supabase.from("trucks").select("*").eq("company_id", user.id);
    if (trucksData) setTrucks(trucksData);

    // 3. Fetch Drivers
    const { data: driversData } = await supabase.from("fleet_drivers").select("*").eq("company_id", user.id);
    if (driversData) setDrivers(driversData);

    // 4. Fetch Available Jobs
    const jobsResult = await getAvailableJobs();
    if (!jobsResult.error) setAvailableJobs(jobsResult.jobs || []);

    // 5. Fetch Active/Completed Deliveries & Calculate Real Earnings
    // ✅ FIXED: Added all missing fields (pickup_location, delivery_address, driver_id, fleet_company_id, delivery_fee_offer) to satisfy the Order interface
    const { data: ordersData } = await supabase
      .from("orders")
      .select("id, material_type, tonnage, pickup_location, delivery_location, delivery_address, status, delivery_fee, delivery_fee_offer, driver_id, fleet_company_id, truck_id, created_at")
      .eq("fleet_company_id", user.id)
      .order("created_at", { ascending: false });
    
    if (ordersData) {
      setActiveDeliveries(ordersData.filter((o: any) => ["loading", "in_transit", "delivered", "completed"].includes(o.status)));
      
      const earningsMap = new Map<string, { count: number, total: number }>();
      let totalCompletedEarnings = 0;
      let pendingEarnings = 0;

      ordersData.forEach((order: any) => {
        const fee = order.delivery_fee || 0;
        const netFee = fee * 0.95; // 5% EWA commission deducted

        if (order.status === "completed" || order.status === "delivered") {
          totalCompletedEarnings += netFee;
          if (order.truck_id) {
            const current = earningsMap.get(order.truck_id) || { count: 0, total: 0 };
            earningsMap.set(order.truck_id, { count: current.count + 1, total: current.total + netFee });
          }
        } else if (["loading", "in_transit"].includes(order.status)) {
          pendingEarnings += netFee;
        }
      });

      const earningsArray: TruckEarnings[] = [];
      earningsMap.forEach((value, key) => {
        earningsArray.push({ truckId: key, deliveryCount: value.count, netEarnings: value.total });
      });
      
      setTruckEarnings(earningsArray);
      setTotalEarnings(totalCompletedEarnings);
      setAvailableBalance(totalCompletedEarnings); // Completed earnings are available for withdrawal
      setPendingBalance(pendingEarnings);
    }

    // 6. Fetch Withdrawal History
    const { data: withdrawalsData } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (withdrawalsData) setWithdrawals(withdrawalsData);

    setIsLoading(false);
  }

  const handleViewTruckDetails = async (truck: TruckData) => {
    setSelectedTruckForDrillDown(truck);
    setShowTruckDrillDownModal(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("orders")
      .select("id, material_type, tonnage, delivery_location, status, delivery_fee, created_at")
      .eq("fleet_company_id", user.id)
      .eq("truck_id", truck.id)
      .order("created_at", { ascending: false });
      
    if (data) setTruckDeliveries(data);
  };

  const handleAddTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from("trucks").insert({
      company_id: user?.id,
      truck_name: newTruck.truck_name,
      plate_number: newTruck.plate_number,
      capacity_tons: parseFloat(newTruck.capacity_tons),
      status: "active"
    });

    if (error) {
      addToast({ type: "error", title: "Error", message: error.message });
    } else {
      addToast({ type: "success", title: "Success", message: "Truck added successfully!" });
      setShowAddTruckModal(false);
      setNewTruck({ truck_name: "", plate_number: "", capacity_tons: "" });
      fetchFleetData();
    }
    setIsSubmitting(false);
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from("fleet_drivers").insert({
      company_id: user?.id,
      full_name: newDriver.full_name,
      phone: newDriver.phone,
      license_number: newDriver.license_number,
      status: "active"
    });

    if (error) {
      addToast({ type: "error", title: "Error", message: error.message });
    } else {
      addToast({ type: "success", title: "Success", message: "Driver added successfully!" });
      setShowAddDriverModal(false);
      setNewDriver({ full_name: "", phone: "", license_number: "" });
      fetchFleetData();
    }
    setIsSubmitting(false);
  };

  const handleSubmitFleetBid = async () => {
    if (!selectedOrder || !bidAmount || !selectedTruckId) {
      addToast({ type: "error", title: "Error", message: "Please fill in all required fields and select a truck." });
      return;
    }

    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from("driver_bids").insert({
      order_id: selectedOrder.id,
      driver_id: user?.id,
      fleet_company_id: user?.id,
      truck_id: selectedTruckId,
      bid_amount: parseFloat(bidAmount),
      estimated_arrival_minutes: estimatedTime ? parseInt(estimatedTime) : null,
      status: "pending"
    });

    if (error) {
      addToast({ type: "error", title: "Error", message: error.message });
    } else {
      addToast({ type: "success", title: "Bid Submitted!", message: "Your fleet's bid has been sent to the customer." });
      setShowBidModal(false);
      fetchFleetData();
    }
    setIsSubmitting(false);
  };

  const handleSaveAccountDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("profiles").update({
      bank_name: accountDetails.bankName,
      account_number: accountDetails.accountNumber,
      account_name: accountDetails.accountName,
    }).eq("id", user.id);

    if (error) {
      addToast({ type: "error", title: "Error", message: error.message });
    } else {
      addToast({ type: "success", title: "Success", message: "Bank account details saved successfully!" });
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
      addToast({ type: "error", title: "Error", message: "Insufficient available balance." });
      return;
    }
    if (!accountDetails.bankName || !accountDetails.accountNumber || !accountDetails.accountName) {
      addToast({ type: "error", title: "Error", message: "Please save your bank account details first." });
      return;
    }

    setIsRequestingWithdrawal(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("withdrawal_requests").insert({
      user_id: user.id,
      role: "fleet_company",
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
      fetchFleetData();
    }
    setIsRequestingWithdrawal(false);
  };

  const formatNaira = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0);

  if (isLoading) {
    return (
      <div className="pt-24 px-4 md:px-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 md:px-6 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
              <Building2 className="w-8 h-8 text-orange-500" />
              {companyName}
            </h1>
            <p className="text-muted-foreground mt-1">RC: {rcNumber} • Fleet Management Dashboard</p>
          </div>
          <form action={logout}>
            <button className="flex items-center gap-2 px-5 py-3 bg-red-500/10 text-red-600 rounded-xl font-semibold hover:bg-red-500/20 transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </form>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 border-b border-border">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "fleet", label: "My Fleet", icon: Truck },
            { id: "deliveries", label: "Deliveries", icon: ClipboardList },
            { id: "earnings", label: "Earnings", icon: Wallet },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap border ${
                activeTab === tab.id 
                  ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20" 
                  : "bg-transparent text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                  <p className="text-sm text-muted-foreground mb-1">Total Accumulated Net Earnings</p>
                  <p className="text-3xl font-bold text-green-500">{formatNaira(totalEarnings)}</p>
                </div>
                <div className="glass p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                  <p className="text-sm text-muted-foreground mb-1">Available for Withdrawal</p>
                  <p className="text-3xl font-bold text-blue-500">{formatNaira(availableBalance)}</p>
                </div>
                <div className="glass p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
                  <p className="text-sm text-muted-foreground mb-1">Pending (In Transit)</p>
                  <p className="text-3xl font-bold text-yellow-500">{formatNaira(pendingBalance)}</p>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2"><Truck className="w-5 h-5 text-orange-500" /> Fleet Performance</h2>
                  <button onClick={() => setActiveTab("fleet")} className="text-sm text-orange-500 hover:underline flex items-center gap-1">Manage Fleet <ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trucks.length === 0 ? (
                    <p className="text-muted-foreground col-span-full text-center py-8">No trucks added yet. Go to "My Fleet" to add your first truck.</p>
                  ) : (
                    trucks.map((truck) => {
                      const truckStats = truckEarnings.find(e => e.truckId === truck.id);
                      const deliveryCount = truckStats?.deliveryCount || 0;
                      const netEarnings = truckStats?.netEarnings || 0;

                      return (
                        <div key={truck.id} className="p-4 rounded-xl bg-muted/30 border border-border hover:border-orange-500/30 transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold">{truck.truck_name}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${truck.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                              {truck.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">Plate: {truck.plate_number}</p>
                          <p className="text-sm text-muted-foreground mb-3">Capacity: {truck.capacity_tons} Tons</p>
                          <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{deliveryCount} Deliveries</span>
                            <button 
                              onClick={() => handleViewTruckDetails(truck)}
                              className="font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              {formatNaira(netEarnings)} <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* MY FLEET TAB */}
          {activeTab === "fleet" && (
            <motion.div key="fleet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Trucks & Drivers</h2>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddDriverModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors cursor-pointer">
                    <Plus className="w-4 h-4" /> Add Driver
                  </button>
                  <button onClick={() => setShowAddTruckModal(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors cursor-pointer">
                    <Plus className="w-4 h-4" /> Add Truck
                  </button>
                </div>
              </div>

              <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="text-left p-4 font-medium">Truck Name</th>
                      <th className="text-left p-4 font-medium">Plate Number</th>
                      <th className="text-left p-4 font-medium">Capacity</th>
                      <th className="text-left p-4 font-medium">Assigned Driver</th>
                      <th className="text-left p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {trucks.map((truck) => {
                      const assignedDriver = drivers.find(d => d.truck_id === truck.id);
                      return (
                        <tr key={truck.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-4 font-medium">{truck.truck_name}</td>
                          <td className="p-4 text-muted-foreground">{truck.plate_number}</td>
                          <td className="p-4">{truck.capacity_tons} Tons</td>
                          <td className="p-4">{assignedDriver ? assignedDriver.full_name : <span className="text-yellow-500 text-xs">Unassigned</span>}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${truck.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                              {truck.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* DELIVERIES TAB */}
          {activeTab === "deliveries" && (
            <motion.div key="deliveries" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" /> Available Jobs
              </h2>
              {availableJobs.map((job) => (
                <div key={job.id} className="glass rounded-xl p-6 bg-orange-500/5 hover:bg-orange-500/10 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{job.material_type}</h3>
                      <p className="text-sm text-muted-foreground">{job.tonnage} Tons</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Customer Offer</p>
                      <p className="text-xl font-bold text-green-500">{job.delivery_fee_offer ? formatNaira(job.delivery_fee_offer) : "Bidding"}</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div><p className="text-xs text-muted-foreground">Pickup</p><p className="font-medium">{job.pickup_location}</p></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Navigation className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div><p className="text-xs text-muted-foreground">Drop-off</p><p className="font-medium">{job.delivery_location}</p></div>
                    </div>
                  </div>
                  <MagneticButton 
                    onClick={() => { setSelectedOrder(job); setBidAmount(job.delivery_fee_offer?.toString() || ""); setShowBidModal(true); }}
                    className="w-full md:w-auto px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                  >
                    Place Fleet Bid
                  </MagneticButton>
                </div>
              ))}
            </motion.div>
          )}

          {/* EARNINGS TAB */}
          {activeTab === "earnings" && (
            <motion.div key="earnings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-6 glass rounded-2xl bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                  <p className="text-3xl font-bold text-green-500">{formatNaira(availableBalance)}</p>
                </div>
                <div className="p-6 glass rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-muted-foreground mb-1">Pending (In Transit)</p>
                  <p className="text-3xl font-bold text-blue-500">{formatNaira(pendingBalance)}</p>
                </div>
                <div className="p-6 glass rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-sm text-muted-foreground mb-1">Total Withdrawn</p>
                  <p className="text-3xl font-bold text-purple-500">
                    {formatNaira(withdrawals.filter(w => w.status === "approved").reduce((sum: number, w: any) => sum + (w.amount || 0), 0))}
                  </p>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-orange-500" /> Payout Bank Account
                    </h2>
                    <p className="text-sm text-muted-foreground">Ensure your details are correct for seamless withdrawals.</p>
                  </div>
                </div>
                <form onSubmit={handleSaveAccountDetails} className="grid md:grid-cols-3 gap-4 mb-8">
                  <div>
                    <label className="block text-xs font-medium mb-1">Bank Name</label>
                    <select
                      value={accountDetails.bankName}
                      onChange={(e) => setAccountDetails({...accountDetails, bankName: e.target.value})}
                      className="w-full px-3 py-2.5 bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 text-sm appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>Select your bank</option>
                      {nigerianBanks.map((bank) => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Account Number</label>
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
                    <label className="block text-xs font-medium mb-1">Account Name</label>
                    <input
                      type="text"
                      value={accountDetails.accountName}
                      onChange={(e) => setAccountDetails({...accountDetails, accountName: e.target.value})}
                      className="w-full px-3 py-2.5 bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 text-sm"
                      placeholder="Company Name"
                      required
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                    <button type="submit" className="px-6 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors cursor-pointer">
                      Save Bank Details
                    </button>
                  </div>
                </form>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-6 border-t border-border">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-green-500" /> Withdrawal Requests
                    </h2>
                  </div>
                  <button 
                    onClick={() => setShowWithdrawalModal(true)} 
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors cursor-pointer shadow-lg shadow-green-500/20"
                  >
                    <Plus className="w-4 h-4" /> Request Withdrawal
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-muted-foreground border-b border-border">
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
                          <tr key={w.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
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
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="glass rounded-2xl p-8 text-center">
                <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold mb-2">Fleet Settings</h2>
                <p className="text-muted-foreground">Company profile, notification preferences, and advanced fleet configurations will be available here.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Truck Drill-Down Modal */}
      <AnimatePresence>
        {showTruckDrillDownModal && selectedTruckForDrillDown && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTruckDrillDownModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="glass rounded-2xl max-w-2xl w-full p-6 pointer-events-auto shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Truck className="w-6 h-6 text-orange-500" /> {selectedTruckForDrillDown.truck_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">Plate: {selectedTruckForDrillDown.plate_number} • Capacity: {selectedTruckForDrillDown.capacity_tons} Tons</p>
                  </div>
                  <button onClick={() => setShowTruckDrillDownModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                    <p className="text-xs text-muted-foreground mb-1">Total Deliveries</p>
                    <p className="text-2xl font-bold text-green-500">{truckEarnings.find(e => e.truckId === selectedTruckForDrillDown.id)?.deliveryCount || 0}</p>
                  </div>
                  <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <p className="text-xs text-muted-foreground mb-1">Net Earnings (95%)</p>
                    <p className="text-2xl font-bold text-blue-500">{formatNaira(truckEarnings.find(e => e.truckId === selectedTruckForDrillDown.id)?.netEarnings || 0)}</p>
                  </div>
                </div>

                <h4 className="font-bold mb-3 flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Delivery History</h4>
                <div className="space-y-3">
                  {truckDeliveries.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No deliveries recorded for this truck yet.</p>
                  ) : (
                    truckDeliveries.map((delivery: any) => (
                      <div key={delivery.id} className="p-4 bg-muted/30 rounded-xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-sm">{delivery.tonnage} Tons {delivery.material_type}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {delivery.delivery_location}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                            delivery.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                            delivery.status === 'in_transit' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {delivery.status.replace('_', ' ')}
                          </span>
                          <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">
                            {formatNaira((delivery.delivery_fee || 0) * 0.95)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
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
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto shadow-2xl border border-border">
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

                <div className="p-4 bg-green-500/10 rounded-xl mb-6 border border-green-500/20">
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

                  <div className="p-4 bg-muted/30 rounded-xl text-sm text-muted-foreground border border-border">
                    <p className="font-semibold text-foreground mb-2">Funds will be sent to:</p>
                    <p>{accountDetails.bankName || "No bank account set"}</p>
                    <p>{accountDetails.accountNumber || "****"}</p>
                    <p>{accountDetails.accountName || "****"}</p>
                    {!accountDetails.bankName && (
                      <p className="mt-2 text-orange-500 font-medium text-xs">
                        ⚠️ Please save your bank account details above before requesting a withdrawal.
                      </p>
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

      {/* Fleet Bid Modal */}
      <AnimatePresence>
        {showBidModal && selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSubmitting && setShowBidModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2"><DollarSign className="w-6 h-6 text-orange-500" /> Place Fleet Bid</h3>
                  <button onClick={() => setShowBidModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-muted/50 rounded-xl">
                    <p className="font-bold">{selectedOrder.material_type}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.tonnage} Tons • {selectedOrder.delivery_location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Assign Truck <span className="text-red-500">*</span></label>
                    <select 
                      value={selectedTruckId} 
                      onChange={(e) => setSelectedTruckId(e.target.value)}
                      className="w-full px-4 py-3 bg-muted/50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                    >
                      <option value="">Select a truck for this job</option>
                      {trucks.filter(t => t.status === 'active').map(t => (
                        <option key={t.id} value={t.id}>{t.truck_name} ({t.plate_number})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Your Delivery Fee (₦) <span className="text-red-500">*</span></label>
                    <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="w-full px-4 py-3 bg-muted/50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-lg font-bold" placeholder="e.g. 25000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Estimated Arrival (Minutes)</label>
                    <input type="number" value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} className="w-full px-4 py-3 bg-muted/50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 transition-all" placeholder="e.g. 45" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowBidModal(false)} disabled={isSubmitting} className="flex-1 py-3 rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer disabled:opacity-50">Cancel</button>
                  <MagneticButton onClick={handleSubmitFleetBid} disabled={isSubmitting || !bidAmount || !selectedTruckId} className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><CheckCircle className="w-4 h-4" /> Submit Bid</>}
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Truck Modal */}
      <AnimatePresence>
        {showAddTruckModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSubmitting && setShowAddTruckModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto shadow-2xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Truck className="w-6 h-6 text-orange-500" /> Add New Truck</h3>
                <form onSubmit={handleAddTruck} className="space-y-4">
                  <input required type="text" placeholder="Truck Name (e.g. Volvo Tipper)" value={newTruck.truck_name} onChange={(e) => setNewTruck({...newTruck, truck_name: e.target.value})} className="w-full px-4 py-3 bg-muted/50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20" />
                  <input required type="text" placeholder="Plate Number (e.g. ABC-123-DE)" value={newTruck.plate_number} onChange={(e) => setNewTruck({...newTruck, plate_number: e.target.value})} className="w-full px-4 py-3 bg-muted/50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 uppercase" />
                  <input required type="number" placeholder="Capacity in Tons" value={newTruck.capacity_tons} onChange={(e) => setNewTruck({...newTruck, capacity_tons: e.target.value})} className="w-full px-4 py-3 bg-muted/50 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20" />
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowAddTruckModal(false)} className="flex-1 py-3 rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Add Truck</>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Driver Modal */}
      <AnimatePresence>
        {showAddDriverModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSubmitting && setShowAddDriverModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto shadow-2xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Users className="w-6 h-6 text-blue-500" /> Add New Driver</h3>
                <form onSubmit={handleAddDriver} className="space-y-4">
                  <input required type="text" placeholder="Driver Full Name" value={newDriver.full_name} onChange={(e) => setNewDriver({...newDriver, full_name: e.target.value})} className="w-full px-4 py-3 bg-muted/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <input required type="tel" placeholder="Phone Number" value={newDriver.phone} onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})} className="w-full px-4 py-3 bg-muted/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" />
                  <input required type="text" placeholder="Driver's License Number" value={newDriver.license_number} onChange={(e) => setNewDriver({...newDriver, license_number: e.target.value})} className="w-full px-4 py-3 bg-muted/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 uppercase" />
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowAddDriverModal(false)} className="flex-1 py-3 rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Add Driver</>}
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