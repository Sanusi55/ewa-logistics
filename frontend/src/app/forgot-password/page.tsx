"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Truck, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { forgotPassword } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ FIXED: Direct onClick handler bypasses all form submission quirks
  async function handleSendReset() {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    const formData = new FormData();
    formData.append("email", email);
    
    const result = await forgotPassword(formData);
    
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(result.message || "Check your email for a reset link.");
    }
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass rounded-2xl border border-border p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Forgot Password?</h1>
          <p className="text-muted-foreground text-sm">No worries, we'll send you reset instructions.</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-600 dark:text-green-400 text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}

        {!success && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* ✅ FIXED: Direct onClick, pointer-events-auto, and clear cursor */}
            <button 
              type="button"
              onClick={handleSendReset}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-orange-500/20 pointer-events-auto"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
              ) : (
                <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-8">
          <Link href="/login" className="text-orange-500 hover:text-orange-600 font-medium transition-colors pointer-events-auto">
            ← Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}