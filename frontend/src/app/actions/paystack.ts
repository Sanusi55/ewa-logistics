"use server";

import { createClient } from "@/lib/supabase/server";

export async function initializeSecurePayment(orderData: {
  material_type: string;
  tonnage: number;
  pickup_location: string;
  delivery_location: string;
  delivery_address: string;
  total_amount: number; // Amount in Naira
  customer_notes?: string;
}) {
  const supabase = await createClient();

  // 1. Verify user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to place an order" };

  // 2. Get user email for Paystack
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", user.id)
    .single();

  if (!profile?.email) return { error: "User email not found in profile" };

  // 3. Generate a unique reference for this transaction
  const reference = `EWA_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();

  // 4. Create a "Pending Payment" order in the database FIRST
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
      status: "pending_payment", // Temporary status until webhook confirms
      is_paid: false,
      paystack_reference: reference,
      delivery_code: deliveryCode,
    })
    .select()
    .single();

  if (orderError) {
    console.error("❌ Order creation error:", orderError);
    return { error: "Failed to create order in database" };
  }

  // ✅ FIX: Get the correct base URL (Live site in production, localhost in dev)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // 5. Initialize Transaction with Paystack (Server-to-Server)
  const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: profile.email,
      amount: orderData.total_amount * 100, // ⚠️ Paystack requires amount in KOBO (Naira * 100)
      reference: reference,
      // ✅ FIX: Redirect to the success page where the confetti lives!
      callback_url: `${baseUrl}/payment/success`, 
      metadata: {
        order_id: order.id,
        customer_name: profile.full_name,
      },
    }),
  });

  const paystackData = await paystackResponse.json();

  if (!paystackData.status) {
    return { error: paystackData.message || "Paystack initialization failed" };
  }

  // 6. Return the secure checkout URL to the frontend
  return { success: true, checkoutUrl: paystackData.data.authorization_url, orderId: order.id };
}