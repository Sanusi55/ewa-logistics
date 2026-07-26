"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMaterials() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching materials:", error);
    return { data: [], error: error.message };
  }

  return { data, error: null };
}

export async function getMaterialById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching material:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

// ⚠️ NOTE: createOrder has been moved to @/app/actions/orders.ts
// Make sure your frontend imports it from there!