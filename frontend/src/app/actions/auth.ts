"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// ============================================
// 🔐 REGULAR LOGIN (Customer/Supplier/Driver)
// ============================================
export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  // ✅ Check user role and redirect accordingly
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();  // ✅ Changed to maybeSingle

    // Admin users go to /admin
    if (profile?.role === "admin") {
      redirect("/admin");
    }
  }

  // All other users go to /dashboard
  redirect("/dashboard");
}

// ============================================
// 📝 SIGNUP (Create New Account)
// ============================================
export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: formData.get("full_name") as string,
        role: (formData.get("role") as string) || "customer",
      },
    },
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

// ============================================
// 🚪 LOGOUT (Sign Out)
// ============================================
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// ============================================
// 👤 UPDATE PROFILE
// ============================================
export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: "You must be logged in to update your profile." };
  }

  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const companyName = formData.get("company_name") as string;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone,
      company_name: companyName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("Profile update error:", updateError);
    return { error: "Failed to update profile. Please try again." };
  }

  return { success: true, message: "Profile updated successfully!" };
}

// ============================================
// 👑 ADMIN LOGIN (Special Admin Access)
// ============================================
export async function adminLogin(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log("🔐 Admin login attempt:", email);

  // Step 1: Try to sign in
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error("❌ Auth error:", authError);
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Authentication failed." };
  }

  console.log("✅ Auth successful, user ID:", authData.user.id);

  // Step 2: Check if user is admin - with better error handling
  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, email, full_name")
      .eq("id", authData.user.id)
      .maybeSingle();  // ✅ Changed to maybeSingle

    if (profileError) {
      console.error("❌ Profile query error:", profileError);
      await supabase.auth.signOut();
      return { error: `Database error: ${profileError.message}` };
    }

    if (!profile) {
      console.error("❌ No profile found for user");
      await supabase.auth.signOut();
      return { error: "Profile not found. Please contact support." };
    }

    console.log("✅ Profile found, role:", profile.role);

    if (profile.role !== "admin") {
      console.error("❌ User is not admin, role:", profile.role);
      await supabase.auth.signOut();
      return { error: "Access denied. Admin privileges required." };
    }

    console.log("✅ Admin login successful!");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Admin login exception:", error);
    await supabase.auth.signOut();
    return { error: error.message || "An unexpected error occurred" };
  }
}