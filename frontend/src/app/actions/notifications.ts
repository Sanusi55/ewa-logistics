"use server";

import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

// 🛡️ DEFENSIVE: Only initialize Resend if API key exists to prevent crashes
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// ==========================================
// 🔔 UNIFIED DUAL-CHANNEL NOTIFICATION HELPER
// ==========================================
export async function sendDualNotification(
  userId: string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" | "order" | "delivery" | "bid" = "info",
  link?: string,
  emailSubject?: string,
  emailHtml?: string
) {
  const supabase = await createClient();

  // 1. Save In-App Notification
  const { error: dbError } = await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    type,
    link: link || null,
    is_read: false,
  });

  if (dbError) {
    console.error("❌ Notification creation error:", dbError);
  }

  // 2. Send Email Notification (if details provided)
  if (resend && emailSubject && emailHtml) {
    try {
      // Fetch user's email from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", userId)
        .single();

      if (profile?.email) {
        // 💡 PRO TIP: Change "onboarding@resend.dev" to your verified domain (e.g., "notifications@ewalogistics.com")
        await resend.emails.send({
          from: "EWA Logistics <onboarding@resend.dev>",
          to: [profile.email],
          subject: emailSubject,
          html: emailHtml,
        });
      }
    } catch (emailError) {
      console.error(`⚠️ Failed to send email to user ${userId}:`, emailError);
    }
  }

  return { success: !dbError };
}

// ==========================================
// 📱 STANDARD NOTIFICATION ACTIONS
// ==========================================

// ✅ Get notifications for the current logged-in user
export async function getUserNotifications(limit: number = 20) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated", notifications: [], unreadCount: 0 };
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("❌ Error fetching notifications:", error);
    return { error: error.message, notifications: [], unreadCount: 0 };
  }

  const unreadCount = data?.filter((n: any) => !n.is_read).length || 0;

  return { notifications: data || [], unreadCount };
}

// ✅ Mark a single notification as read
export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id); // Security: ensure they own it

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ✅ Mark ALL notifications as read for the current user
export async function markAllNotificationsAsRead() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ==========================================
// 🚀 HELPER FUNCTIONS FOR AUTOMATED ALERTS (Dual Channel)
// ==========================================

// ✅ Notify supplier when new order is placed
export async function notifySupplierNewOrder(
  supplierId: string, 
  materialName: string, 
  orderId: string,
  quantity?: number,
  unit?: string,
  amount?: number
) {
  return sendDualNotification(
    supplierId,
    "🆕 New Order Received!",
    `A customer has ordered ${quantity} ${unit} of ${materialName}. Please review and accept/reject.`,
    "order",
    "/dashboard/supplier",
    `📦 New Order Available: ${materialName}`,
    `<p>A new order for <strong>${quantity} ${unit}</strong> of <strong>${materialName}</strong> is available in the system.</p><p>Please log in to your supplier dashboard to review and accept this order.</p>`
  );
}

// ✅ Notify Admin when new order is placed
export async function notifyAdminNewOrder(
  adminId: string,
  materialName: string,
  orderId: string,
  quantity?: number,
  unit?: string
) {
  return sendDualNotification(
    adminId,
    "🔔 New Order Placed",
    `A new order for ${quantity} ${unit} of ${materialName} has been placed and is awaiting payment/acceptance.`,
    "info",
    "/admin?tab=orders",
    `🔔 New Order Placed on EWA Logistics`,
    `<p>A new order for <strong>${quantity} ${unit}</strong> of <strong>${materialName}</strong> has been placed.</p>`
  );
}

// ✅ Notify drivers in supplier's state when supplier accepts order
export async function notifyDriversInState(
  driverIds: string[],
  materialName: string,
  state: string,
  quantity?: number,
  unit?: string
) {
  const promises = driverIds.map(driverId => 
    sendDualNotification(
      driverId,
      "🚛 New Delivery Job Available!",
      `A new order for ${quantity} ${unit} of ${materialName} needs a driver in ${state}.`,
      "info",
      "/dashboard/driver?tab=jobs",
      `🚛 New Delivery Job Available in ${state}!`,
      `<p>A new order for <strong>${quantity} ${unit}</strong> of <strong>${materialName}</strong> needs a driver in <strong>${state}</strong>.</p><p>Log in to your dashboard to place your bid!</p>`
    )
  );
  return Promise.all(promises);
}

// ✅ Notify customer when driver is assigned
export async function notifyCustomerDriverAssigned(
  customerId: string, 
  driverName: string, 
  orderId: string,
  materialName: string
) {
  return sendDualNotification(
    customerId,
    "🚛 Driver Assigned!",
    `${driverName} has been assigned to your delivery of ${materialName}. Check your delivery code.`,
    "delivery",
    "/dashboard/tracking?id=" + orderId,
    `✅ Driver Assigned to Your Order!`,
    `<p>Great news! <strong>${driverName}</strong> has been assigned to your delivery of <strong>${materialName}</strong>.</p><p>Please log in to your dashboard to view the delivery details and your secure delivery code.</p>`
  );
}

// ✅ Notify driver when bid is accepted
export async function notifyDriverBidAccepted(
  driverId: string, 
  materialName: string, 
  orderId: string,
  bidAmount?: number,
  driverName?: string
) {
  return sendDualNotification(
    driverId,
    "✅ Bid Accepted!",
    `Your bid for ${materialName} delivery has been accepted. Proceed to pickup.`,
    "success",
    "/dashboard/driver/deliveries",
    `✅ Your Bid Has Been Accepted!`,
    `<p>Great news${driverName ? `, ${driverName}` : ''}!</p><p>Your bid for the delivery of <strong>${materialName}</strong> has been accepted by the customer.</p><p>Please await the delivery fee payment to be officially assigned to this trip.</p>`
  );
}

// ✅ Notify supplier & driver when delivery is confirmed by customer
export async function notifyDeliveryConfirmed(
  supplierId: string, 
  driverId: string | null, 
  materialName: string,
  orderId: string
) {
  const promises = [];
  
  // Notify Supplier
  promises.push(sendDualNotification(
    supplierId,
    "✅ Delivery Confirmed!",
    `Customer has confirmed delivery of ${materialName}. Payment will be released to your wallet.`,
    "success",
    "/dashboard/supplier",
    `💰 Payment Released for Your Order!`,
    `<p>Great news!</p><p>The customer has confirmed the delivery for Order <strong>${orderId}</strong> (${materialName}). Your earnings have been credited to your EWA Logistics wallet and are available for withdrawal.</p>`
  ));

  // Notify Driver
  if (driverId) {
    promises.push(sendDualNotification(
      driverId,
      "✅ Delivery Completed!",
      `Delivery of ${materialName} has been confirmed. Your trip earnings will be credited.`,
      "success",
      "/dashboard/driver",
      `💰 Trip Earnings Credited to Your Wallet!`,
      `<p>Great job!</p><p>The customer has confirmed the delivery for Order <strong>${orderId}</strong> (${materialName}). Your trip earnings have been credited to your EWA Logistics wallet and are available for withdrawal.</p>`
    ));
  }

  return Promise.all(promises);
}

// ✅ Notify supplier when no driver is found within a timeframe
export async function notifySupplierNoDriver(
  supplierId: string, 
  materialName: string, 
  orderId: string
) {
  return sendDualNotification(
    supplierId,
    "⚠️ No Driver Available",
    `No EWA driver was assigned within 20 minutes for ${materialName}. You can now assign your own driver.`,
    "warning",
    "/dashboard/supplier",
    `⚠️ Action Required: No Driver Available`,
    `<p>No EWA driver was assigned within 20 minutes for your order of <strong>${materialName}</strong>.</p><p>Please log in to your dashboard to assign your own driver and keep the delivery moving.</p>`
  );
}

// ✅ Notify customer when order is fully completed
export async function notifyCustomerOrderCompleted(
  customerId: string,
  orderId: string,
  materialName: string
) {
  return sendDualNotification(
    customerId,
    "🎉 Order Completed Successfully!",
    `Your order for ${materialName} is fully completed. Escrow has been released.`,
    "success",
    "/dashboard/customer",
    `🎉 Order Completed Successfully!`,
    `<p>Your order <strong>${orderId}</strong> for <strong>${materialName}</strong> has been fully completed and the escrow payment has been successfully released to the supplier and driver.</p><p>Thank you for using EWA Logistics!</p>`
  );
}

// ✅ Notify Admin when order is fully completed
export async function notifyAdminOrderCompleted(
  adminId: string,
  orderId: string,
  materialName: string
) {
  return sendDualNotification(
    adminId,
    "✅ Order Completed & Escrow Released",
    `Order ${orderId} (${materialName}) is fully completed. Escrow released to supplier and driver.`,
    "success",
    "/admin?tab=orders",
    `✅ Order Completed & Escrow Released`,
    `<p>Admin Alert:</p><p>Order <strong>${orderId}</strong> (${materialName}) has been fully completed by the customer. Escrow funds have been successfully released to the supplier and driver.</p>`
  );
}