"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Shield, AlertCircle as AlertIcon, Loader2, Smartphone, Check, Copy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { initiateAdminLogin, verifyAdmin2FA } from "@/app/actions/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<"login" | "setup" | "2fa">("login");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [totpSecret, setTotpSecret] = useState("");
  const [totpUri, setTotpUri] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleAdminLogin(formData: FormData) {
    setIsLoggingIn(true); 
    setLoginError("");
    const result = await initiateAdminLogin(formData);
    
    if (result?.error) { 
      setLoginError(result.error); 
      setIsLoggingIn(false); 
    } else if (result?.requiresSetup) { 
      setAuthState("setup"); 
      setTotpSecret(result.secret || "");
      setTotpUri(result.qrCodeUrl || "");
      setIsLoggingIn(false); 
    } else if (result?.requires2FA) { 
      setAuthState("2fa"); 
      setIsLoggingIn(false); 
    }
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    if (otpInput.length !== 6) {
      setLoginError("Please enter a 6-digit code.");
      return;
    }

    setIsVerifyingOTP(true);
    const result = await verifyAdmin2FA(otpInput);

    if (result?.error) {
      setLoginError(result.error);
      setIsVerifyingOTP(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(totpSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    // ✅ DISTINCT ADMIN THEME: Deep Crimson/Black gradient
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-slate-950 to-black flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        // ✅ DISTINCT ADMIN THEME: Red glow and dark borders
        className="w-full max-w-md bg-black/60 backdrop-blur-xl rounded-2xl border border-red-900/50 p-8 shadow-2xl shadow-red-900/20"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-600/30">
            {authState === "2fa" || authState === "setup" ? (
              <Smartphone className="w-8 h-8 text-white" />
            ) : (
              <Shield className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold mb-2 text-white tracking-wide">
            {authState === "login" ? "ADMIN PORTAL" : authState === "setup" ? "Setup 2FA" : "Two-Factor Authentication"}
          </h1>
          <p className="text-red-200/60 text-sm">
            {authState === "login" ? "Restricted access. Authorized personnel only." : 
             authState === "setup" ? "Scan the QR code with Google Authenticator" : "Enter the 6-digit code from your app"}
          </p>
        </div>

        {loginError && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertIcon className="w-5 h-5 flex-shrink-0" /><span>{loginError}</span>
          </motion.div>
        )}

        {authState === "login" ? (
          <form action={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-red-100/80">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400/50" />
                <input name="email" type="email" required className="w-full pl-10 pr-4 py-3 bg-black/50 border border-red-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 transition-all text-white placeholder-red-200/30" placeholder="admin@ewalogistics.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-red-100/80">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400/50" />
                <input name="password" type="password" required className="w-full pl-10 pr-4 py-3 bg-black/50 border border-red-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 transition-all text-white placeholder-red-200/30" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={isLoggingIn} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-red-700 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-500 transition-all disabled:opacity-70 cursor-pointer shadow-lg shadow-red-900/40">
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <><>Access Admin Panel</> <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : authState === "setup" ? (
          <div className="space-y-6">
            <div className="bg-black/40 p-6 rounded-xl border border-red-900/30 flex flex-col items-center">
              <p className="text-sm text-red-100/70 mb-4 text-center">1. Open Google Authenticator and scan this QR code:</p>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUri)}`} alt="QR Code" className="w-48 h-48 bg-white p-2 rounded-lg mb-4" />
              <p className="text-sm text-red-100/70 mb-2 text-center">2. Or enter this key manually:</p>
              <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-lg border border-red-900/50">
                <code className="text-red-400 font-mono text-sm tracking-wider">{totpSecret}</code>
                <button onClick={copyToClipboard} className="text-red-300/50 hover:text-white transition-colors">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <form onSubmit={handleVerify2FA} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-red-100/80">Enter the 6-digit code from your app</label>
                <input value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))} type="text" required maxLength={6} className="w-full px-4 py-3 bg-black/50 border border-red-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 transition-all text-white text-center tracking-[0.5em] font-mono text-xl" placeholder="000000" autoFocus />
              </div>
              <button type="submit" disabled={isVerifyingOTP} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-red-700 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-500 transition-all disabled:opacity-70 cursor-pointer shadow-lg shadow-red-900/40">
                {isVerifyingOTP ? <Loader2 className="w-5 h-5 animate-spin" /> : <><>Verify & Access</> <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleVerify2FA} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-red-100/80">Verification Code</label>
              <input value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))} type="text" required maxLength={6} className="w-full px-4 py-3 bg-black/50 border border-red-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 transition-all text-white text-center tracking-[0.5em] font-mono text-xl" placeholder="000000" autoFocus />
            </div>
            <button type="submit" disabled={isVerifyingOTP} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-red-700 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-500 transition-all disabled:opacity-70 cursor-pointer shadow-lg shadow-red-900/40">
              {isVerifyingOTP ? <Loader2 className="w-5 h-5 animate-spin" /> : <><>Verify & Access</> <ArrowRight className="w-4 h-4" /></>}
            </button>
            <button type="button" onClick={() => { setAuthState("login"); setLoginError(""); }} className="w-full text-sm text-red-300/60 hover:text-white transition-colors">
              ← Back to Password Login
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-red-300/50 hover:text-white transition-colors">← Back to Main Website</Link>
        </div>
      </motion.div>
    </div>
  );
}