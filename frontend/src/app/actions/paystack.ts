"use server";

import { createClient } from "@/lib/supabase/server";

export async function initializeSecurePayment(orderData: {
  material_type: string;
  tonnage: number;
  pickup_location: string;
  delivery_location: string;
  delivery_address: string;
  total_amount: number;
  customer_notes?: string;
}) {
  const supabase = await createClient();

  // 1. Verify user is logged in
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in to place an order" };
  }

  // 2. Check if profile exists
  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || "Customer",
        role: user.user_metadata?.role || "customer",
      });

    if (insertError) {
      console.error("❌ Profile insert error:", insertError);
      return { error: `Failed to create user profile: ${insertError.message}` };
    }
    
    profile = { 
      full_name: user.user_metadata?.full_name || "Customer", 
      email: user.email 
    };
  } else if (profileError) {
    console.error("❌ Profile fetch error:", profileError);
    return { error: `Database error checking profile: ${profileError.message}` };
  }

  const customerName = profile?.full_name || "Customer";
  const customerEmail = profile?.email || user.email || "customer@example.com";

  // 3. Generate unique references
  const txRef = `EWA_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();

  // 4. Create the order in the database
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      material_type: orderData.material_type,
      tonnage: orderData.tonnage,
      pickup_location: orderData.pickup_location,
      delivery_location: orderData.delivery_location,
      delivery_address: orderData.delivery_address,
      customer_notes: orderData.customer_notes,
      total_amount: orderData.total_amount,
      status: "pending_payment",
      is_paid: false,
      payment_reference: txRef, // ✅ Matches the fresh database column
      delivery_code: deliveryCode,
    })
    .select()
    .single();

  if (orderError) {
    console.error("❌ Order creation error:", orderError);
    return { error: `Failed to create order: ${orderError.message}` };
  }

  // 5. Get base URL and set success redirect
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const successRedirectUrl = `${baseUrl}/payment/success?order_id=${order.id}&tx_ref=${txRef}`;

  // 6. Initialize Transaction with Flutterwave
  const flutterwaveResponse = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: txRef,
      amount: orderData.total_amount, 
      currency: "NGN",
      redirect_url: successRedirectUrl,
      customer: {
        email: customerEmail,
        name: customerName,
      },
      customizations: {
        title: "EWA Logistics Payment",
        description: `Payment for ${orderData.tonnage} tons of ${orderData.material_type}`,
        logo: "https://ewalogistics.com/logo.png",
      },
    }),
  });

  const flutterwaveData = await flutterwaveResponse.json();

  if (flutterwaveData.status !== "success") {
    console.error("❌ Flutterwave initialization failed:", flutterwaveData);
    return { error: flutterwaveData.message || "Payment initialization failed" };
  }

  // 7. Return the secure checkout URL to the frontend
  return { 
    success: true, 
    checkoutUrl: flutterwaveData.data.link, 
    orderId: order.id 
  };
}