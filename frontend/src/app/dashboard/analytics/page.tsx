"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { motion } from "framer-motion";
import { TrendingUp, Users, Package, Truck, DollarSign, ArrowUpRight, ArrowDownRight, Calendar, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Mock Performance Data
const performanceData = [
  { month: "Jan", revenue: 4500, orders: 120 },
  { month: "Feb", revenue: 5200, orders: 145 },
  { month: "Mar", revenue: 4800, orders: 132 },
  { month: "Apr", revenue: 6100, orders: 168 },
  { month: "May", revenue: 7200, orders: 195 },
  { month: "Jun", revenue: 8500, orders: 220 },
];

const materialBreakdown = [
  { name: "Granite", value: 45, color: "#3b82f6" },
  { name: "Sand", value: 30, color: "#8b5cf6" },
  { name: "Stone Base", value: 15, color: "#10b981" },
  { name: "Others", value: 10, color: "#f59e0b" },
];

const recentActivity = [
  { id: "ACT-001", type: "Order", desc: "New bulk order for 1-Inch Granite", status: "Completed", time: "2 min ago" },
  { id: "ACT-002", type: "Payment", desc: "Escrow released for Order #ORD-5520", status: "Success", time: "1 hour ago" },
  { id: "ACT-003", type: "Delivery", desc: "Driver Emmanuel O. completed delivery", status: "Delivered", time: "3 hours ago" },
  { id: "ACT-004", type: "Order", desc: "New order for Sharp Sand (10 Tons)", status: "Pending", time: "5 hours ago" },
];

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics 📊</h1>
            <p className="text-muted-foreground mt-1">Track performance, revenue, and order insights.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium cursor-pointer">
              <Calendar className="w-4 h-4" /> Last 30 Days
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium cursor-pointer">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Total Revenue", value: "$42,850", change: "+24.5%", icon: DollarSign, up: true },
            { title: "Orders Processed", value: "1,240", change: "+18.2%", icon: Package, up: true },
            { title: "Active Deliveries", value: "86", change: "+8.1%", icon: Truck, up: true },
            { title: "Customer Retention", value: "94%", change: "-2.3%", icon: Users, up: false },
          ].map((metric, i) => (
            <motion.div key={metric.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass p-5 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{metric.title}</span>
                <metric.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className={`flex items-center gap-1 mt-2 text-sm ${metric.up ? "text-green-500" : "text-red-500"}`}>
                {metric.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{metric.change} vs last month</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6 rounded-xl border border-border">
            <h3 className="font-semibold mb-4">Revenue Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-6 rounded-xl border border-border">
            <h3 className="font-semibold mb-4">Material Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={materialBreakdown} cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={5} dataKey="value">
                    {materialBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {materialBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Recent Activity</h3>
            <button className="text-sm text-primary hover:underline cursor-pointer">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left p-4 font-medium">ID</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium hidden sm:table-cell">Description</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentActivity.map((act) => (
                  <tr key={act.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono text-xs">{act.id}</td>
                    <td className="p-4">{act.type}</td>
                    <td className="p-4 hidden sm:table-cell">{act.desc}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        act.status === "Completed" || act.status === "Success" || act.status === "Delivered" 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {act.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">{act.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}