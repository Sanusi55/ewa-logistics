"use server";

import { createClient } from "@/lib/supabase/server";

// ✅ Helper to verify admin access (Crucial for Security)
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { isAdmin: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { isAdmin: false, error: "Admin privileges required" };
  }

  return { isAdmin: true, userId: user.id };
}

// ✅ PUBLIC: Submit contact form (No admin check needed)
export async function submitContactForm(formData: {
  name: string;
  email: string;
  message: string;
}) {
  const supabase = await createClient();

  try {
    console.log("📧 Submitting contact form...");
    
    // Validate input
    if (!formData.name || !formData.email || !formData.message) {
      console.error("❌ Validation failed: Missing fields");
      return { error: "All fields are required" };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      console.error("❌ Validation failed: Invalid email");
      return { error: "Invalid email format" };
    }

    // Insert message into database
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        status: "unread",
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Insert error:", error);
      return { 
        error: "Failed to send message. Please try again.",
        details: error.message 
      };
    }

    console.log("✅ Contact message saved:", data.id);

    return { 
      success: true, 
      message: "Thank you! Your message has been sent. We'll get back to you soon." 
    };
  } catch (error: any) {
    console.error("❌ Contact form exception:", error);
    return { 
      error: error.message || "An unexpected error occurred",
      details: error.toString()
    };
  }
}

// ✅ ADMIN ONLY: Get all contact messages
export async function getContactMessages(status?: string) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return { error: adminCheck.error, data: [] };

  const supabase = await createClient();

  try {
    let query = supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Get messages error:", error);
      return { error: error.message, data: [] };
    }

    return { data: data || [] };
  } catch (error: any) {
    console.error("❌ Get messages exception:", error);
    return { error: error.message, data: [] };
  }
}

// ✅ ADMIN ONLY: Mark a single message as read
export async function markMessageAsRead(messageId: string) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return { success: false, error: adminCheck.error };

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("contact_messages")
      .update({ 
        status: "read",
        updated_at: new Date().toISOString()
      })
      .eq("id", messageId);

    if (error) {
      console.error("❌ Mark as read error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("❌ Mark as read exception:", error);
    return { success: false, error: error.message };
  }
}

// ✅ ADMIN ONLY: Mark a message as responded and save admin notes
export async function markMessageAsResponded(messageId: string, adminNotes: string) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return { success: false, error: adminCheck.error };

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("contact_messages")
      .update({ 
        status: "responded",
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      })
      .eq("id", messageId);

    if (error) {
      console.error("❌ Mark as responded error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("❌ Mark as responded exception:", error);
    return { success: false, error: error.message };
  }
}

// ✅ ADMIN ONLY: Delete a message permanently
export async function deleteMessage(messageId: string) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return { success: false, error: adminCheck.error };

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      console.error("❌ Delete message error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("❌ Delete message exception:", error);
    return { success: false, error: error.message };
  }
}

// ✅ ADMIN ONLY: Get count of unread messages
export async function getUnreadCount() {
  const adminCheck = await requireAdmin();
  if (!adminCheck.isAdmin) return { error: adminCheck.error, count: 0 };

  const supabase = await createClient();

  try {
    const { count, error } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("status", "unread");

    if (error) {
      console.error("❌ Get unread count error:", error);
      return { error: error.message, count: 0 };
    }

    return { count: count || 0 };
  } catch (error: any) {
    console.error("❌ Get unread count exception:", error);
    return { error: error.message, count: 0 };
  }
}