import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Use the Service Role Key to bypass Row Level Security for background tasks
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  // 1. 🔒 SECURITY CHECK: Verify the Cron Secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized: Invalid Cron Secret" }, { status: 401 });
  }

  console.log("⏱️ [CRON] Checking for stuck orders...");

  // 2. Calculate the time 20 minutes ago
  const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();

  // 3. Find orders stuck in "driver_searching" for more than 20 minutes
  const { data: stuckOrders, error } = await supabaseAdmin
    .from("orders")
    .select("id, supplier_id, material_type, customer_id")
    .eq("status", "driver_searching")
    .lt("created_at", twentyMinutesAgo);

  if (error) {
    console.error("❌ [CRON] Database query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!stuckOrders || stuckOrders.length === 0) {
    console.log("✅ [CRON] No stuck orders found. All good!");
    return NextResponse.json({ success: true, message: "No stuck orders found." });
  }

  console.log(`⚠️ [CRON] Found ${stuckOrders.length} stuck orders. Processing...`);

  const processedOrders = [];

  // 4. Process each stuck order
  for (const order of stuckOrders) {
    // A. Update status to "no_driver_available"
    await supabaseAdmin
      .from("orders")
      .update({ 
        status: "no_driver_available", 
        updated_at: new Date().toISOString() 
      })
      .eq("id", order.id);

    // B. Send In-App Notification to the Supplier
    if (order.supplier_id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: order.supplier_id,
        title: "⚠️ No Driver Available",
        message: `No EWA driver was assigned within 20 minutes for ${order.material_type}. You can now assign your own driver.`,
        type: "warning",
        link: "/dashboard/supplier",
        is_read: false,
      });
    }

    processedOrders.push(order.id);
    console.log(`✅ [CRON] Processed order: ${order.id}`);
  }

  return NextResponse.json({ 
    success: true, 
    processedCount: processedOrders.length, 
    orderIds: processedOrders 
  });
}