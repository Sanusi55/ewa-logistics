"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle, Truck, Building2 } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";

type Role = "customer" | "driver" | "supplier";

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirm: "", terms: false });

  const roleConfig = {
    customer: { icon: User, label: "Customer", desc: "Order materials & track deliveries" },
    driver: { icon: Truck, label: "Driver", desc: "Accept jobs & earn on the road" },
    supplier: { icon: Building2, label: "Supplier", desc: "List materials & manage sales" },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.terms) return alert("Please accept the terms & conditions.");
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500); // Mock loading
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex items-center justify-center pt-24 md:pt-32 px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-muted-foreground mt-1">Join EWA Logistics today</p>
          </div>

          <div className="glass rounded-2xl p-6 md:p-8 border border-border">
            {/* Role Selector - FIXED: Capitalized Icon variable */}
            <div className="space-y-3 mb-6">
              {(["customer", "driver", "supplier"] as Role[]).map((r) => {
                // ✅ FIX: Assign to capitalized variable for React
                const Icon = roleConfig[r].icon;
                
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      role === r ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${role === r ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {/* ✅ Now using capitalized <Icon /> component */}
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`font-medium ${role === r ? "text-foreground" : "text-muted-foreground"}`}>
                        {roleConfig[r].label}
                      </p>
                      <p className="text-xs text-muted-foreground">{roleConfig[r].desc}</p>
                    </div>
                    {role === r && <CheckCircle className="w-5 h-5 text-primary ml-auto" />}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    required
                    type="password"
                    value={formData.confirm}
                    onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-primary transition-all"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                  className="mt-1 rounded border-border cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and{" "}
                  <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <span className="animate-pulse">Creating account...</span>
                ) : (
                  <>Create {roleConfig[role].label} Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}