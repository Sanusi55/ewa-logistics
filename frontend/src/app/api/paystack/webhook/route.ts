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
    
    // 1. Get headers and body
    const verifHash = req.headers.get("verif-hash");
    console.log("🔑 [WEBHOOK] Received verif-hash:", verifHash);
    console.log("🔑 [WEBHOOK] Expected secret hash:", process.env.FLUTTERWAVE_SECRET_HASH);

    const event = await req.json();
    console.log("📦 [WEBHOOK] Event payload:", JSON.stringify(event, null, 2));

    // 2. Verify hash
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    if (secretHash && verifHash !== secretHash) {
      console.error("❌ [WEBHOOK] Invalid Flutterwave signature. Possible spoofing attempt.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 3. Handle successful payment
    console.log("🔍 [WEBHOOK] Checking event type:", event.event, "and status:", event.data?.status);
    
    if (event.event === "charge.completed" && event.data?.status === "successful") {
      const txRef = event.data.tx_ref;
      const transactionId = event.data.id;
      const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;

      console.log("💳 [WEBHOOK] Payment successful! TxRef:", txRef, "Transaction ID:", transactionId);

      if (!txRef || !transactionId || !secretKey) {
        console.error("❌ [WEBHOOK] Missing required data in webhook payload or environment variables.");
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
      }

      // 4. Verify with Flutterwave API
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
        verifyData.data?.status === "successful" && 
        verifyData.data.tx_ref === txRef
      ) {
        console.log("🔍 [WEBHOOK] Attempting to update order with payment_reference:", txRef);
        
        // 5. Update the order in the database (Added .select() to see what was updated)
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
          console.error(`⚠️ [WEBHOOK] WARNING: No order found with payment_reference = ${txRef}. Check if the frontend saved the tx_ref to the database!`);
        }
      } else {
        console.error("❌ [WEBHOOK] Flutterwave API verification failed for tx_ref:", txRef, verifyData);
      }
    } else {
      console.log("⚠️ [WEBHOOK] Event ignored. Not a successful charge completion.");
    }

    // Always return 200 to Flutterwave so they stop retrying
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ [WEBHOOK] Processing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}