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
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in to place an order" };
  }

  // 2. Check if profile exists (using maybeSingle to avoid errors if 0 rows)
  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  // If profile doesn't exist, create it to satisfy the foreign key constraint
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
      // This will now tell us EXACTLY why it's failing (e.g., missing column)
      return { error: `Failed to create user profile: ${insertError.message}` };
    }
    
    // Use the metadata as fallback since we just inserted it
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
      status: "pending_payment",
      is_paid: false,
      paystack_reference: reference,
      delivery_code: deliveryCode,
    })
    .select()
    .single();

  if (orderError) {
    console.error("❌ Order creation error:", orderError);
    return { error: `Failed to create order: ${orderError.message}` };
  }

  // 5. Get the correct base URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // 6. Initialize Transaction with Paystack (Server-to-Server)
  const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: customerEmail,
      amount: Math.round(orderData.total_amount * 100), // Paystack requires amount in KOBO
      reference: reference,
      callback_url: `${baseUrl}/payment/success`, 
      metadata: {
        order_id: order.id,
        customer_name: customerName,
      },
    }),
  });

  const paystackData = await paystackResponse.json();

  if (!paystackData.status) {
    console.error("❌ Paystack initialization failed:", paystackData);
    return { error: paystackData.message || "Paystack initialization failed" };
  }

  // 7. Return the secure checkout URL to the frontend
  return { success: true, checkoutUrl: paystackData.data.authorization_url, orderId: order.id };
}