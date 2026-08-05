"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Clock } from "lucide-react";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_approved")
        .eq("id", user.id)
        .single();

      const role = profile?.role || "customer";
      const isApproved = profile?.is_approved;

      // ✅ NEW: Check if supplier or driver is pending approval
      if ((role === "supplier" || role === "driver") && isApproved === false) {
        setIsPending(true);
        setIsLoading(false);
        return;
      }

      // ✅ Redirect to the specific dashboard based on role
      if (role === "supplier") {
        router.push("/dashboard/supplier");
      } else if (role === "driver") {
        router.push("/dashboard/driver");
      } else if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard/customer");
      }
    };

    checkRole();
  }, [router]);

  // ✅ Loading State
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2 text-muted-foreground">Redirecting to your dashboard...</span>
      </div>
    );
  }

  // ✅ Pending Approval State
  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Account Pending Approval</h1>
          <p className="text-muted-foreground mb-6">
            Your account is currently under review by our admin team. You will be able to access your dashboard once your account has been approved.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => router.push("/")}
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors cursor-pointer"
            >
              Return to Home
            </button>
            <button 
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="w-full py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}