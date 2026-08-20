"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

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
        .select("role")
        .eq("id", user.id)
        .single();

      const role = profile?.role || "customer";

      // ✅ UPDATED: Added fleet_company redirect
      if (role === "supplier") {
        router.push("/dashboard/supplier");
      } else if (role === "driver") {
        router.push("/dashboard/driver");
      } else if (role === "admin") {
        router.push("/admin");
      } else if (role === "fleet_company") {
        router.push("/dashboard/fleet");
      } else {
        router.push("/dashboard/customer");
      }
    };

    checkRole();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2 text-muted-foreground">Redirecting to your dashboard...</span>
      </div>
    );
  }

  return null;
}