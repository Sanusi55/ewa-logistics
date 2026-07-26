import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// ✅ Use the Service Role Key to bypass RLS and update the database securely
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  // 1. Get the raw body and signature
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  // 2. Verify the signature (Prevents hackers from faking payment webhooks)
  const hash = crypto
    .createHmac("sha512", secretKey!)
    .update(rawBody)
    .digest("hex");

  if (hash !== signature) {
    console.error("❌ Invalid Paystack signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  // 3. Handle successful payment
  if (event.event === "charge.success") {
    const reference = event.data.reference;

    // 4. Double-check with Paystack API to be 100% sure
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${secretKey}` },
      }
    );
    const verifyData = await verifyResponse.json();

    if (verifyData.data && verifyData.data.status === "success") {
      // 5. Update the order in the database
      const { error } = await supabaseAdmin
        .from("orders")
        .update({ 
          is_paid: true, 
          status: "pending_supplier_acceptance" // Now the supplier can see it!
        })
        .eq("paystack_reference", reference);

      if (error) {
        console.error("❌ Webhook DB update error:", error);
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
      }
      
      console.log(`✅ Order ${reference} successfully marked as paid!`);
    }
  }

  // Always return 200 to Paystack so they stop retrying
  return NextResponse.json({ received: true }, { status: 200 });
}