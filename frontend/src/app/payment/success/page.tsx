"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, ArrowRight, Hash } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { createClient } from "@/lib/supabase/client";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [displayOrderId, setDisplayOrderId] = useState<string | null>(null);
  
  const transactionRef = searchParams.get("tx_ref") || searchParams.get("reference");
  const urlOrderId = searchParams.get("order_id");

  useEffect(() => {
    // ✅ DEBUG: Check exactly what parameters Flutterwave is sending back
    console.log("🔍 Payment Success URL Params:", Object.fromEntries(searchParams.entries()));

    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // ✅ FALLBACK: If order_id is missing from URL, fetch it from the database using tx_ref
  useEffect(() => {
    if (!isVerifying && !urlOrderId && transactionRef) {
      const fetchOrderId = async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from("orders")
          .select("id")
          .eq("payment_reference", transactionRef)
          .single();
        
        if (data?.id) {
          setDisplayOrderId(data.id);
        }
      };
      fetchOrderId();
    } else if (urlOrderId) {
      setDisplayOrderId(urlOrderId);
    }
  }, [isVerifying, urlOrderId, transactionRef]);

  useEffect(() => {
    if (!isVerifying) {
      // Center burst
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f97316', '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7'],
      });

      // Side bursts
      setTimeout(() => {
        confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#f97316', '#ef4444'] });
        confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#22c55e', '#3b82f6'] });
      }, 300);
    }
  }, [isVerifying]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass rounded-2xl border border-border p-8 shadow-2xl text-center relative z-10"
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Verifying Payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your transaction.</p>
          </>
        ) : (
          <>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-500" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful! 🎉</h2>
            <p className="text-muted-foreground mb-6">
              Your order has been placed successfully. Suppliers will now start reviewing your request.
            </p>

            {/* ✅ PROMINENT ORDER ID DISPLAY (with fallback) */}
            {displayOrderId ? (
              <div className="mb-4 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20 flex items-center justify-center gap-3">
                <Hash className="w-5 h-5 text-orange-500" />
                <div className="text-left">
                  <p className="text-xs text-orange-500/80 uppercase tracking-wider font-semibold">Order ID</p>
                  <p className="text-lg font-mono font-bold text-orange-500 break-all">{displayOrderId}</p>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Order is being processed. Check your dashboard for details.
                </p>
              </div>
            )}

            {transactionRef && (
              <div className="mb-6 p-4 bg-muted/50 rounded-xl border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Transaction Reference</p>
                <p className="text-sm font-mono text-foreground break-all">{transactionRef}</p>
              </div>
            )}

            <Link href="/dashboard">
              <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors cursor-pointer shadow-lg shadow-orange-500/20">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            
            <div className="mt-4">
              <Link href="/dashboard/orders" className="text-sm text-muted-foreground hover:text-orange-500 transition-colors">
                View Order History
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-6" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}