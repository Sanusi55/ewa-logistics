"use server";

import { createClient } from "@/lib/supabase/server";

export async function createDispute(orderId: string, reason: string, role: "customer" | "supplier" | "driver") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to report a dispute." };
  }

  const { error } = await supabase.from("disputes").insert({
    order_id: orderId,
    raised_by: user.id,
    raised_by_role: role,
    reason: reason,
    status: "pending",
  });

  if (error) {
    console.error("❌ Error creating dispute:", error);
    // ✅ Return the actual Supabase error message so we know exactly what failed
    return { error: error.message || "Failed to submit dispute. Please try again." };
  }

  return { success: true };
}

export async function resolveDispute(disputeId: string, status: "resolved" | "rejected", adminNotes: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Verify admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return { error: "Admin privileges required." };
  }

  const { error } = await supabase
    .from("disputes")
    .update({ 
      status, 
      admin_notes: adminNotes,
      updated_at: new Date().toISOString() 
    })
    .eq("id", disputeId);

  if (error) {
    console.error("❌ Error resolving dispute:", error);
    return { error: error.message || "Failed to update dispute." };
  }

  return { success: true };
}

export async function getAdminDisputes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized", data: [] };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return { error: "Admin privileges required.", data: [] };
  }

  const { data, error } = await supabase
    .from("disputes")
    .select(`
      *,
      orders (material_type, tonnage, delivery_location),
      profiles!disputes_raised_by_fkey (full_name, email, role)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching disputes:", error);
    return { error: error.message, data: [] };
  }

  return { success: true, data: data || [] };
}