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
    console.log("📦 [WEBHOOK] Payload keys:", Object.keys(event));
    
    // ✅ ROBUST EXTRACTION: Handle flat payload structure
    const eventType = event.event || event.type || event["event.type"];
    const payloadData = event.data || event; // Fallback to root if 'data' is missing
    const transactionStatus = payloadData.status;
    const txRef = payloadData.tx_ref || payloadData.txRef;
    const transactionId = payloadData.id;
    
    console.log("🔍 [WEBHOOK] Extracted - Event:", eventType, "Status:", transactionStatus, "TxRef:", txRef, "TxId:", transactionId);

    // ✅ SMART CHECK: If status is successful and we have the reference, process it!
    if (transactionStatus === "successful" && txRef && transactionId) {
      const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;

      if (!secretKey) {
        console.error("❌ [WEBHOOK] Missing secret key in environment variables.");
        return NextResponse.json({ error: "Missing secret key" }, { status: 500 });
      }

      console.log("💳 [WEBHOOK] Payment successful! Processing TxRef:", txRef, "Transaction ID:", transactionId);

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
      console.log("✅ [WEBHOOK] Flutterwave verification response status:", verifyData.status);

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
          console.log("💡 [WEBHOOK] HINT: The frontend might not be saving the 'payment_reference' to the database when creating the order.");
        }
      } else {
        console.error("❌ [WEBHOOK] Flutterwave API verification failed");
      }
    } else {
      console.log("⚠️ [WEBHOOK] Event ignored. Status:", transactionStatus, "TxRef:", txRef);
    }

    // Always return 200 to Flutterwave so they stop retrying
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ [WEBHOOK] Processing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}