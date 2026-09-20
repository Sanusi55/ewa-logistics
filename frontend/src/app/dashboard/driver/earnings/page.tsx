"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Package, Calendar, Loader2, AlertCircle, Wallet, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/dashboard-layout";

export default function DriverEarningsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [earnings, setEarnings] = useState({
    available: 0,
    pending: 0,
    total: 0,
    thisMonth: 0,
    thisWeek: 0,
    transactions: [] as any[]
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuthAndLoad() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        // ✅ DEBUG LOGS: Check your browser console (F12) to see these!
        console.log("🔍 Current Logged-in User ID:", user?.id);
        console.log("🔍 Expected User ID in Database:", "c6550711-24c9-4d7b-99c9-372a66b1c76f");
        
        if (authError || !user) {
          router.push("/login");
          return;
        }

        // ✅ Fetch from driver_earnings table
        const { data: earningsData, error: earningsError } = await supabase
          .from("driver_earnings")
          .select(`
            *,
            orders (
              material_type,
              delivery_location,
              delivered_at
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (earningsError) {
          console.error("❌ Supabase Earnings Fetch Error:", earningsError);
          throw earningsError;
        }

        console.log("✅ Fetched Earnings Data:", earningsData);

        // ✅ Calculate balances
        const available = earningsData
          .filter((e: any) => e.status === "available")
          .reduce((sum: number, e: any) => sum + e.amount, 0);

        const pending = earningsData
          .filter((e: any) => e.status === "pending")
          .reduce((sum: number, e: any) => sum + e.amount, 0);

        const total = available + pending;

        const now = new Date();
        const thisMonth = earningsData
          .filter((e: any) => {
            const createdAt = e.created_at ? new Date(e.created_at) : null;
            return e.status === "available" && createdAt && createdAt.getMonth() === now.getMonth();
          })
          .reduce((sum: number, e: any) => sum + e.amount, 0);

        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisWeek = earningsData
          .filter((e: any) => {
            const createdAt = e.created_at ? new Date(e.created_at) : null;
            return e.status === "available" && createdAt && createdAt >= weekAgo;
          })
          .reduce((sum: number, e: any) => sum + e.amount, 0);

        setEarnings({
          available,
          pending,
          total,
          thisMonth,
          thisWeek,
          transactions: earningsData || []
        });
      } catch (err: any) {
        console.error("❌ Load earnings error:", err);
        setError(err.message || "Failed to load earnings");
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuthAndLoad();
  }, [router, supabase]);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount || 0);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Earnings & Withdrawals</h1>
          <p className="text-muted-foreground mt-1">Track your delivery earnings and payouts</p>
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
                <h3 className="font-bold text-red-700 dark:text-red-400 mb-1">Error Loading Earnings</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass p-6 rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Available Balance</span>
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Wallet className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <span className="text-4xl font-bold text-green-600">{formatNaira(earnings.available)}</span>
                <p className="text-xs text-muted-foreground mt-2">Ready for withdrawal</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass p-6 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Balance</span>
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
                <span className="text-4xl font-bold text-blue-600">{formatNaira(earnings.pending)}</span>
                <p className="text-xs text-muted-foreground mt-2">Awaiting customer confirmation</p>
              </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass p-6 rounded-2xl border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Earnings</span>
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <DollarSign className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
                <span className="text-3xl font-bold">{formatNaira(earnings.total)}</span>
              </div>

              <div className="glass p-6 rounded-2xl border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">This Month</span>
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Calendar className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
                <span className="text-3xl font-bold">{formatNaira(earnings.thisMonth)}</span>
              </div>

              <div className="glass p-6 rounded-2xl border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">This Week</span>
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <span className="text-3xl font-bold">{formatNaira(earnings.thisWeek)}</span>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="glass p-6 rounded-2xl border border-border">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                Recent Transactions
              </h3>
              {earnings.transactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No earnings yet</p>
              ) : (
                <div className="space-y-3">
                  {earnings.transactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${transaction.status === 'available' ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
                          {transaction.status === 'available' ? (
                            <DollarSign className="w-4 h-4 text-green-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {transaction.orders?.material_type || 'Delivery'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.orders?.delivery_location || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              transaction.status === 'available' 
                                ? 'bg-green-500/10 text-green-600' 
                                : 'bg-blue-500/10 text-blue-600'
                            }`}>
                              {transaction.status === 'available' ? 'Available' : 'Pending'}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${transaction.status === 'available' ? 'text-green-600' : 'text-blue-600'}`}>
                          {formatNaira(transaction.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}