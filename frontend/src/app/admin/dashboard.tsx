"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Users, Package, DollarSign, TrendingUp,
  CheckCircle, AlertTriangle, Ban, Trash2,
  Search, Download, Settings, Activity, BarChart3,
  Truck, Building2, User, ArrowUpRight, Clock,
  Megaphone, History, Send, RefreshCw, X, Loader2,
  Edit2, UserX, UserCheck, Target, Key, Eye // ✅ Added Key and Eye icons
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/providers/toast-provider";
import { createClient } from "@/lib/supabase/client";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer
} from "recharts";
import {
  getAdminStats,
  getAdminUsers,
  getAdminOrders,
  getAdminDeliveries,
  suspendUser,
  unsuspendUser,
  changeUserRole,
  deleteUser,
  broadcastNotification,
  getAuditLogs,
  getPlatformSettings,
  updatePlatformSetting,
} from "@/app/actions/admin";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  state?: string;
  is_suspended?: boolean;
  suspension_reason?: string;
  created_at: string;
}

// ✅ UPDATED: Added delivery_code, material_type, tonnage for premium admin visibility
interface Order {
  id: string;
  customer_id: string;
  material_type?: string;
  tonnage?: number;
  total_amount: number;
  status: string;
  delivery_address: string;
  delivery_location?: string;
  delivery_code?: string; // ✅ 4-Digit Code
  driver_name?: string;
  is_paid: boolean;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

interface Delivery {
  id: string;
  order_id: string;
  material_name: string;
  status: string;
  driver_id?: string;
  accepted_bid_amount?: number;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details?: any;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

export default function AdminDashboard() {
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // ✅ Sync activeTab with URL query params from AdminLayout sidebar
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
  const [isLoading, setIsLoading] = useState(true);
  
  // Data states
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  
  // Filter states
  const [userFilter, setUserFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  
  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastRoles, setBroadcastRoles] = useState(["customer", "supplier", "driver"]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "deliveries") fetchDeliveries();
    if (activeTab === "audit") fetchAuditLogs();
    if (activeTab === "settings") fetchSettings();
  }, [activeTab, userFilter, userSearch, orderFilter, deliveryFilter]);

  async function fetchAllData() {
    setIsLoading(true);
    const result = await getAdminStats();
    if (result.success) {
      setStats(result.stats);
    }
    await fetchUsers();
    setIsLoading(false);
  }

  async function fetchUsers() {
    const result = await getAdminUsers(userFilter, userSearch);
    if (result.data) setUsers(result.data);
  }

  async function fetchOrders() {
    const result = await getAdminOrders(orderFilter);
    if (result.data) setOrders(result.data);
  }

  async function fetchDeliveries() {
    const result = await getAdminDeliveries(deliveryFilter);
    if (result.data) setDeliveries(result.data);
  }

  async function fetchAuditLogs() {
    const result = await getAuditLogs(100);
    if (result.data) setAuditLogs(result.data);
  }

  async function fetchSettings() {
    const result = await getPlatformSettings();
    if (result.data) setSettings(result.data);
  }

  const handleSuspendUser = async (user: UserProfile) => {
    const reason = prompt(`Why are you suspending ${user.full_name || user.email}?`);
    if (!reason) return;

    const result = await suspendUser(user.id, reason);
    if (result.success) {
      addToast({ type: "success", title: "User Suspended", message: `${user.full_name || user.email} has been suspended.` });
      fetchUsers();
      fetchAllData();
    } else {
      addToast({ type: "error", title: "Error", message: result.error || "Failed to suspend user" });
    }
  };

  const handleUnsuspendUser = async (user: UserProfile) => {
    const result = await unsuspendUser(user.id);
    if (result.success) {
      addToast({ type: "success", title: "User Unsuspended", message: `${user.full_name || user.email} is now active.` });
      fetchUsers();
      fetchAllData();
    } else {
      addToast({ type: "error", title: "Error", message: result.error || "Failed to unsuspend user" });
    }
  };

  const handleChangeRole = async (user: UserProfile, newRole: string) => {
    if (!confirm(`Change ${user.full_name || user.email}'s role to ${newRole}?`)) return;

    const result = await changeUserRole(user.id, newRole);
    if (result.success) {
      addToast({ type: "success", title: "Role Updated", message: `Role changed to ${newRole}` });
      fetchUsers();
    } else {
      addToast({ type: "error", title: "Error", message: result.error || "Failed to change role" });
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (!confirm(`⚠️ DELETE ${user.full_name || user.email}? This cannot be undone!`)) return;

    const result = await deleteUser(user.id);
    if (result.success) {
      addToast({ type: "success", title: "User Deleted", message: `${user.full_name || user.email} has been removed.` });
      fetchUsers();
      fetchAllData();
    } else {
      addToast({ type: "error", title: "Error", message: result.error || "Failed to delete user" });
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastTitle || !broadcastMessage) {
      addToast({ type: "error", title: "Error", message: "Please fill in all fields" });
      return;
    }

    setIsBroadcasting(true);
    const result = await broadcastNotification(broadcastTitle, broadcastMessage, broadcastRoles);
    setIsBroadcasting(false);

    if (result.success) {
      addToast({ 
        type: "success", 
        title: "Broadcast Sent! 📢", 
        message: `Notification sent to ${result.sentCount} users` 
      });
      setBroadcastTitle("");
      setBroadcastMessage("");
    } else {
      addToast({ type: "error", title: "Error", message: result.error || "Failed to send broadcast" });
    }
  };

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-medium">Loading Admin Dashboard...</p>
          <p className="text-slate-400 text-sm mt-1">Fetching platform data</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: `Users (${stats?.users?.total || 0})`, icon: Users },
    { id: "orders", label: `Orders (${stats?.orders?.total || 0})`, icon: Package },
    { id: "deliveries", label: "Deliveries", icon: Truck },
    { id: "broadcast", label: "Broadcast", icon: Megaphone },
    { id: "audit", label: "Audit Logs", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // ✅ Correct snake_case statuses matching the database
  const orderStatuses = ["all", "pending_supplier_acceptance", "driver_searching", "no_driver_available", "driver_assigned", "supplier_driver_assigned", "loading", "in_transit", "delivered", "cancelled"];
  
  const statusConfig: Record<string, { color: string; label: string }> = {
    "pending_supplier_acceptance": { color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", label: "Pending Supplier" },
    "driver_searching": { color: "bg-blue-500/10 text-blue-400 border-blue-500/30", label: "Searching Driver" },
    "no_driver_available": { color: "bg-orange-500/10 text-orange-400 border-orange-500/30", label: "No Driver Available" },
    "driver_assigned": { color: "bg-purple-500/10 text-purple-400 border-purple-500/30", label: "Driver Assigned" },
    "supplier_driver_assigned": { color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30", label: "Supplier Driver" },
    "loading": { color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30", label: "Loading" },
    "in_transit": { color: "bg-blue-500/10 text-blue-400 border-blue-500/30", label: "In Transit" },
    "delivered": { color: "bg-green-500/10 text-green-400 border-green-500/30", label: "Delivered" },
    "cancelled": { color: "bg-red-500/10 text-red-400 border-red-500/30", label: "Cancelled" },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top Header */}
      <div className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg shadow-red-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Control Center</h1>
              <p className="text-xs text-slate-400">EWA Logistics Platform Management</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => fetchAllData()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <Link href="/">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer">
                Back to App
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                router.push(`/admin?tab=${tab.id}`); // ✅ Sync with sidebar
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          
          {/* 📊 OVERVIEW TAB */}
          {activeTab === "overview" && stats && (
            <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              
              {/* Main Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", value: formatNaira(stats.revenue?.total || 0), icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10", change: "+12%" },
                  { label: "Total Users", value: stats.users?.total || 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", change: "+8%" },
                  { label: "Total Orders", value: stats.orders?.total || 0, icon: Package, color: "text-orange-400", bg: "bg-orange-500/10", change: "+15%" },
                  { label: "Success Rate", value: `${stats.performance?.successRate || 0}%`, icon: Target, color: "text-purple-400", bg: "bg-purple-500/10", change: "+3%" },
                ].map((stat, i) => (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> {stat.change}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Secondary Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-white">User Distribution</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Customers", value: stats.users?.customers || 0, color: "bg-blue-500" },
                      { label: "Drivers", value: stats.users?.drivers || 0, color: "bg-purple-500" },
                      { label: "Suppliers", value: stats.users?.suppliers || 0, color: "bg-green-500" },
                      { label: "Admins", value: stats.users?.admins || 0, color: "bg-red-500" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.color}`} />
                          <span className="text-sm text-slate-300">{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-orange-400" />
                    <h3 className="font-semibold text-white">Order Status</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Pending", value: stats.orders?.pending || 0, color: "bg-yellow-500" },
                      { label: "Awaiting Driver", value: stats.orders?.awaitingDriver || 0, color: "bg-blue-500" },
                      { label: "In Transit", value: stats.orders?.inTransit || 0, color: "bg-purple-500" },
                      { label: "Delivered", value: stats.orders?.delivered || 0, color: "bg-green-500" },
                      { label: "Cancelled", value: stats.orders?.cancelled || 0, color: "bg-red-500" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.color}`} />
                          <span className="text-sm text-slate-300">{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <h3 className="font-semibold text-white">Financial Summary</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Total Revenue</span>
                      <span className="text-sm font-bold text-green-400">{formatNaira(stats.revenue?.total || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Pending</span>
                      <span className="text-sm font-bold text-yellow-400">{formatNaira(stats.revenue?.pending || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Driver Earnings</span>
                      <span className="text-sm font-bold text-purple-400">{formatNaira(stats.revenue?.driverEarnings || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Avg Bid</span>
                      <span className="text-sm font-bold text-blue-400">{formatNaira(stats.performance?.avgBidAmount || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Revenue & Orders (Last 7 Days)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.revenueByDay || []}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#f97316" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* 👥 USERS TAB */}
          {activeTab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              
              {/* Filters */}
              <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700 flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search users by name or email..." 
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg outline-none focus:ring-2 ring-orange-500/20 focus:border-orange-500 text-white text-sm"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["all", "customer", "driver", "supplier", "admin"].map((filter) => (
                    <button 
                      key={filter}
                      onClick={() => setUserFilter(filter)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                        userFilter === filter 
                          ? "bg-gradient-to-r from-red-500 to-orange-500 text-white" 
                          : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900/50 text-slate-400">
                      <tr>
                        <th className="text-left p-4 font-medium">User</th>
                        <th className="text-left p-4 font-medium">Role</th>
                        <th className="text-left p-4 font-medium hidden md:table-cell">State</th>
                        <th className="text-left p-4 font-medium hidden md:table-cell">Status</th>
                        <th className="text-left p-4 font-medium hidden lg:table-cell">Joined</th>
                        <th className="text-right p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        const roleConfig: Record<string, { icon: any; color: string }> = {
                          customer: { icon: User, color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
                          driver: { icon: Truck, color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
                          supplier: { icon: Building2, color: "bg-green-500/10 text-green-400 border-green-500/30" },
                          admin: { icon: Shield, color: "bg-red-500/10 text-red-400 border-red-500/30" },
                        };
                        const role = roleConfig[user.role] || roleConfig.customer;
                        const RoleIcon = role.icon;
                        
                        return (
                          <tr key={user.id} className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-white truncate">{user.full_name || "No Name"}</p>
                                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium capitalize border ${role.color}`}>
                                <RoleIcon className="w-3 h-3" />
                                {user.role}
                              </span>
                            </td>
                            <td className="p-4 text-slate-300 hidden md:table-cell">{user.state || "-"}</td>
                            <td className="p-4 hidden md:table-cell">
                              {user.is_suspended ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30">
                                  <Ban className="w-3 h-3" /> Suspended
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30">
                                  <CheckCircle className="w-3 h-3" /> Active
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-slate-400 text-xs hidden lg:table-cell">{formatDate(user.created_at)}</td>
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-1">
                                {user.is_suspended ? (
                                  <button 
                                    onClick={() => handleUnsuspendUser(user)}
                                    className="p-1.5 hover:bg-green-500/10 text-green-400 rounded-lg transition-colors cursor-pointer" 
                                    title="Unsuspend"
                                  >
                                    <UserCheck className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleSuspendUser(user)}
                                    className="p-1.5 hover:bg-yellow-500/10 text-yellow-400 rounded-lg transition-colors cursor-pointer" 
                                    title="Suspend"
                                  >
                                    <UserX className="w-4 h-4" />
                                  </button>
                                )}
                                <select 
                                  onChange={(e) => handleChangeRole(user, e.target.value)}
                                  value={user.role}
                                  className="px-2 py-1 bg-slate-700 border border-slate-600 rounded-lg text-xs text-white cursor-pointer"
                                >
                                  <option value="customer">Customer</option>
                                  <option value="driver">Driver</option>
                                  <option value="supplier">Supplier</option>
                                  <option value="admin">Admin</option>
                                </select>
                                <button 
                                  onClick={() => handleDeleteUser(user)}
                                  className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors cursor-pointer" 
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {users.length === 0 && (
                  <div className="p-12 text-center text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No users match your filters</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 📦 ORDERS TAB (✅ UPGRADED WITH DELIVERY CODES) */}
          {activeTab === "orders" && (
            <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              
              {/* Filters */}
              <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700 flex gap-2 flex-wrap">
                {orderStatuses.map((filter) => (
                  <button 
                    key={filter}
                    onClick={() => setOrderFilter(filter)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                      orderFilter === filter 
                        ? "bg-gradient-to-r from-red-500 to-orange-500 text-white" 
                        : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                    }`}
                  >
                    {filter === "all" ? "All" : filter.replace(/_/g, " ")}
                  </button>
                ))}
              </div>

              {/* Orders Table */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900/50 text-slate-400">
                      <tr>
                        <th className="text-left p-4 font-medium">Order ID</th>
                        <th className="text-left p-4 font-medium">Customer</th>
                        <th className="text-left p-4 font-medium hidden lg:table-cell">Material</th>
                        <th className="text-left p-4 font-medium">Amount</th>
                        <th className="text-left p-4 font-medium">Delivery Code</th>
                        <th className="text-left p-4 font-medium hidden md:table-cell">Status</th>
                        <th className="text-right p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const status = statusConfig[order.status] || { color: "bg-slate-500/10 text-slate-400", label: order.status };
                        return (
                          <tr key={order.id} className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
                            <td className="p-4 font-mono text-xs text-slate-300">ORD-{order.id.slice(0, 8).toUpperCase()}</td>
                            <td className="p-4">
                              <div className="min-w-0">
                                <p className="text-sm text-white truncate">{order.profiles?.full_name || "Unknown"}</p>
                                <p className="text-xs text-slate-400 truncate">{order.profiles?.email}</p>
                              </div>
                            </td>
                            <td className="p-4 hidden lg:table-cell">
                              <p className="text-sm text-white">{order.material_type || "N/A"}</p>
                              <p className="text-xs text-slate-400">{order.tonnage ? `${order.tonnage} Tons` : ""}</p>
                            </td>
                            <td className="p-4 font-semibold text-white">{formatNaira(order.total_amount)}</td>
                            
                            {/* ✅ PREMIUM: 4-Digit Delivery Code Badge */}
                            <td className="p-4">
                              {order.delivery_code ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30 font-mono tracking-wider">
                                  <Key className="w-3.5 h-3.5" />
                                  {order.delivery_code}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500">-</span>
                              )}
                            </td>
                            
                            <td className="p-4 hidden md:table-cell">
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${status.color}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <Link href={`/dashboard/tracking?id=${order.id}`} target="_blank">
                                <button className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 cursor-pointer flex items-center gap-1.5 ml-auto">
                                  <Eye className="w-3.5 h-3.5" /> Track & Evidence
                                </button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {orders.length === 0 && (
                  <div className="p-12 text-center text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No orders found</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 🚚 DELIVERIES TAB */}
          {activeTab === "deliveries" && (
            <motion.div key="deliveries" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              
              {/* Filters */}
              <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700 flex gap-2 flex-wrap">
                {orderStatuses.map((filter) => (
                  <button 
                    key={filter}
                    onClick={() => setDeliveryFilter(filter)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                      deliveryFilter === filter 
                        ? "bg-gradient-to-r from-red-500 to-orange-500 text-white" 
                        : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                    }`}
                  >
                    {filter === "all" ? "All" : filter.replace(/_/g, " ")}
                  </button>
                ))}
              </div>

              {/* Deliveries Table */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900/50 text-slate-400">
                      <tr>
                        <th className="text-left p-4 font-medium">Material</th>
                        <th className="text-left p-4 font-medium">Driver</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Bid Amount</th>
                        <th className="text-left p-4 font-medium hidden md:table-cell">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveries.map((delivery) => {
                        const status = statusConfig[delivery.status] || { color: "bg-slate-500/10 text-slate-400", label: delivery.status };
                        return (
                          <tr key={delivery.id} className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
                            <td className="p-4">
                              <p className="font-medium text-white">{delivery.material_name || "N/A"}</p>
                              <p className="text-xs text-slate-400">ID: {delivery.id.slice(0, 8)}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm text-slate-300">{delivery.profiles?.full_name || "Not Assigned"}</p>
                              <p className="text-xs text-slate-400">{delivery.profiles?.email || "-"}</p>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${status.color}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="p-4 font-semibold text-white">
                              {delivery.accepted_bid_amount ? formatNaira(delivery.accepted_bid_amount) : "-"}
                            </td>
                            <td className="p-4 text-slate-400 text-xs hidden md:table-cell">{formatDate(delivery.created_at)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {deliveries.length === 0 && (
                  <div className="p-12 text-center text-slate-400">
                    <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No deliveries found</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 📢 BROADCAST TAB */}
          {activeTab === "broadcast" && (
            <motion.div key="broadcast" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-orange-400" />
                  Send Broadcast Notification
                </h3>
                <p className="text-sm text-slate-400 mb-6">Send a notification to all users of selected roles</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                    <input 
                      type="text"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl outline-none focus:ring-2 ring-orange-500/20 focus:border-orange-500 text-white"
                      placeholder="e.g. Platform Maintenance Notice"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                    <textarea 
                      rows={4}
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl outline-none focus:ring-2 ring-orange-500/20 focus:border-orange-500 text-white resize-none"
                      placeholder="Type your message here..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Target Roles</label>
                    <div className="flex gap-2 flex-wrap">
                      {["customer", "supplier", "driver"].map((role) => (
                        <button
                          key={role}
                          onClick={() => {
                            setBroadcastRoles(prev => 
                              prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
                            );
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all cursor-pointer ${
                            broadcastRoles.includes(role)
                              ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleBroadcast}
                    disabled={isBroadcasting || !broadcastTitle || !broadcastMessage || broadcastRoles.length === 0}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isBroadcasting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send Broadcast
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 📝 AUDIT LOGS TAB */}
          {activeTab === "audit" && (
            <motion.div key="audit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-orange-400" />
                    Recent Admin Actions
                  </h3>
                  <button 
                    onClick={fetchAuditLogs}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <div className="divide-y divide-slate-700">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg flex-shrink-0">
                          <Activity className="w-4 h-4 text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium">{log.action.replace(/_/g, " ")}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            By: {log.profiles?.full_name || log.profiles?.email || "Unknown"} 
                            {log.target_type && ` • Target: ${log.target_type}`}
                          </p>
                          {log.details && (
                            <p className="text-xs text-slate-500 mt-1 font-mono">
                              {JSON.stringify(log.details).slice(0, 100)}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">{formatTime(log.created_at)}</span>
                      </div>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                      <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No audit logs yet</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ⚙️ SETTINGS TAB */}
          {activeTab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-400" />
                  Platform Settings
                </h3>
                <div className="space-y-3">
                  {Object.entries(settings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-700 hover:border-slate-600 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-white">{key.replace(/_/g, " ")}</p>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">{value}</p>
                      </div>
                      <button 
                        onClick={() => {
                          const newValue = prompt(`Update ${key}:`, value);
                          if (newValue !== null && newValue !== value) {
                            updatePlatformSetting(key, newValue).then(result => {
                              if (result.success) {
                                addToast({ type: "success", title: "Updated", message: `${key} has been updated` });
                                fetchSettings();
                              }
                            });
                          }
                        }}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}