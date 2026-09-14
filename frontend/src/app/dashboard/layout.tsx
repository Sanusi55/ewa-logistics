import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/dashboard-layout";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, redirect to login page
  if (!user) {
    redirect("/login");
  }

  // Fetch user profile from database to get the role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "customer";

  // ✅ REMOVE SIDEBAR FOR DRIVERS:
  // If the user is a driver, we skip the DashboardLayout (which contains the sidebar).
  // This makes the middle tabs the only navigation and keeps everything perfectly centered!
  if (role === "driver") {
    return (
      <main className="min-h-screen bg-background">
        {children}
      </main>
    );
  }

  // For admin, supplier, and customer, keep the normal layout with the sidebar
  return <DashboardLayout user={profile || user}>{children}</DashboardLayout>;
}