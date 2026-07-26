"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Truck, Building2, Shield, Mail, Lock, Phone, 
  MapPin, ArrowRight, CheckCircle, Loader2, Eye, EyeOff, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/providers/toast-provider";

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", 
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", 
  "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", 
  "Federal Capital Territory (Abuja)"
];

const roles = [
  { 
    id: "customer", 
    label: "Customer", 
    desc: "I want to order materials",
    icon: User,
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500"
  },
  { 
    id: "supplier", 
    label: "Supplier", 
    desc: "I want to sell materials",
    icon: Building2,
    color: "from-orange-500 to-red-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500"
  },
  { 
    id: "driver", 
    label: "Driver", 
    desc: "I want to deliver materials",
    icon: Truck,
    color: "from-purple-500 to-pink-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500"
  },
];

export default function SignupPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const supabase = createClient();
  
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    state: "",
    companyName: "",
    truckDetails: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedRole) {
      newErrors.role = "Please select a role to continue";
      addToast({ 
        type: "error", 
        title: "Role Required", 
        message: "Please select how you want to use EWA Logistics" 
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9\s\-]{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone format (e.g. +234 800 000 0000)";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.state.trim()) newErrors.state = "State is required";
    
    if (selectedRole === "supplier" && !formData.companyName.trim()) {
      newErrors.companyName = "Company name is required for suppliers";
    }
    if (selectedRole === "driver" && !formData.truckDetails.trim()) {
      newErrors.truckDetails = "Truck details are required for drivers";
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      addToast({ 
        type: "error", 
        title: "Missing Information", 
        message: "Please fill in all required fields" 
      });
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
  };

  const handleSignup = async () => {
    if (!validateStep2()) return;

    setIsSubmitting(true);

    try {
      console.log("📝 Starting signup with role:", selectedRole);
      console.log("📝 Form data:", formData);

      // ✅ Step 1: Create auth user with role in metadata
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            role: selectedRole,
            state: formData.state,
            company_name: formData.companyName,
            truck_details: formData.truckDetails,
          },
        },
      });

      if (error) {
        console.error("❌ Signup error:", error);
        addToast({ 
          type: "error", 
          title: "Signup Failed", 
          message: error.message 
        });
        setIsSubmitting(false);
        return;
      }

      console.log("✅ Auth user created:", data.user?.id);

      // ✅ Step 2: Update profile with role and additional info
      if (data.user) {
        const profileData: any = {
          id: data.user.id,
          email: formData.email,
          role: selectedRole,
          state: formData.state,
          phone: formData.phone,
          full_name: selectedRole === "supplier" ? formData.companyName : formData.fullName,
          company_name: selectedRole === "supplier" ? formData.companyName : null,
          truck_details: selectedRole === "driver" ? formData.truckDetails : null,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };

        console.log("📝 Upserting profile with role:", selectedRole);

        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert(profileData, { onConflict: 'id' })
          .select();

        if (upsertError) {
          console.error("❌ Profile upsert error:", upsertError);
        } else {
          console.log("✅ Profile upserted successfully");
        }

        // ✅ Step 3: Verify the role was set correctly
        const { data: verifyData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        console.log("🔍 Verification - Profile role:", verifyData?.role);

        if (verifyData?.role !== selectedRole) {
          console.warn("⚠️ Role mismatch! Fixing...");
          await supabase
            .from("profiles")
            .update({ role: selectedRole })
            .eq("id", data.user.id);
        }

        // ✅ Step 4: LOGOUT the user after signup (prevents auto-login)
        await supabase.auth.signOut();
        console.log("✅ User logged out after signup");
      }

      addToast({ 
        type: "success", 
        title: "Account Created! 🎉", 
        message: `Welcome to EWA Logistics! Your ${selectedRole} account has been created. Please login to continue.` 
      });

      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (error: any) {
      console.error("❌ Signup exception:", error);
      addToast({ 
        type: "error", 
        title: "Error", 
        message: error.message || "Something went wrong. Please try again." 
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              EWA Logistics
            </h1>
          </Link>
          <p className="text-muted-foreground mt-2">Create your account</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${step >= 1 ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step > 1 ? "bg-white text-orange-500" : "bg-white/20"}`}>
              {step > 1 ? <CheckCircle className="w-4 h-4" /> : "1"}
            </div>
            Select Role
          </div>
          <div className="w-8 h-0.5 bg-border" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${step >= 2 ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step > 2 ? "bg-white text-orange-500" : "bg-white/20"}`}>
              2
            </div>
            Your Details
          </div>
        </div>

        <div className="glass rounded-2xl p-6 md:p-8 border border-border">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-bold mb-2">How will you use EWA?</h2>
                <p className="text-sm text-muted-foreground mb-6">Choose the role that best describes you</p>

                <div className="space-y-3">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.id;
                    
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => {
                          setSelectedRole(role.id);
                          setErrors({});
                        }}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected 
                            ? `${role.border} ${role.bg} shadow-lg` 
                            : "border-border hover:border-orange-500/30 hover:bg-muted/30"
                        }`}
                      >
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${role.color} text-white flex-shrink-0`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-foreground">{role.label}</p>
                          <p className="text-sm text-muted-foreground">{role.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? role.border : "border-muted-foreground"}`}>
                          {isSelected && <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${role.color}`} />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {errors.role && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errors.role}</span>
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer shadow-lg shadow-orange-500/20"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm text-center text-muted-foreground mt-6">
                  Already have an account?{" "}
                  <Link href="/login" className="text-orange-500 font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${roles.find(r => r.id === selectedRole)?.color} text-white`}>
                    {(() => {
                      const Icon = roles.find(r => r.id === selectedRole)?.icon || User;
                      return <Icon className="w-5 h-5" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Your Details</h2>
                    <p className="text-sm text-muted-foreground">
                      Signing up as a <span className="font-semibold text-orange-500 capitalize">{selectedRole}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedRole === "supplier" && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Company Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                        className={`w-full px-4 py-3 bg-muted/50 border rounded-xl outline-none focus:ring-2 transition-all ${errors.companyName ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-orange-500/20 focus:border-orange-500"}`}
                        placeholder="e.g. Sagamu Quarry Ltd"
                      />
                      {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>}
                    </div>
                  )}

                  {selectedRole === "driver" && (
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Truck Details <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={formData.truckDetails}
                        onChange={(e) => setFormData({...formData, truckDetails: e.target.value})}
                        className={`w-full px-4 py-3 bg-muted/50 border rounded-xl outline-none focus:ring-2 transition-all ${errors.truckDetails ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-orange-500/20 focus:border-orange-500"}`}
                        placeholder="e.g. Volvo Tipper, ABC-123-DE, 30 tons"
                      />
                      {errors.truckDetails && <p className="text-xs text-red-500 mt-1">{errors.truckDetails}</p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className={`w-full px-4 py-3 bg-muted/50 border rounded-xl outline-none focus:ring-2 transition-all ${errors.fullName ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-orange-500/20 focus:border-orange-500"}`}
                      placeholder="John Doe"
                    />
                    {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={`w-full pl-10 pr-4 py-3 bg-muted/50 border rounded-xl outline-none focus:ring-2 transition-all ${errors.email ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-orange-500/20 focus:border-orange-500"}`}
                        placeholder="you@example.com"
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className={`w-full pl-10 pr-4 py-3 bg-muted/50 border rounded-xl outline-none focus:ring-2 transition-all ${errors.phone ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-orange-500/20 focus:border-orange-500"}`}
                        placeholder="+234 800 000 0000"
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">State <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <select
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        className={`w-full pl-10 pr-4 py-3 bg-muted/50 border rounded-xl outline-none focus:ring-2 transition-all ${errors.state ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-orange-500/20 focus:border-orange-500"}`}
                      >
                        <option value="">Select State</option>
                        {nigerianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className={`w-full pl-10 pr-12 py-3 bg-muted/50 border rounded-xl outline-none focus:ring-2 transition-all ${errors.password ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-orange-500/20 focus:border-orange-500"}`}
                        placeholder="At least 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSignup}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
                    ) : (
                      <>Create Account <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>

                <p className="text-sm text-center text-muted-foreground mt-6">
                  Already have an account?{" "}
                  <Link href="/login" className="text-orange-500 font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}