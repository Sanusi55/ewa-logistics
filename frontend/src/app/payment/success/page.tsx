"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti"; // ✅ Import the confetti library

// ✅ 1. Inner component that safely uses useSearchParams
function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  
  const reference = searchParams.get("reference");

  useEffect(() => {
    // Simulate a brief verification delay for better UX
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // ✅ 2. Trigger the colorful bubble celebration when verification is done
  useEffect(() => {
    if (!isVerifying) {
      // Center burst
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f97316', '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7'], // Orange, Red, Green, Blue, Yellow, Purple
      });

      // Side bursts for extra celebration flair
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
          colors: ['#f97316', '#ef4444'],
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
          colors: ['#22c55e', '#3b82f6'],
        });
      }, 300);
    }
  }, [isVerifying]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8 shadow-2xl text-center relative z-10"
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment...</h2>
            <p className="text-slate-400">Please wait while we confirm your transaction.</p>
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
            
            <h2 className="text-2xl font-bold text-white mb-2">Payment Successful! 🎉</h2>
            <p className="text-slate-400 mb-6">
              Your order has been placed successfully. Suppliers will now start reviewing your request.
            </p>

            {reference && (
              <div className="mb-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Transaction Reference</p>
                <p className="text-sm font-mono text-orange-400 break-all">{reference}</p>
              </div>
            )}

            <Link href="/dashboard/customer">
              <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-orange-500/20">
                Go to My Orders <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ✅ 3. Main default export wraps the content in a Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-6" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}