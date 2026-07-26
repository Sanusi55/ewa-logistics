"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Package, Calendar, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/dashboard-layout";
import { getUserOrders } from "@/app/actions/orders";

export default function DriverEarningsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [earnings, setEarnings] = useState({
    total: 0,
    thisMonth: 0,
    thisWeek: 0,
    deliveries: [] as any[]
  });
  const [error, setError] = useState<string | null>(null);

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
        } else if (result.orders) {
          const deliveredOrders = result.orders.filter((o: any) => o.status === "delivered");
          const total = deliveredOrders.reduce((sum: number, o: any) => sum + (o.delivery_fee || 0), 0);
          
          const now = new Date();
          const thisMonth = deliveredOrders
            .filter((o: any) => o.delivered_at && new Date(o.delivered_at).getMonth() === now.getMonth())
            .reduce((sum: number, o: any) => sum + (o.delivery_fee || 0), 0);
          
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const thisWeek = deliveredOrders
            .filter((o: any) => o.delivered_at && new Date(o.delivered_at) >= weekAgo)
            .reduce((sum: number, o: any) => sum + (o.delivery_fee || 0), 0);

          setEarnings({
            total,
            thisMonth,
            thisWeek,
            deliveries: deliveredOrders
          });
        }
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
          <h1 className="text-3xl font-bold">Earnings</h1>
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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass p-6 rounded-2xl border border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Earnings</span>
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <DollarSign className="w-5 h-5 text-green-500" />
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
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
                <span className="text-3xl font-bold">{formatNaira(earnings.thisWeek)}</span>
              </div>
            </div>

            {/* Recent Deliveries */}
            <div className="glass p-6 rounded-2xl border border-border">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                Recent Deliveries
              </h3>
              {earnings.deliveries.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No completed deliveries yet</p>
              ) : (
                <div className="space-y-3">
                  {earnings.deliveries.slice(0, 10).map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">{delivery.material_type}</p>
                        <p className="text-xs text-muted-foreground">{delivery.delivery_location}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatNaira(delivery.delivery_fee)}</p>
                        <p className="text-xs text-muted-foreground">
                          {delivery.delivered_at ? new Date(delivery.delivered_at).toLocaleDateString() : "N/A"}
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