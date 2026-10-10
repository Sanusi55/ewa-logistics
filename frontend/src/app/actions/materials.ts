"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMaterials() {
  const supabase = await createClient();
  
  // Method 1: Fetch materials and filter in two steps for reliability
  const { data: materials, error } = await supabase
    .from("materials")
    .select(`
      *,
      supplier:profiles!inner (
        id,
        is_deleted,
        is_suspended
      )
    `)
    .eq("is_active", true)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching materials:", error);
    return { data: [], error: error.message };
  }

  // Filter out materials from deleted or suspended suppliers
  const activeMaterials = materials?.filter((material: any) => {
    const supplier = material.supplier;
    return supplier && !supplier.is_deleted && !supplier.is_suspended;
  }) || [];

  // Clean up the data by removing the nested supplier object
  const cleanData = activeMaterials.map(({ supplier, ...rest }) => rest);

  console.log(`✅ Fetched ${cleanData.length} materials from active suppliers`);
  
  return { data: cleanData, error: null };
}

export async function getMaterialById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("materials")
    .select(`
      *,
      supplier:profiles!inner (
        id,
        is_deleted,
        is_suspended
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("❌ Error fetching material:", error);
    return { data: null, error: error.message };
  }

  // Check if supplier exists and is active
  if (!data?.supplier || data.supplier.is_deleted || data.supplier.is_suspended) {
    console.log("🚫 Material blocked: supplier is deleted or suspended");
    return { data: null, error: "This material is no longer available." };
  }

  // Clean up the nested supplier object
  const { supplier, ...cleanData } = data;

  return { data: cleanData, error: null };
}

// ⚠️ NOTE: createOrder has been moved to @/app/actions/orders.ts
// Make sure your frontend imports it from there!