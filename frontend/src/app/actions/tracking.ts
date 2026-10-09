"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

// ============================================
// 🔗 GENERATE TRACKING LINK (For Admin/Supplier)
// ============================================
export async function generateTrackingLink(orderId: string) {
  const supabase = await createClient();

  // 1. Verify the user is authenticated (Admin or Supplier)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Unauthorized. You must be logged in to generate a tracking link." };
  }

  // 2. Verify the order exists
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, supplier_id")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return { error: "Order not found." };
  }

  // 3. Generate a secure, random tracking token
  const trackingToken = crypto.randomUUID();

  // 4. Set expiration to 24 hours from now
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // 5. Save the tracking session to the database
  const { error: insertError } = await supabase
    .from("tracking_sessions")
    .insert({
      order_id: orderId,
      tracking_token: trackingToken,
      is_active: true,
      expires_at: expiresAt,
    });

  if (insertError) {
    console.error("❌ Failed to create tracking session:", insertError);
    return { error: "Failed to generate tracking link. Please try again." };
  }

  // 6. Construct the public tracking URL
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  
  // Fallback to your production domain if host is not available
  const baseUrl = host 
    ? `${protocol}://${host}` 
    : (process.env.NEXT_PUBLIC_SITE_URL || "https://ewalogistics.com");

  const trackingUrl = `${baseUrl}/driver-track/${trackingToken}`;

  return { 
    success: true, 
    url: trackingUrl, 
    token: trackingToken 
  };
}

// ============================================
// 📍 UPDATE DRIVER LOCATION (Called by the external driver's browser)
// ============================================
export async function updateExternalDriverLocation(token: string, latitude: number, longitude: number) {
  const supabase = await createClient();

  // 1. Find the active, unexpired tracking session by token
  const { data: session, error: sessionError } = await supabase
    .from("tracking_sessions")
    .select("order_id, is_active, expires_at")
    .eq("tracking_token", token)
    .single();

  if (sessionError || !session) {
    return { error: "Invalid or expired tracking link." };
  }

  if (!session.is_active) {
    return { error: "This tracking session has been deactivated by the admin." };
  }

  const now = new Date().getTime();
  const expiresAt = new Date(session.expires_at).getTime();
  if (now > expiresAt) {
    return { error: "This tracking link has expired." };
  }

  // 2. Update the order's location and last update timestamp
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      driver_lat: latitude,
      driver_lng: longitude,
      last_location_update: new Date().toISOString(),
    })
    .eq("id", session.order_id);

  if (updateError) {
    console.error("❌ Failed to update driver location:", updateError);
    return { error: "Failed to update location." };
  }

  return { success: true };
}

// ============================================
// 🔍 GET ORDER DETAILS BY TOKEN (Public, No Auth Required)
// ============================================
export async function getTrackingSessionDetails(token: string) {
  const supabase = await createClient();

  const { data: session, error } = await supabase
    .from("tracking_sessions")
    .select(`
      is_active,
      expires_at,
      orders (
        id,
        material_type,
        tonnage,
        unit,
        delivery_location,
        delivery_address
      )
    `)
    .eq("tracking_token", token)
    .single();

  if (error || !session) {
    return { error: "Invalid or expired tracking link." };
  }

  if (!session.is_active) {
    return { error: "This tracking link has been deactivated by the admin." };
  }

  const now = new Date().getTime();
  const expiresAt = new Date(session.expires_at).getTime();
  if (now > expiresAt) {
    return { error: "This tracking link has expired." };
  }

  return { 
    success: true, 
    order: session.orders 
  };
}

// ============================================
// 📝 RECORD HOW THE LINK WAS SHARED (For Audit Trail)
// ============================================
export async function updateTrackingShareMethod(token: string, method: "copied" | "whatsapp") {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tracking_sessions")
    .update({ share_method: method })
    .eq("tracking_token", token);

  if (error) {
    console.error("❌ Failed to update share method:", error);
    return { error: "Failed to record share method" };
  }

  return { success: true };
}

// ============================================
// 📊 GET ALL TRACKING SESSIONS (For Admin Audit)
// ============================================
export async function getTrackingSessions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tracking_sessions")
    .select(`
      id,
      tracking_token,
      share_method,
      is_active,
      created_at,
      orders (
        id,
        material_type,
        delivery_location,
        delivery_address
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Failed to fetch tracking sessions:", error);
    return { error: "Failed to load tracking history." };
  }

  return { success: true, data: data || [] };
}