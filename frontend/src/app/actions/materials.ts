"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMaterials() {
  const supabase = await createClient();
  
  const { data: materials, error } = await supabase
    .from("materials")
    .select(`
      id,
      supplier_id,
      name,
      description,
      price_per_ton,
      unit,
      image_url,
      is_active,
      status,
      created_at,
      town,
      lga,
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
    // Safely handle if Supabase types the relation as an array
    const supplier = Array.isArray(material.supplier) ? material.supplier[0] : material.supplier;
    return supplier && !supplier.is_deleted && !supplier.is_suspended;
  }) || [];

  // Clean up the data by removing the nested supplier object, but KEEP supplier_id
  const cleanData = activeMaterials.map(({ supplier, ...rest }: any) => rest);

  console.log(`✅ Fetched ${cleanData.length} materials from active suppliers`);
  
  return { data: cleanData, error: null };
}

export async function getMaterialById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("materials")
    .select(`
      id,
      supplier_id,
      name,
      description,
      price_per_ton,
      unit,
      image_url,
      is_active,
      status,
      created_at,
      town,
      lga,
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

  // Safely handle if Supabase types the relation as an array
  const supplier = Array.isArray(data?.supplier) ? data.supplier[0] : data?.supplier;

  // Check if supplier exists and is active
  if (!supplier || supplier.is_deleted || supplier.is_suspended) {
    console.log("🚫 Material blocked: supplier is deleted or suspended");
    return { data: null, error: "This material is no longer available." };
  }

  // Clean up the nested supplier object, but KEEP supplier_id
  const { supplier: _, ...cleanData } = data as any;

  return { data: cleanData, error: null };
}