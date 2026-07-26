"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, Building2, ShieldCheck, ArrowUpRight, ArrowDownRight, 
  Search, Filter, Plus, MoreHorizontal, CheckCircle, Clock, 
  AlertCircle, XCircle, Wallet, Download, Smartphone
} from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useToast } from "@/components/providers/toast-provider";

// Mock Payment Data (Using Naira ₦)
const mockTransactions = [
  { id: "TXN-8891", date: "2026-06-01", desc: "Order #ORD-9921 - 5 tons 1-Inch Granite", type: "debit", amount: 285000, status: "escrow", method: "Bank Transfer" },
  { id: "TXN-8885", date: "2026-05-28", desc: "Order #ORD-9918 - 10 tons Sharp Sand", type: "debit", amount: 150000, status: "success", method: "Card (**** 4242)" },
  { id: "TXN-8880", date: "2026-05-25", desc: "Wallet Top-up", type: "credit", amount: 500000, status: "success", method: "Bank Transfer" },
  { id: "TXN-8875", date: "2026-05-20", desc: "Order #ORD-9910 - 3 tons 3/4 Granite", type: "debit", amount: 135000, status: "refunded", method: "Card (**** 4242)" },
  { id: "TXN-8870", date: "2026-05-15", desc: "Order #ORD-9905 - 8 tons Hardcore Granite", type: "debit", amount: 320000, status: "success", method: "Bank Transfer" },
];

const paymentMethods = [
  { id: "pm_1", type: "bank", name: "Access Bank", account: "**** 7890", isDefault: true },
  { id: "pm_2", type: "card", name: "Visa Debit", account: "**** 4242", isDefault: false },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  "success": { label: "Completed", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30", icon: CheckCircle },
  "pending": { label: "Pending", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30", icon: Clock },
  "escrow": { label: "Held in Escrow", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30", icon: ShieldCheck },
  "refunded": { label: "Refunded", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30", icon: ArrowUpRight },
  "failed": { label: "Failed", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", icon: XCircle },
};

// Skeleton Loader
function PaymentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass p-5 rounded-xl border border-border animate-pulse">
            <div className="h-4 w-24 bg-muted rounded mb-3" />
            <div className="h-8 w-32 bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="glass p-6 rounded-xl border border-border animate-pulse space-y-4">
        <div className="h-6 w-40 bg-muted rounded" />
        {[1, 2, 3, 4].map(i => <div key={i} className="h-16 w-full bg-muted rounded-lg" />)}
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredTransactions = mockTransactions.filter(txn => {
    const matchesSearch = txn.desc.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          txn.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || txn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalSpent: mockTransactions.filter(t => t.type === "debit" && t.status === "success").reduce((acc, curr) => acc + curr.amount, 0),
    inEscrow: mockTransactions.filter(t => t.status === "escrow").reduce((acc, curr) => acc + curr.amount, 0),
    walletBalance: 500000, // Mock wallet balance
  };

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
  };

  const handleAddMethod = () => {
    addToast({ type: "info", title: "Add Payment Method", message: "Opening secure Paystack modal..." });
  };

  const handleSetDefault = (id: string) => {
    addToast({ type: "success", title: "Default Updated", message: "This payment method is now your default." });
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Payments & Escrow</h1>
            <p className="text-muted-foreground mt-1">Manage your transactions, wallet, and payment methods securely.</p>
          </div>
          <button 
            onClick={handleAddMethod}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" /> Add Payment Method
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Wallet Balance", value: formatNaira(stats.walletBalance), icon: Wallet, color: "text-orange-500", bg: "bg-orange-500/10" },
            { label: "Held in Escrow", value: formatNaira(stats.inEscrow), icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Total Spent", value: formatNaira(stats.totalSpent), icon: ArrowDownRight, color: "text-green-500", bg: "bg-green-500/10" },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-5 rounded-xl border border-border flex items-center justify-between"
            >
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Transaction History */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters & Search */}
            <div className="glass p-4 rounded-xl border border-border flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search by Transaction ID or Description..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg outline-none focus:ring-2 ring-orange-500/20 focus:border-orange-500 text-sm transition-all"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
                {["all", "success", "escrow", "pending", "refunded"].map((status) => (
                  <button 
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === status 
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20" 
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Transactions List */}
            <div className="glass rounded-xl border border-border overflow-hidden">
              {isLoading ? (
                <div className="p-6"><PaymentSkeleton /></div>
              ) : filteredTransactions.length > 0 ? (
                <div className="divide-y divide-border">
                  <AnimatePresence>
                    {filteredTransactions.map((txn, index) => {
                      const status = statusConfig[txn.status];
                      const StatusIcon = status.icon;
                      const isDebit = txn.type === "debit";

                      return (
                        <motion.div
                          key={txn.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 md:p-5 hover:bg-muted/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`p-2.5 rounded-full ${isDebit ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}>
                              {isDebit ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm md:text-base">{txn.desc}</p>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                <span className="font-mono">{txn.id}</span>
                                <span>•</span>
                                <span>{txn.date}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  {txn.method === "Bank Transfer" ? <Building2 className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                                  {txn.method}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 pl-14 md:pl-0">
                            <div className="text-right">
                              <p className={`font-bold text-sm md:text-base ${isDebit ? "text-foreground" : "text-green-600 dark:text-green-400"}`}>
                                {isDebit ? "-" : "+"}{formatNaira(txn.amount)}
                              </p>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${status.bg} ${status.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </div>
                            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">No transactions found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
                </div>
              )}
              
              {/* Pagination / Export */}
              {!isLoading && filteredTransactions.length > 0 && (
                <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
                  <span className="text-xs text-muted-foreground">Showing {filteredTransactions.length} of {mockTransactions.length} transactions</span>
                  <button 
                    onClick={() => addToast({ type: "info", title: "Downloading...", message: "Your transaction history is being exported to CSV." })}
                    className="flex items-center gap-1.5 text-xs font-medium text-orange-500 hover:text-orange-600 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Payment Methods & Escrow Info */}
          <div className="space-y-6">
            {/* Saved Payment Methods */}
            <div className="glass p-6 rounded-2xl border border-border">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-500" /> Payment Methods
              </h3>
              <div className="space-y-3 mb-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded-lg border border-border">
                        {method.type === "bank" ? <Building2 className="w-5 h-5 text-blue-500" /> : <CreditCard className="w-5 h-5 text-purple-500" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{method.name}</p>
                        <p className="text-xs text-muted-foreground">{method.account}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.isDefault && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">Default</span>
                      )}
                      {!method.isDefault && (
                        <button 
                          onClick={() => handleSetDefault(method.id)}
                          className="text-xs text-muted-foreground hover:text-orange-500 transition-colors cursor-pointer"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={handleAddMethod}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-border rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Method
              </button>
            </div>

            {/* Escrow Protection Info */}
            <div className="glass p-6 rounded-2xl border border-orange-500/20 bg-orange-500/5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-foreground mb-1">Escrow Protection</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your funds are held securely by our licensed partner until you confirm the materials have been delivered and meet your quality standards.
                  </p>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" /> 100% Buyer Protection
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Instant Refunds for Cancelled Orders
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" /> 24/7 Dispute Resolution
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}