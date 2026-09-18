import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Use the Service Role Key to bypass RLS and update the database securely
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    console.log("🔔 [WEBHOOK] Request received!");
    
    const verifHash = req.headers.get("verif-hash");
    console.log("🔑 [WEBHOOK] Received verif-hash:", verifHash);
    console.log("🔑 [WEBHOOK] Expected secret hash:", process.env.FLUTTERWAVE_SECRET_HASH);

    const event = await req.json();
    
    // Log the exact keys to see the structure
    console.log("📦 [WEBHOOK] Payload keys:", Object.keys(event));
    console.log("📦 [WEBHOOK] Full event payload:", JSON.stringify(event, null, 2));

    // Verify hash
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    if (secretHash && verifHash !== secretHash) {
      console.error("❌ [WEBHOOK] Invalid Flutterwave signature.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // ✅ ROBUST EXTRACTION: Handle both nested and flat payload structures
    const eventType = event.event || event.type;
    const payloadData = event.data || event; // Fallback to root if 'data' is missing
    const transactionStatus = payloadData.status;
    const txRef = payloadData.tx_ref || payloadData.txRef;
    const transactionId = payloadData.id;
    
    console.log("🔍 [WEBHOOK] Extracted - Event:", eventType, "Status:", transactionStatus, "TxRef:", txRef, "TxId:", transactionId);

    if (
      (eventType === "charge.completed" || eventType === "charge") && 
      transactionStatus === "successful"
    ) {
      const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;

      if (!txRef || !transactionId || !secretKey) {
        console.error("❌ [WEBHOOK] Missing required data:", { txRef, transactionId, hasSecretKey: !!secretKey });
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
      }

      console.log("💳 [WEBHOOK] Payment successful! TxRef:", txRef, "Transaction ID:", transactionId);

      // Verify with Flutterwave API
      console.log("🔄 [WEBHOOK] Verifying transaction with Flutterwave API...");
      const verifyResponse = await fetch(
        `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
        {
          method: "GET",
          headers: { 
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json"
          },
        }
      );
      
      const verifyData = await verifyResponse.json();
      console.log("✅ [WEBHOOK] Flutterwave verification response:", JSON.stringify(verifyData, null, 2));

      if (
        verifyData.status === "success" && 
        verifyData.data?.status === "successful"
      ) {
        console.log("🔍 [WEBHOOK] Attempting to update order with payment_reference:", txRef);
        
        // First, let's see what orders exist with this reference
        const { data: existingOrders, error: fetchError } = await supabaseAdmin
          .from("orders")
          .select("*")
          .eq("payment_reference", txRef);

        if (fetchError) {
          console.error("❌ [WEBHOOK] Error fetching order:", fetchError);
        } else {
          console.log("🔎 [WEBHOOK] Found orders with this reference:", existingOrders);
        }

        // Update the order
        const { data: updateData, error } = await supabaseAdmin
          .from("orders")
          .update({ 
            is_paid: true, 
            status: "pending_supplier_acceptance",
            updated_at: new Date().toISOString()
          })
          .eq("payment_reference", txRef)
          .select(); 

        if (error) {
          console.error("❌ [WEBHOOK] DB update error:", error);
          return NextResponse.json({ error: "DB update failed" }, { status: 500 });
        }
        
        if (updateData && updateData.length > 0) {
          console.log(`✅ [WEBHOOK] SUCCESS: Order updated!`, updateData);
        } else {
          console.error(`⚠️ [WEBHOOK] WARNING: No order found with payment_reference = ${txRef}`);
          console.log("💡 [WEBHOOK] HINT: Check if the frontend created the order with this exact payment_reference in Supabase");
        }
      } else {
        console.error("❌ [WEBHOOK] Flutterwave API verification failed");
      }
    } else {
      console.log("⚠️ [WEBHOOK] Event ignored. Type:", eventType, "Status:", transactionStatus);
    }

    // Always return 200 to Flutterwave so they stop retrying
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ [WEBHOOK] Processing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}