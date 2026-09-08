import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Use the Service Role Key to bypass RLS and update the database securely
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // 1. Get the JSON body and Flutterwave verification hash
    // Note: req.json() is more reliable than req.text() in Next.js App Router
    const event = await req.json();
    const verifHash = req.headers.get("verif-hash");
    
    // Verify the hash (Matches the secret hash set in your Flutterwave dashboard)
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    if (secretHash && verifHash !== secretHash) {
      console.error("❌ Invalid Flutterwave signature. Possible spoofing attempt.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 2. Handle successful payment
    // Flutterwave sends "charge.completed" for successful payments
    if (event.event === "charge.completed" && event.data?.status === "successful") {
      const txRef = event.data.tx_ref; // This matches our 'payment_reference'
      const transactionId = event.data.id;
      const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;

      // Safety check to ensure we have the data we need
      if (!txRef || !transactionId || !secretKey) {
        console.error("❌ Missing required data in webhook payload or environment variables.");
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
      }

      // 3. Double-check with Flutterwave API to be 100% sure (Server-to-Server Verification)
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

      // ✅ CRITICAL SECURITY CHECK: Verify status AND that the tx_ref matches ours
      if (
        verifyData.status === "success" && 
        verifyData.data?.status === "successful" && 
        verifyData.data.tx_ref === txRef
      ) {
        // 4. Update the order in the database
        const { error } = await supabaseAdmin
          .from("orders")
          .update({ 
            is_paid: true, 
            status: "pending_supplier_acceptance", // Now the supplier can see it!
            updated_at: new Date().toISOString()
          })
          .eq("payment_reference", txRef);

        if (error) {
          console.error("❌ Webhook DB update error:", error);
          return NextResponse.json({ error: "DB update failed" }, { status: 500 });
        }
        
        console.log(`✅ SUCCESS: Order with tx_ref ${txRef} securely marked as paid!`);
      } else {
        console.error("❌ Flutterwave API verification failed for tx_ref:", txRef, verifyData);
      }
    }

    // Always return 200 to Flutterwave so they stop retrying
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}