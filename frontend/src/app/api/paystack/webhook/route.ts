import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Use the Service Role Key to bypass RLS and update the database securely
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // 1. Get the raw body and Flutterwave verification hash
    const rawBody = await req.text();
    const verifHash = req.headers.get("verif-hash");
    
    // Optional but recommended: Verify the hash 
    // (You must set FLUTTERWAVE_SECRET_HASH in your .env.local from your Flutterwave dashboard)
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    if (secretHash && verifHash !== secretHash) {
      console.error("❌ Invalid Flutterwave signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // 2. Handle successful payment
    // Flutterwave sends "charge.completed" for successful payments
    if (event.event === "charge.completed" && event.data?.status === "successful") {
      const txRef = event.data.tx_ref; // This matches our 'payment_reference'
      const transactionId = event.data.id;
      const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;

      // 3. Double-check with Flutterwave API to be 100% sure
      const verifyResponse = await fetch(
        `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
        {
          headers: { 
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json"
          },
        }
      );
      
      const verifyData = await verifyResponse.json();

      if (verifyData.status === "success" && verifyData.data.status === "successful") {
        // 4. Update the order in the database
        const { error } = await supabaseAdmin
          .from("orders")
          .update({ 
            is_paid: true, 
            status: "pending_supplier_acceptance" // Now the supplier can see it!
          })
          .eq("payment_reference", txRef); // ✅ Updated to match the new column name

        if (error) {
          console.error("❌ Webhook DB update error:", error);
          return NextResponse.json({ error: "DB update failed" }, { status: 500 });
        }
        
        console.log(`✅ Order with tx_ref ${txRef} successfully marked as paid!`);
      } else {
        console.error("❌ Flutterwave API verification failed:", verifyData);
      }
    }

    // Always return 200 to Flutterwave so they stop retrying
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}