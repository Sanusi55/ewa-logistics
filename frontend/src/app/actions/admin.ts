"use server";

import { createClient } from "@/lib/supabase/server";

// ✅ Verify admin access
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated", isAdmin: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: "Admin privileges required", isAdmin: false };
  }

  return { user, profile, isAdmin: true };
}

// ✅ Log admin action
async function logAdminAction(
  adminId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  details?: any
) {
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({
    admin_id: adminId,
    action,
    target_type: targetType || null,
    target_id: targetId || null,
    details: details || null,
  }).catch(err => console.error("Failed to log admin action:", err));
}

// ✅ Get admin dashboard stats
export async function getAdminStats() {
  const admin = await requireAdmin();
  if (!admin.isAdmin) return { error: admin.error };

  const supabase = await createClient();

  const { data: users } = await supabase.from("profiles").select("id, role, created_at, is_suspended");
  const { data: orders } = await supabase.from("orders").select("id, status, total_amount, created_at, delivery_fee, driver_id");
  const { data: deliveries } = await supabase.from("deliveries").select("id, status, created_at, accepted_bid_amount").maybeSingle() 
    ? await supabase.from("deliveries").select("id, status, created_at, accepted_bid_amount") 
    : { data: [] };
  const { data: bids } = await supabase.from("driver_bids").select("id, status, bid_amount, created_at");

  const totalUsers = users?.length || 0;
  const customers = users?.filter(u => u.role === "customer").length || 0;
  const drivers = users?.filter(u => u.role === "driver").length || 0;
  const suppliers = users?.filter(u => u.role === "supplier").length || 0;
  const admins = users?.filter(u => u.role === "admin").length || 0;
  const suspendedUsers = users?.filter(u => u.is_suspended).length || 0;

  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => o.status === "pending_supplier_acceptance").length || 0;
  const awaitingDriver = orders?.filter(o => o.status === "driver_searching" || o.status === "no_driver_available").length || 0;
  const inTransit = orders?.filter(o => o.status === "in_transit" || o.status === "loading" || o.status === "driver_assigned" || o.status === "supplier_driver_assigned").length || 0;
  const delivered = orders?.filter(o => o.status === "delivered").length || 0;
  const cancelled = orders?.filter(o => o.status === "cancelled").length || 0;

  const totalRevenue = orders?.filter(o => o.status === "delivered").reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
  const pendingRevenue = orders?.filter(o => o.status !== "delivered" && o.status !== "cancelled").reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
  const totalDriverEarnings = orders?.filter(o => o.status === "delivered" && o.driver_id).reduce((sum, o) => sum + (o.delivery_fee || 0), 0) || 0;

  const revenueByDay = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.setHours(0, 0, 0, 0)).toISOString();
    const dayEnd = new Date(date.setHours(23, 59, 59, 999)).toISOString();
    
    const dayRevenue = orders?.filter(o => {
      const orderDate = new Date(o.created_at).toISOString();
      return orderDate >= dayStart && orderDate <= dayEnd && o.status === "delivered";
    }).reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

    const dayOrdersCount = orders?.filter(o => {
      const orderDate = new Date(o.created_at).toISOString();
      return orderDate >= dayStart && orderDate <= dayEnd;
    }).length || 0;

    revenueByDay.push({
      date: new Date(dayStart).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: dayRevenue,
      orders: dayOrdersCount,
    });
  }

  const totalCompleted = delivered + cancelled;
  const successRate = totalCompleted > 0 ? Math.round((delivered / totalCompleted) * 100) : 0;

  const validBids = bids?.filter(b => b.bid_amount > 0) || [];
  const avgBidAmount = validBids.length > 0 
    ? Math.round(validBids.reduce((sum, b) => sum + (b.bid_amount || 0), 0) / validBids.length)
    : 0;

  return {
    success: true,
    stats: {
      users: { total: totalUsers, customers, drivers, suppliers, admins, suspended: suspendedUsers },
      orders: { total: totalOrders, pending: pendingOrders, awaitingDriver, inTransit, delivered, cancelled },
      revenue: { total: totalRevenue, pending: pendingRevenue, driverEarnings: totalDriverEarnings },
      performance: { successRate, avgBidAmount },
      revenueByDay,
    },
  };
}

// ✅ Get all users (with filters)
export async function getAdminUsers(filter: string = "all", search: string = "") {
  const admin = await requireAdmin();
  if (!admin.isAdmin) return { error: admin.error, data: [] };

  const supabase = await createClient();
  let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });

  if (filter !== "all") {
    query = query.eq("role", filter);
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) return { error: error.message, data: [] };

  return { data: data || [], error: null };
}

// ✅ Suspend user
export async function suspendUser(userId: string, reason: string) {
  const admin = await requireAdmin();
  if (!admin.isAdmin) return { success: false, error: admin.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_suspended: true, suspension_reason: reason, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };

  await logAdminAction(admin.user!.id, "suspend_user", "user", userId, { reason });
  return { success: true };
}

// ✅ Unsuspend user
export async function unsuspendUser(userId: string) {
  const admin = await requireAdmin();
  if (!admin.isAdmin) return { success: false, error: admin.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_suspended: false, suspension_reason: null, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };

  await logAdminAction(admin.user!.id, "unsuspend_user", "user", userId);
  return { success: true };
}

// ✅ Change user role
export async function changeUserRole(userId: string, newRole: string) {
  const admin = await requireAdmin();
  if (!admin.isAdmin) return { success: false, error: admin.error };

  const validRoles = ["customer", "driver", "supplier", "admin"];
  if (!validRoles.includes(newRole)) {
    return { success: false, error: "Invalid role" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };

  await logAdminAction(admin.user!.id, "change_role", "user", userId, { newRole });
  return { success: true };
}

// ✅ Delete user
export async function deleteUser(userId: string) {
  const admin = await requireAdmin();
  if (!admin.isAdmin) return { success: false, error: admin.error };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").delete().eq("id", userId);

  if (error) return { success: false, error: error.message };

  await logAdminAction(admin.user!.id, "delete_user", "user", userId);
  return { success: true };
}

// ✅ Get all orders (WITH CUSTOMER NAMES RESTORED)
export async function getAdminOrders(status: string = "all", search: string = "") {
  const admin = await requireAdmin();
  if (!admin.isAdmin) return { error: admin.error, data: [] };

  const supabase = await createClient();
  
  // ✅ Restored the join using the exact foreign key name we created in SQL!
  let query = supabase
    .from("orders")
    .select(`
      *,
      profiles!orders_customer_id_fkey (full_name, email)
    `)
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(`id.ilike.%${search}%,delivery_location.ilike.%${search}%`);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error("❌ [ADMIN] getAdminOrders database error:", error);
    return { error: error.message, data: [] };
  }

  return { data: data || [], error: null };
}

// ✅ Get all deliveries
export async function getAdminDeliveries(status: string = "all") {
  const admin = await requireAdmin();
  if (!admin.isAdmin) return { error: admin.error, data: [] };

  const supabase = await createClient();
  
  let query = supabase
    .from("deliveries")
    .select("*")
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("❌ [ADMIN] getAdminDeliveries database error:", error);
    return { error: error.message, data: [] };
  }

  const mappedData = (data || []).map((d: any) => ({
    ...d,
    material_name: d.material_name || "N/A",
  }));

  return { data: mappedData, error: null };
}

// ✅ Broadcast notification to all users
export async function broadcastNotification(title: string, message: string, targetRoles: string[]) {
  const admin = await requireAdmin();
  if (!admin.isAdmin) return { success: false, error: admin.error };

  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("id")
    .in("role", targetRoles);

  if (!users || users.length === 0) {
    return { success: false, error: "No users found for selected roles" };
  }

  const notifications = users.map(u => ({
    user_id: u.id,
    title,
    message,
    type: "info",
    is_read: false,
  }));

  const { error } = await supabase.from("notifications").insert(notifications);

  if (error) return { success: false, error: error.message };

  await supabase.from("broadcast_notifications").insert({
    admin_id: admin.user!.id,
    title,
    message,
    target_roles: targetRoles,
    sent_count: users.length,
  }).catch(() => {});

  await logAdminAction(admin.user!.id, "broadcast_notification", "users", null, { 
    title, 
    targetRoles, 
    sentCount: users.length 
  });

  return { success: true, sentCount: users.length };
}

// ✅ Get audit logs
export async function getAuditLogs(limit: number = 50) {
  const admin = await requireAdmin();
  if (!admin.isAdmin) return { error: admin.error, data: [] };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { error: error.message, data: [] };

  return { data: data || [], error: null };
}

// ✅ Get platform settings
export async function getPlatformSettings() {
  const admin = await requireAdmin();
  if (!admin.isAdmin) return { error: admin.error, data: {} };

  const supabase = await createClient();
  const { data, error } = await supabase.from("platform_settings").select("*");

  if (error) return { error: error.message, data: {} };

  const settings: Record<string, string> = {};
  data?.forEach((s: any) => {
    settings[s.key] = s.value;
  });

  return { data: settings, error: null };
}

// ✅ Update platform setting
export async function updatePlatformSetting(key: string, value: string) {
  const admin = await requireAdmin();
  if (!admin.isAdmin) return { success: false, error: admin.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("platform_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key);

  if (error) return { success: false, error: error.message };

  await logAdminAction(admin.user!.id, "update_setting", "setting", key, { value });
  return { success: true };
}