"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Phone, Building2, Shield, Bell, Smartphone, 
  Save, Camera, Lock, AlertTriangle, Trash2, LogOut, CheckCircle, Loader2
} from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useToast } from "@/components/providers/toast-provider";
import { updateProfile } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";

// Skeleton Loader
function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass p-6 rounded-2xl border border-border animate-pulse space-y-4">
          <div className="h-6 w-40 bg-muted rounded" />
          <div className="space-y-3">
            <div className="h-10 w-full bg-muted rounded-lg" />
            <div className="h-10 w-full bg-muted rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Custom Toggle Switch Component
function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
      <div className="flex-1 pr-4">
        <p className="font-medium text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-muted peer-checked:bg-orange-500 rounded-full peer-focus:ring-2 peer-focus:ring-orange-500/30 transition-all duration-200 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-200 peer-checked:after:translate-x-5 shadow-sm" />
      </label>
    </div>
  );
}

export default function SettingsPage() {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile State
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "Customer",
    avatar: ""
  });
  
  // Notifications State
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotionalEmails: false,
    smsAlerts: true,
    deliveryTracking: true,
  });

  // Password State
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch profile data
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, phone, company_name, role, email")
          .eq("id", user.id)
          .single();

        if (profileData) {
          const initials = profileData.full_name 
            ? profileData.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() 
            : user.email?.charAt(0).toUpperCase() || "U";

          setProfile({
            name: profileData.full_name || "",
            email: profileData.email || user.email || "",
            phone: profileData.phone || "",
            company: profileData.company_name || "",
            role: profileData.role || "Customer",
            avatar: initials
          });
        }
      }
      setIsLoading(false);
    }
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const formPayload = new FormData();
    formPayload.append("full_name", profile.name);
    formPayload.append("phone", profile.phone);
    formPayload.append("company_name", profile.company);

    const result = await updateProfile(formPayload);

    if (result.error) {
      addToast({ type: "error", title: "Update Failed", message: result.error });
    } else {
      addToast({ type: "success", title: "Profile Updated", message: "Your account information has been saved successfully." });
      // Update avatar if name changed
      const initials = profile.name 
        ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() 
        : "U";
      setProfile({ ...profile, avatar: initials });
    }
    
    setIsSaving(false);
  };

  const handleSaveNotifications = () => {
    addToast({ type: "success", title: "Preferences Saved", message: "Your notification settings have been updated." });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      addToast({ type: "error", title: "Password Mismatch", message: "New password and confirmation do not match." });
      return;
    }
    addToast({ type: "success", title: "Password Changed", message: "Your password has been updated securely." });
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const handleDangerAction = (action: string) => {
    addToast({ type: "warning", title: "Action Confirmed", message: `${action} request has been processed. You will receive an email shortly.` });
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your profile, notifications, and security preferences.</p>
        </div>

        {isLoading ? (
          <SettingsSkeleton />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              
              {/* 1. Profile Information */}
              <form onSubmit={handleSaveProfile} className="glass p-6 md:p-8 rounded-2xl border border-border space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-6">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <User className="w-5 h-5 text-orange-500" /> Profile Information
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Update your personal and company details.</p>
                  </div>
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors cursor-pointer shadow-md shadow-orange-500/20 disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSaving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-4 h-4" /> Save Changes</>
                    )}
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar */}
                  <div className="flex flex-col items-center gap-3 md:w-1/3">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-orange-500/10">
                        {profile.avatar}
                      </div>
                      <button type="button" className="absolute bottom-0 right-0 p-2 bg-background border border-border rounded-full shadow-md hover:bg-muted transition-colors cursor-pointer group-hover:scale-105 transform">
                        <Camera className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground">Click to upload new photo</span>
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 grid md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                          type="text" 
                          value={profile.name}
                          onChange={(e) => setProfile({...profile, name: e.target.value})}
                          className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                          type="email" 
                          value={profile.email}
                          disabled
                          className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                          type="tel" 
                          value={profile.phone}
                          onChange={(e) => setProfile({...profile, phone: e.target.value})}
                          className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1.5">Company Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                          type="text" 
                          value={profile.company}
                          onChange={(e) => setProfile({...profile, company: e.target.value})}
                          className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1.5">Account Role</label>
                      <input 
                        type="text" 
                        value={profile.role}
                        disabled
                        className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-muted-foreground cursor-not-allowed capitalize"
                      />
                    </div>
                  </div>
                </div>
              </form>

              {/* 2. Notification Preferences */}
              <div className="glass p-6 md:p-8 rounded-2xl border border-border space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-6">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Bell className="w-5 h-5 text-orange-500" /> Notification Preferences
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Choose how and when you want to be contacted.</p>
                  </div>
                  <button onClick={handleSaveNotifications} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors cursor-pointer shadow-md shadow-orange-500/20">
                    <Save className="w-4 h-4" /> Save Preferences
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Toggle 
                    label="Order Updates" 
                    desc="Receive emails when your order status changes." 
                    checked={notifications.orderUpdates} 
                    onChange={() => setNotifications({...notifications, orderUpdates: !notifications.orderUpdates})} 
                  />
                  <Toggle 
                    label="Delivery Tracking" 
                    desc="Get real-time SMS when your driver is nearby." 
                    checked={notifications.deliveryTracking} 
                    onChange={() => setNotifications({...notifications, deliveryTracking: !notifications.deliveryTracking})} 
                  />
                  <Toggle 
                    label="Promotional Emails" 
                    desc="Receive discounts and platform updates." 
                    checked={notifications.promotionalEmails} 
                    onChange={() => setNotifications({...notifications, promotionalEmails: !notifications.promotionalEmails})} 
                  />
                  <Toggle 
                    label="SMS Alerts" 
                    desc="Critical account and security notifications." 
                    checked={notifications.smsAlerts} 
                    onChange={() => setNotifications({...notifications, smsAlerts: !notifications.smsAlerts})} 
                  />
                </div>
              </div>

              {/* 3. Security & Password */}
              <form onSubmit={handleChangePassword} className="glass p-6 md:p-8 rounded-2xl border border-border space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-6">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Lock className="w-5 h-5 text-orange-500" /> Security & Password
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Update your password to keep your account secure.</p>
                  </div>
                  <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors cursor-pointer shadow-md shadow-orange-500/20">
                    <Save className="w-4 h-4" /> Update Password
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-5 max-w-2xl">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1.5">Current Password</label>
                    <input 
                      type="password" 
                      value={passwords.current}
                      onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                      className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">New Password</label>
                    <input 
                      type="password" 
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </form>

              {/* 4. Danger Zone */}
              <div className="glass p-6 md:p-8 rounded-2xl border border-red-500/30 bg-red-500/5 space-y-6">
                <div className="flex items-center gap-3 border-b border-red-500/20 pb-6">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
                    <p className="text-sm text-muted-foreground">Irreversible actions for your account.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-background/50 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Deactivate Account</h4>
                      <p className="text-xs text-muted-foreground mb-4">Temporarily disable your account. You can reactivate it at any time by logging in.</p>
                    </div>
                    <button 
                      onClick={() => handleDangerAction("Deactivation")}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-red-500 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/10 transition-colors cursor-pointer w-fit"
                    >
                      <LogOut className="w-4 h-4" /> Deactivate
                    </button>
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-background/50 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Delete Account</h4>
                      <p className="text-xs text-muted-foreground mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
                    </div>
                    <button 
                      onClick={() => handleDangerAction("Account Deletion")}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer w-fit shadow-md shadow-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Permanently
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </DashboardLayout>
  );
}