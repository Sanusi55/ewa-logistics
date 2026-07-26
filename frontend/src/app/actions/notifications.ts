"use server";

import { createClient } from "@/lib/supabase/server";

// ✅ Create a notification for a specific user
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" | "order" | "delivery" | "bid" = "info",
  link?: string
) {
  const supabase = await createClient();

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    type,
    link: link || null,
    is_read: false,
  });

  if (error) {
    console.error("❌ Notification creation error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ✅ Get notifications for the current logged-in user (Matches NotificationBell component)
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

  const unreadCount = data?.filter((n) => !n.is_read).length || 0;

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
// 🚀 HELPER FUNCTIONS FOR AUTOMATED ALERTS
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
  // In-app notification
  const result = await createNotification(
    supplierId,
    "🆕 New Order Received!",
    `A customer has ordered ${materialName}. Please review and accept/reject.`,
    "order",
    "/dashboard/supplier"
  );

  // Optional: Send email (Uncomment if you have the email.ts file set up)
  // try {
  //   const { emailSupplierNewOrder } = await import("./email");
  //   await emailSupplierNewOrder(supplierId, materialName, quantity || 1, unit || "tons", amount || 0);
  // } catch (e) {
  //   console.error("Failed to send email:", e);
  // }

  return result;
}

// ✅ Notify customer when driver is assigned
export async function notifyCustomerDriverAssigned(customerId: string, driverName: string, orderId: string) {
  const result = await createNotification(
    customerId,
    "🚛 Driver Assigned!",
    `${driverName} has been assigned to your delivery. Check your delivery code.`,
    "delivery",
    "/dashboard/tracking?id=" + orderId
  );

  return result;
}

// ✅ Notify driver when bid is accepted
export async function notifyDriverBidAccepted(
  driverId: string, 
  materialName: string, 
  orderId: string,
  bidAmount?: number
) {
  const result = await createNotification(
    driverId,
    "✅ Bid Accepted!",
    `Your bid for ${materialName} delivery has been accepted. Proceed to pickup.`,
    "success",
    "/dashboard/driver/deliveries"
  );

  return result;
}

// ✅ Notify customer when supplier uploads weighbridge ticket
export async function notifyCustomerWeighbridgeUploaded(customerId: string, materialName: string, orderId: string) {
  return createNotification(
    customerId,
    "📄 Weighbridge Ticket Uploaded",
    `Supplier has uploaded the weighbridge ticket for ${materialName}.`,
    "info",
    "/dashboard/tracking?id=" + orderId
  );
}

// ✅ Notify customer when driver uploads proof of delivery
export async function notifyCustomerProofUploaded(customerId: string, materialName: string, orderId: string) {
  return createNotification(
    customerId,
    "📸 Delivery Proof Uploaded",
    `Driver has uploaded proof of delivery for ${materialName}. Please confirm.`,
    "delivery",
    "/dashboard/tracking?id=" + orderId
  );
}

// ✅ Notify supplier & driver when delivery is confirmed by customer
export async function notifyDeliveryConfirmed(supplierId: string, driverId: string | null, materialName: string) {
  const promises = [];
  
  promises.push(createNotification(
    supplierId,
    "✅ Delivery Confirmed!",
    `Customer has confirmed delivery of ${materialName}. Payment will be released.`,
    "success",
    "/dashboard/supplier"
  ));

  if (driverId) {
    promises.push(createNotification(
      driverId,
    "✅ Delivery Completed!",
      `Delivery of ${materialName} has been confirmed. Your earnings will be credited.`,
      "success",
      "/dashboard/driver"
    ));
  }

  return Promise.all(promises);
}

// ✅ Notify supplier when no driver is found within a timeframe
export async function notifySupplierNoDriver(supplierId: string, materialName: string, orderId: string) {
  return createNotification(
    supplierId,
    "⚠️ No Driver Available",
    `No EWA driver was assigned within 20 minutes for ${materialName}. You can now assign your own driver.`,
    "warning",
    "/dashboard/supplier"
  );
}