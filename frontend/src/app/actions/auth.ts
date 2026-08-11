"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TOTP, Secret } from "otpauth"; // ✅ Fixed: Import Secret directly

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
      .select("role")
      .eq("id", authData.user.id)
      .maybeSingle();

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
// 👑 ADMIN 2FA: INITIATE LOGIN (Step 1: Password Check & TOTP Setup/Verify)
// ============================================
export async function initiateAdminLogin(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 1. Attempt to sign in with password
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: "Invalid email or password" };
  }

  // 2. Check if the user is actually an admin AND get their totp_secret
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, totp_secret") 
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "Access denied. Admin privileges required." };
  }

  // 3. Check if TOTP is set up
  if (!profile.totp_secret) {
    // Generate new TOTP secret
    const totp = new TOTP({
      issuer: "EWA Logistics",
      label: `EWA Admin (${email})`,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
    });

    const secret = totp.secret.base32;

    // Save secret to database
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ totp_secret: secret })
      .eq("id", authData.user.id);

    if (updateError) {
      console.error("Failed to save TOTP secret:", updateError);
      return { error: "Failed to setup 2FA. Please try again." };
    }

    return { 
      success: true, 
      requiresSetup: true, 
      secret: secret,
      qrCodeUrl: totp.toString(),
      message: "Please set up Google Authenticator"
    };
  }

  return { success: true, requires2FA: true, message: "Enter your 2FA code" };
}

// ============================================
// 🔐 ADMIN 2FA: VERIFY TOTP CODE (Step 2: Check Google Authenticator Code)
// ============================================
export async function verifyAdmin2FA(otpCode: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Session expired. Please log in again." };
  }

  // Get TOTP secret from database
  const { data: profile } = await supabase
    .from("profiles")
    .select("totp_secret")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.totp_secret) {
    return { error: "2FA not configured. Please contact support." };
  }

  // ✅ Fixed: Use Secret.fromBase32 instead of TOTP.Secret.fromBase32
  const totp = new TOTP({
    issuer: "EWA Logistics",
    label: `EWA Admin (${user.email})`,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(profile.totp_secret),
  });

  const delta = totp.validate({ token: otpCode, window: 1 });

  if (delta === null) {
    return { error: "Invalid or expired 2FA code." };
  }

  return { success: true, message: "Verification successful." };
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

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/update-password`,
  });

  if (error) {
    console.error("Forgot password error:", error);
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

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    console.error("Reset password error:", error);
    return { error: error.message || "Failed to update password. The link may have expired." };
  }

  return { success: true, message: "Password updated successfully! Redirecting to login..." };
}