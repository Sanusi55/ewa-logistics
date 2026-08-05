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

  const { error, data: authData } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  if (authData.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_approved")
      .eq("id", authData.user.id)
      .maybeSingle();

    // ✅ NEW: Block unapproved suppliers and drivers
    if ((profile?.role === "supplier" || profile?.role === "driver") && profile?.is_approved === false) {
      await supabase.auth.signOut(); // Log them out immediately
      return { error: "Your account is pending admin approval. Please check back later." };
    }

    if (profile?.role === "admin") {
      redirect("/admin");
    }
  }

  redirect("/dashboard");
}

// ============================================
// 📝 SIGNUP (Create New Account)
// ============================================
export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const role = (formData.get("role") as string) || "customer";

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // ✅ NEW: Explicitly set is_approved to false for suppliers and drivers
  if (authData.user && (role === "supplier" || role === "driver")) {
    await supabase
      .from("profiles")
      .update({ is_approved: false })
      .eq("id", authData.user.id);
      
    // Redirect to dashboard with a pending flag so the UI can show a message
    redirect("/dashboard?pending=true");
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

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Authentication failed." };
  }

  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, email, full_name")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError) {
      await supabase.auth.signOut();
      return { error: `Database error: ${profileError.message}` };
    }

    if (!profile) {
      await supabase.auth.signOut();
      return { error: "Profile not found. Please contact support." };
    }

    if (profile.role !== "admin") {
      await supabase.auth.signOut();
      return { error: "Access denied. Admin privileges required." };
    }

    return { success: true };
  } catch (error: any) {
    await supabase.auth.signOut();
    return { error: error.message || "An unexpected error occurred" };
  }
}

// ============================================
// ✅ NEW: Approve User (For Admin Dashboard)
// ============================================
export async function approveUser(userId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("profiles")
    .update({ is_approved: true, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

// ============================================
// 🔑 FORGOT PASSWORD (Send Reset Email)
// ============================================
export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Please enter your email address." };
  }

  // Sends the reset email with a link to /update-password
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/update-password`,
  });

  if (error) {
    console.error("Forgot password error:", error);
    // We return success even if the email doesn't exist to prevent email enumeration
    return { success: true, message: "If an account with that email exists, we have sent a password reset link." };
  }

  return { success: true, message: "Password reset link sent! Please check your email inbox and spam folder." };
}

// ============================================
// 🔄 RESET PASSWORD (Update Password after clicking email link)
// ============================================
export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { error: "Please fill in all fields." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  // Updates the user's password in Supabase Auth
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    console.error("Reset password error:", error);
    return { error: error.message || "Failed to update password. The link may have expired." };
  }

  return { success: true, message: "Password updated successfully! Redirecting to login..." };
}