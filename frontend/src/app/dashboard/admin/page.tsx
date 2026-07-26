"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Users, Package, DollarSign, TrendingUp, TrendingDown,
  CheckCircle, XCircle, AlertTriangle, Ban, Eye, Edit2, Trash2,
  Search, Filter, Download, Settings, Bell, Activity, BarChart3,
  Truck, Building2, User, ArrowUpRight, ArrowDownRight, Clock,
  Mail, Phone, MapPin, Star, Calendar, CreditCard, Lock, Globe,
  Percent, FileText, Database, Zap, Award, MessageSquare, Check, MoreHorizontal
} from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useToast } from "@/components/providers/toast-provider";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend 
} from "recharts";

// 📊 Platform-Wide Stats
const platformStats = [
  { label: "Total Revenue", value: "$142,580", change: "+24.5%", icon: DollarSign, color: "text-green-500", up: true },
  { label: "Total Users", value: "2,847", change: "+12.3%", icon: Users, color: "text-blue-500", up: true },
  { label: "Active Orders", value: "186", change: "+8.7%", icon: Package, color: "text-purple-500", up: true },
  { label: "Open Disputes", value: "7", change: "-14.2%", icon: AlertTriangle, color: "text-orange-500", up: false },
];

// 📈 Revenue Chart Data
const revenueChartData = [
  { month: "Jan", revenue: 18500, orders: 142 },
  { month: "Feb", revenue: 22400, orders: 168 },
  { month: "Mar", revenue: 19800, orders: 155 },
  { month: "Apr", revenue: 28100, orders: 198 },
  { month: "May", revenue: 32500, orders: 224 },
  { month: "Jun", revenue: 42580, orders: 286 },
];

// 👥 User Distribution
const userDistribution = [
  { name: "Customers", value: 1850, color: "#3b82f6" },
  { name: "Drivers", value: 642, color: "#8b5cf6" },
  { name: "Suppliers", value: 355, color: "#10b981" },
];

// 👤 Users Data
const allUsers = [
  { id: "U-001", name: "Chioma Adeyemi", email: "chioma@buildright.com", role: "customer", status: "active", joined: "2026-01-15", orders: 24 },
  { id: "U-002", name: "Emmanuel Okafor", email: "emma.driver@gmail.com", role: "driver", status: "active", joined: "2026-02-03", orders: 156 },
  { id: "U-003", name: "Sagamu Quarry Ltd", email: "info@sagamuquarry.ng", role: "supplier", status: "pending", joined: "2026-05-28", orders: 0 },
  { id: "U-004", name: "Musa Abdullahi", email: "musa.trucks@yahoo.com", role: "driver", status: "active", joined: "2026-03-12", orders: 89 },
  { id: "U-005", name: "Lekki Construction Co", email: "ops@lekkicon.ng", role: "customer", status: "active", joined: "2026-01-28", orders: 67 },
  { id: "U-006", name: "Adebayo Stones", email: "adebayo@stones.ng", role: "supplier", status: "active", joined: "2026-02-20", orders: 312 },
  { id: "U-007", name: "Grace Nwankwo", email: "grace.n@gmail.com", role: "customer", status: "suspended", joined: "2026-04-05", orders: 8 },
  { id: "U-008", name: "Ibadan Granite Hub", email: "sales@ibadangranite.ng", role: "supplier", status: "pending", joined: "2026-05-30", orders: 0 },
];

// 📦 Recent Orders
const recentOrders = [
  { id: "ORD-5521", customer: "BuildRight Ltd", driver: "Emmanuel O.", amount: "$2,450", status: "in-transit", date: "2 hours ago" },
  { id: "ORD-5520", customer: "Lekki Construction", driver: "Musa A.", amount: "$1,890", status: "delivered", date: "5 hours ago" },
  { id: "ORD-5519", customer: "Green Homes", driver: "John T.", amount: "$3,200", status: "pending", date: "8 hours ago" },
  { id: "ORD-5518", customer: "City Architects", driver: "Peter K.", amount: "$980", status: "disputed", date: "1 day ago" },
  { id: "ORD-5517", customer: "North Builders", driver: "Samuel O.", amount: "$4,100", status: "delivered", date: "1 day ago" },
  { id: "ORD-5516", customer: "Delta Developers", driver: "James E.", amount: "$1,650", status: "cancelled", date: "2 days ago" },
];

// 💰 Pending Payouts
const pendingPayouts = [
  { id: "PAY-101", recipient: "Sagamu Quarry Ltd", role: "supplier", amount: "$8,450", method: "Bank Transfer", requested: "2 hours ago" },
  { id: "PAY-102", recipient: "Emmanuel Okafor", role: "driver", amount: "$1,240", method: "Bank Transfer", requested: "5 hours ago" },
  { id: "PAY-103", recipient: "Adebayo Stones", role: "supplier", amount: "$12,800", method: "Bank Transfer", requested: "1 day ago" },
  { id: "PAY-104", recipient: "Musa Abdullahi", role: "driver", amount: "$890", method: "Mobile Money", requested: "1 day ago" },
];

export default function AdminDashboardPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [userFilter, setUserFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "orders", label: "Orders", icon: Package },
    { id: "payouts", label: "Payouts", icon: DollarSign },
    { id: "analytics", label: "Analytics", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = userFilter === "all" || u.role === userFilter || u.status === userFilter;
    return matchesSearch && matchesFilter;
  });

  const toggleSelectUser = (id: string) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleBulkAction = (action: string) => {
    addToast({ 
      type: "success", 
      title: `Bulk Action Successful`, 
      message: `${action} applied to ${selectedUsers.length} user(s).` 
    });
    setSelectedUsers([]);
  };

  const handleExport = () => {
    addToast({ 
      type: "info", 
      title: "Exporting Data...", 
      message: "Your CSV report is being generated and will download shortly." 
    });
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg shadow-orange-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Admin Control Center
                <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full font-medium">
                  GOD MODE
                </span>
              </h1>
              <p className="text-muted-foreground text-sm">Full platform management & oversight</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export Data
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium cursor-pointer shadow-lg shadow-orange-500/20">
              <Bell className="w-4 h-4" /> 3 Alerts
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          
          {/* 📊 OVERVIEW TAB */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {platformStats.map((stat, i) => (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass p-5 rounded-xl border border-border"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? "text-green-500" : "text-red-500"}`}>
                        {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {stat.change}
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass p-6 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Platform Revenue</h3>
                    <span className="text-xs text-muted-foreground">Last 6 months</span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueChartData}>
                        <defs>
                          <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                        <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fill="url(#adminRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass p-6 rounded-xl border border-border">
                  <h3 className="font-semibold mb-4">User Distribution</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={userDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                          {userDistribution.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-2">
                    {userDistribution.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{item.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-xl border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" /> Live Platform Activity
                  </h3>
                  <span className="text-xs flex items-center gap-1 text-green-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: Package, text: "New order #ORD-5521 placed by BuildRight Ltd", time: "2 min ago", color: "text-blue-500" },
                    { icon: User, text: "New supplier 'Ibadan Granite Hub' awaiting verification", time: "15 min ago", color: "text-purple-500" },
                    { icon: DollarSign, text: "Payout of $8,450 requested by Sagamu Quarry", time: "1 hour ago", color: "text-green-500" },
                    { icon: AlertTriangle, text: "Dispute opened on order #ORD-5518", time: "2 hours ago", color: "text-orange-500" },
                    { icon: CheckCircle, text: "Driver Emmanuel O. completed delivery for #ORD-5520", time: "3 hours ago", color: "text-green-500" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`p-2 rounded-lg bg-muted ${activity.color}`}>
                        <activity.icon className="w-4 h-4" />
                      </div>
                      <p className="flex-1 text-sm">{activity.text}</p>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* 👥 USERS TAB (ENHANCED) */}
          {activeTab === "users" && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              
              {/* Filters & Bulk Actions */}
              <div className="glass p-4 rounded-xl border border-border flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search users by name or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg outline-none focus:ring-2 ring-orange-500/20 focus:border-orange-500 text-sm"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["all", "customer", "driver", "supplier", "pending", "suspended"].map((filter) => (
                    <button 
                      key={filter}
                      onClick={() => setUserFilter(filter)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                        userFilter === filter 
                          ? "bg-orange-500 text-white" 
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bulk Action Bar */}
              <AnimatePresence>
                {selectedUsers.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl"
                  >
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      {selectedUsers.length} user(s) selected
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleBulkAction("Approved")} className="px-3 py-1.5 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                      <button onClick={() => handleBulkAction("Suspended")} className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer flex items-center gap-1">
                        <Ban className="w-3 h-3" /> Suspend
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Users Table */}
              <div className="glass rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="text-left p-4 font-medium w-12">
                          <input 
                            type="checkbox" 
                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded border-border cursor-pointer accent-orange-500"
                          />
                        </th>
                        <th className="text-left p-4 font-medium">User</th>
                        <th className="text-left p-4 font-medium">Role</th>
                        <th className="text-left p-4 font-medium hidden md:table-cell">Joined</th>
                        <th className="text-left p-4 font-medium hidden md:table-cell">Activity</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-right p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        const roleConfig = {
                          customer: { icon: User, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
                          driver: { icon: Truck, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
                          supplier: { icon: Building2, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
                        };
                        const statusConfig = {
                          active: { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", label: "Active" },
                          pending: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Pending" },
                          suspended: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", label: "Suspended" },
                        };
                        const RoleIcon = roleConfig[user.role as keyof typeof roleConfig].icon;
                        const status = statusConfig[user.status as keyof typeof statusConfig];
                        const isSelected = selectedUsers.includes(user.id);
                        
                        return (
                          <tr key={user.id} className={`border-t border-border hover:bg-muted/30 transition-colors ${isSelected ? "bg-orange-500/5" : ""}`}>
                            <td className="p-4">
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => toggleSelectUser(user.id)}
                                className="rounded border-border cursor-pointer accent-orange-500"
                              />
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold">
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium capitalize ${roleConfig[user.role as keyof typeof roleConfig].color}`}>
                                <RoleIcon className="w-3 h-3" />
                                {user.role}
                              </span>
                            </td>
                            <td className="p-4 text-muted-foreground hidden md:table-cell">{user.joined}</td>
                            <td className="p-4 hidden md:table-cell">
                              <span className="font-medium">{user.orders}</span>
                              <span className="text-muted-foreground text-xs ml-1">orders</span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-1">
                                <button className="p-1.5 hover:bg-muted rounded transition-colors cursor-pointer" title="View"><Eye className="w-4 h-4" /></button>
                                <button className="p-1.5 hover:bg-muted rounded transition-colors cursor-pointer" title="Edit"><Edit2 className="w-4 h-4" /></button>
                                <button className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded transition-colors cursor-pointer" title="Ban"><Ban className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No users match your filters</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 📦 ORDERS TAB */}
          {activeTab === "orders" && (
            <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { label: "In Transit", count: 86, color: "text-blue-500" },
                  { label: "Delivered", count: 142, color: "text-green-500" },
                  { label: "Pending", count: 24, color: "text-yellow-500" },
                  { label: "Disputed", count: 7, color: "text-red-500" },
                ].map((stat) => (
                  <div key={stat.label} className="glass p-4 rounded-xl border border-border">
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="glass rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold">Recent Orders</h3>
                  <button className="text-sm text-orange-500 hover:underline cursor-pointer">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="text-left p-4 font-medium">Order ID</th>
                        <th className="text-left p-4 font-medium">Customer</th>
                        <th className="text-left p-4 font-medium hidden md:table-cell">Driver</th>
                        <th className="text-left p-4 font-medium">Amount</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium hidden md:table-cell">Time</th>
                        <th className="text-right p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => {
                        const statusConfig: Record<string, { color: string; label: string }> = {
                          "in-transit": { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", label: "In Transit" },
                          "delivered": { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", label: "Delivered" },
                          "pending": { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Pending" },
                          "disputed": { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", label: "Disputed" },
                          "cancelled": { color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400", label: "Cancelled" },
                        };
                        const status = statusConfig[order.status];
                        
                        return (
                          <tr key={order.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                            <td className="p-4 font-mono text-xs">{order.id}</td>
                            <td className="p-4">{order.customer}</td>
                            <td className="p-4 text-muted-foreground hidden md:table-cell">{order.driver}</td>
                            <td className="p-4 font-semibold">{order.amount}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="p-4 text-muted-foreground text-xs hidden md:table-cell">{order.date}</td>
                            <td className="p-4 text-right">
                              <button className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 cursor-pointer">
                                {order.status === "disputed" ? "Resolve" : "View"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* 💰 PAYOUTS TAB */}
          {activeTab === "payouts" && (
            <motion.div key="payouts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="glass p-5 rounded-xl border border-border bg-gradient-to-br from-green-500/10 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">Pending Payouts</span>
                  </div>
                  <div className="text-2xl font-bold">$23,380</div>
                  <p className="text-xs text-muted-foreground mt-1">4 requests awaiting approval</p>
                </div>
                <div className="glass p-5 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Paid This Month</span>
                  </div>
                  <div className="text-2xl font-bold">$86,420</div>
                  <p className="text-xs text-muted-foreground mt-1">142 successful payouts</p>
                </div>
                <div className="glass p-5 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Platform Fees Earned</span>
                  </div>
                  <div className="text-2xl font-bold">$4,280</div>
                  <p className="text-xs text-muted-foreground mt-1">2.5% commission</p>
                </div>
              </div>

              <div className="glass rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">Pending Payout Requests</h3>
                </div>
                <div className="divide-y divide-border">
                  {pendingPayouts.map((payout) => {
                    const roleConfig = {
                      driver: { icon: Truck, color: "text-purple-500" },
                      supplier: { icon: Building2, color: "text-green-500" },
                    };
                    const RoleIcon = roleConfig[payout.role as keyof typeof roleConfig].icon;
                    
                    return (
                      <div key={payout.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-muted ${roleConfig[payout.role as keyof typeof roleConfig].color}`}>
                            <RoleIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium">{payout.recipient}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="capitalize">{payout.role}</span>
                              <span>•</span>
                              <span>{payout.method}</span>
                              <span>•</span>
                              <span>{payout.requested}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold">${payout.amount}</span>
                          <button 
                            onClick={() => addToast({ type: "success", title: "Payout Approved", message: `$${payout.amount} released to ${payout.recipient}` })}
                            className="px-3 py-1.5 text-xs bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> Approve
                          </button>
                          <button 
                            onClick={() => addToast({ type: "error", title: "Payout Rejected", message: `Request from ${payout.recipient} has been declined.` })}
                            className="px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* 📈 ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="glass p-6 rounded-xl border border-border">
                <h3 className="font-semibold mb-4">Orders vs Revenue (6 Months)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Orders" />
                      <Bar yAxisId="right" dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass p-6 rounded-xl border border-border">
                  <h3 className="font-semibold mb-4">Top Performing Materials</h3>
                  <div className="space-y-3">
                    {[
                      { name: "1-Inch Granite", sales: 486, revenue: "$21,870" },
                      { name: "Sharp Sand", sales: 342, revenue: "$8,550" },
                      { name: "3/4 Granite", sales: 298, revenue: "$11,920" },
                      { name: "Stone Base", sales: 184, revenue: "$5,520" },
                    ].map((mat, i) => (
                      <div key={mat.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <span className="font-medium text-sm">{mat.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{mat.revenue}</p>
                          <p className="text-xs text-muted-foreground">{mat.sales} sales</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass p-6 rounded-xl border border-border">
                  <h3 className="font-semibold mb-4">Top Regions</h3>
                  <div className="space-y-3">
                    {[
                      { name: "Lagos", percent: 42, count: "1,196 orders" },
                      { name: "Abuja", percent: 24, count: "684 orders" },
                      { name: "Port Harcourt", percent: 18, count: "513 orders" },
                      { name: "Ibadan", percent: 10, count: "285 orders" },
                      { name: "Others", percent: 6, count: "169 orders" },
                    ].map((region) => (
                      <div key={region.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium">{region.name}</span>
                          <span className="text-xs text-muted-foreground">{region.count}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                            style={{ width: `${region.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ⚙️ SETTINGS TAB */}
          {activeTab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="glass p-6 rounded-xl border border-border">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-orange-500" /> Commission & Fees
                </h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Platform Commission (%)</label>
                      <input 
                        type="number" 
                        defaultValue="2.5" 
                        step="0.1"
                        className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg outline-none focus:ring-2 ring-orange-500/20 focus:border-orange-500"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Percentage charged on each transaction</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Max Commission Cap</label>
                      <input 
                        type="text" 
                        defaultValue="5000" 
                        className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg outline-none focus:ring-2 ring-orange-500/20 focus:border-orange-500"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Maximum commission per order (₦)</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => addToast({ type: "success", title: "Settings Saved", message: "Commission rates updated successfully." })}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium cursor-pointer transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="glass p-6 rounded-xl border border-border">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-orange-500" /> Service Configuration
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Enable Escrow System", desc: "Hold funds until delivery confirmation", defaultChecked: true },
                    { label: "Allow Supplier Bidding", desc: "Let suppliers compete on price", defaultChecked: true },
                    { label: "Auto-Approve Verified Suppliers", desc: "Skip manual review for verified partners", defaultChecked: false },
                    { label: "Enable Referral Program", desc: "Reward users for inviting others", defaultChecked: true },
                    { label: "Maintenance Mode", desc: "Temporarily disable new orders", defaultChecked: false },
                  ].map((setting) => (
                    <div key={setting.label} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium text-sm">{setting.label}</p>
                        <p className="text-xs text-muted-foreground">{setting.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={setting.defaultChecked} className="sr-only peer" />
                        <div className="w-11 h-6 bg-muted peer-checked:bg-orange-500 rounded-full peer-focus:ring-2 peer-focus:ring-orange-500/50 transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass p-6 rounded-xl border border-red-500/30 bg-red-500/5">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-5 h-5" /> Danger Zone
                </h3>
                <p className="text-sm text-muted-foreground mb-4">These actions are irreversible. Proceed with caution.</p>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => addToast({ type: "warning", title: "Payouts Suspended", message: "All platform payouts have been temporarily halted." })}
                    className="px-4 py-2 border border-red-500 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/10 text-sm font-medium cursor-pointer transition-colors"
                  >
                    Suspend All Payouts
                  </button>
                  <button 
                    onClick={() => addToast({ type: "success", title: "Cache Cleared", message: "Platform cache has been successfully cleared." })}
                    className="px-4 py-2 border border-red-500 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/10 text-sm font-medium cursor-pointer transition-colors"
                  >
                    Clear Platform Cache
                  </button>
                  <button 
                    onClick={() => addToast({ type: "error", title: "Maintenance Mode", message: "The platform is now in maintenance mode." })}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium cursor-pointer transition-colors"
                  >
                    Enable Maintenance Mode
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
}