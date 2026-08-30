"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ArrowRight, CheckCircle, AlertCircle, MapPin, 
  CreditCard, Building2, Smartphone, Truck, Package, 
  ShieldCheck, X, Loader2, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import { useToast } from "@/components/providers/toast-provider";
import { getMaterialById } from "@/app/actions/materials";
import { initializeSecurePayment } from "@/app/actions/paystack"; 
import { createClient } from "@/lib/supabase/client";

// ✅ NEW: Array of all Nigerian states for the dropdown
const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara"
];

function OrderPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const materialId = searchParams.get("material");
  
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [material, setMaterial] = useState<any>(null);
  const [supplierName, setSupplierName] = useState<string>("");
  const [isLoadingMaterial, setIsLoadingMaterial] = useState(true);
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    quantity: 1,
    paymentMethod: "card",
    promoCode: "",
    useCustomOffer: false,
    customDeliveryOffer: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (materialId) {
      getMaterialById(materialId).then(async ({ data, error }) => {
        if (data) {
          setMaterial(data);
          if (data.supplier_id) {
            const supabase = createClient();
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", data.supplier_id)
              .single();
            if (profile?.full_name) {
              setSupplierName(profile.full_name);
            }
          }
        }
        setIsLoadingMaterial(false);
      });
    } else {
      setIsLoadingMaterial(false);
    }
  }, [materialId]);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9\s\-]{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }
    if (!formData.address.trim()) newErrors.address = "Delivery address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!material) newErrors.material = "Please select a material first";
    if (formData.quantity < 1) newErrors.quantity = "Quantity must be at least 1";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const subtotal = material ? material.price_per_ton * formData.quantity : 0;
  const serviceCharge = 5000; 
  const deliveryOffer = formData.useCustomOffer ? (parseInt(formData.customDeliveryOffer) || 0) : 0;
  const totalAmount = subtotal + serviceCharge + deliveryOffer;

  const handleCheckout = async () => {
    setIsSubmitting(true);
    
    const orderData = {
      material_type: material?.name || "Construction Material",
      tonnage: formData.quantity,
      pickup_location: "Supplier Warehouse", 
      delivery_location: `${formData.city}, ${formData.state}`,
      delivery_address: formData.address,
      customer_notes: `Phone: ${formData.phone}${formData.promoCode ? ` | Promo: ${formData.promoCode}` : ''}${formData.useCustomOffer ? ` | Delivery Offer: ₦${formData.customDeliveryOffer}` : ''}`,
      total_amount: totalAmount,
      delivery_fee_offer: formData.useCustomOffer ? (parseInt(formData.customDeliveryOffer) || 0) : null,
    };

    const result = await initializeSecurePayment(orderData);

    if (result.error) {
      addToast({ type: "error", title: "Checkout Failed", message: result.error });
      setIsSubmitting(false);
    } else if (result.checkoutUrl) {
      addToast({ 
        type: "info", 
        title: "Redirecting...", 
        message: "Taking you to secure Flutterwave checkout" 
      });
      window.location.href = result.checkoutUrl;
    }
  };

  const applyPromo = () => {
    if (formData.promoCode.toUpperCase() === "EWA10") {
      addToast({ type: "success", title: "Promo Applied!", message: "10% discount added to your order." });
    } else {
      addToast({ type: "error", title: "Invalid Promo", message: "This promo code is not valid or has expired." });
    }
  };

  const paymentMethods = [
    { id: "card", label: "Credit / Debit Card", icon: CreditCard, desc: "Secure payment via Flutterwave" },
    { id: "bank", label: "Bank Transfer", icon: Building2, desc: "Direct transfer to escrow account" },
    { id: "mobile", label: "Mobile Money", icon: Smartphone, desc: "Pay via USSD or Mobile Wallet" },
  ];

  if (isLoadingMaterial) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!material && materialId) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Material Not Found</h2>
        <p className="text-muted-foreground mb-6">The material you are trying to order does not exist.</p>
        <Link href="/materials">
          <button className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer">
            Browse Materials
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 md:pt-32 px-6 max-w-7xl mx-auto pb-20">
        <div className="max-w-4xl mx-auto mb-10">
          <Link href="/materials" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-orange-500 transition-colors mb-6 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back to Materials
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Checkout</h1>
          
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${step >= 1 ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step > 1 ? "bg-white text-orange-500" : "bg-white/20"}`}>
                {step > 1 ? <CheckCircle className="w-4 h-4" /> : "1"}
              </div>
              Delivery Details
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${step >= 2 ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step > 2 ? "bg-white text-orange-500" : "bg-white/20"}`}>
                2
              </div>
              Payment & Review
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass rounded-2xl p-6 md:p-8 border border-border"
                >
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-500" /> Delivery Information
                  </h2>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Full Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className={`w-full px-4 py-3 bg-muted/50 border rounded-xl outline-none focus:ring-2 transition-all ${errors.fullName ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-orange-500/20 focus:border-orange-500"}`}
                        placeholder="John Doe"
                      />
                      {errors.fullName && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.fullName}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                        <input 
                          type="tel" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className={`w-full px-4 py-3 bg-muted/50 border rounded-xl outline-none focus:ring-2 transition-all ${errors.phone ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-orange-500/20 focus:border-orange-500"}`}
                          placeholder="+234 800 000 0000"
                        />
                        {errors.phone && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phone}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">City <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          className={`w-full px-4 py-3 bg-muted/50 border rounded-xl outline-none focus:ring-2 transition-all ${errors.city ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-orange-500/20 focus:border-orange-500"}`}
                          placeholder="e.g. Ikeja"
                        />
                        {errors.city && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.city}</p>}
                      </div>
                    </div>

                    {/* ✅ UPDATED: Replaced text input with a styled dropdown select */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5">State <span className="text-red-500">*</span></label>
                      <select 
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        className={`w-full px-4 py-3 bg-muted/50 border rounded-xl outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${errors.state ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-orange-500/20 focus:border-orange-500"}`}
                      >
                        <option value="" disabled>Select your state</option>
                        {nigerianStates.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {errors.state && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.state}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">Delivery Address <span className="text-red-500">*</span></label>
                      <textarea 
                        rows={3}
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className={`w-full px-4 py-3 bg-muted/50 border rounded-xl outline-none focus:ring-2 transition-all resize-none ${errors.address ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-orange-500/20 focus:border-orange-500"}`}
                        placeholder="Street name, building number, landmarks..."
                      />
                      {errors.address && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.address}</p>}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button 
                      onClick={handleNext}
                      className="flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer shadow-lg shadow-orange-500/20"
                    >
                      Continue to Payment <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass rounded-2xl p-6 md:p-8 border border-border"
                >
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-500" /> Payment Method
                  </h2>
                  
                  <div className="space-y-4 mb-8">
                    {paymentMethods.map((method) => (
                      <label 
                        key={method.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.paymentMethod === method.id 
                            ? "border-orange-500 bg-orange-500/5" 
                            : "border-border hover:border-orange-500/30 hover:bg-muted/30"
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="payment" 
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                          className="hidden"
                        />
                        <div className={`p-3 rounded-lg ${formData.paymentMethod === method.id ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"}`}>
                          <method.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{method.label}</p>
                          <p className="text-sm text-muted-foreground">{method.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === method.id ? "border-orange-500" : "border-muted-foreground"}`}>
                          {formData.paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-border">
                    <button 
                      onClick={handleBack}
                      className="flex items-center gap-2 px-6 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button 
                      onClick={() => setShowConfirmModal(true)}
                      className="flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer shadow-lg shadow-orange-500/20"
                    >
                      <ShieldCheck className="w-4 h-4" /> Review & Place Order
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="glass rounded-2xl p-6 border border-border">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-500" /> Order Summary
                </h3>
                
                {material && (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3 pb-4 border-b border-border">
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Truck className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{material.name}</p>
                        <p className="text-xs text-muted-foreground">₦{material.price_per_ton.toLocaleString()} / {material.unit}</p>
                        {supplierName && (
                          <p className="text-xs text-orange-500 font-medium mt-1 flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> Supplier: {supplierName}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Quantity ({material.unit})</label>
                      <input 
                        type="number" 
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                        className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input 
                      type="checkbox" 
                      checked={formData.useCustomOffer}
                      onChange={(e) => setFormData({...formData, useCustomOffer: e.target.checked, customDeliveryOffer: ""})}
                      className="w-4 h-4 text-orange-500 rounded border-border focus:ring-orange-500/20"
                    />
                    <span className="text-sm font-medium">Make an offer for delivery</span>
                  </label>
                  
                  {formData.useCustomOffer && (
                    <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl mb-4">
                      <label className="block text-xs font-medium text-orange-600 dark:text-orange-400 mb-1.5">Your Delivery Offer (₦)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={formData.customDeliveryOffer}
                        onChange={(e) => setFormData({...formData, customDeliveryOffer: e.target.value})}
                        className="w-full px-3 py-2 bg-background border border-orange-500/30 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        placeholder="e.g. 10000"
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">💡 Drivers can choose to accept or reject your offer.</p>
                    </div>
                  )}

                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Promo Code</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={formData.promoCode}
                      onChange={(e) => setFormData({...formData, promoCode: e.target.value})}
                      className="flex-1 px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 uppercase"
                      placeholder="Try 'EWA10'"
                    />
                    <button 
                      onClick={applyPromo}
                      className="px-3 py-2 bg-muted hover:bg-muted/80 border border-border rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Charge</span>
                    <span>₦{serviceCharge.toLocaleString()}</span>
                  </div>
                  {formData.useCustomOffer && deliveryOffer > 0 && (
                    <div className="flex justify-between text-sm text-orange-500">
                      <span>Your Delivery Offer</span>
                      <span>₦{deliveryOffer.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-border mt-3">
                    <span>Total</span>
                    <span className="text-orange-500">₦{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Your payment is securely held in escrow until you confirm delivery.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showConfirmModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setShowConfirmModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="glass rounded-2xl max-w-md w-full p-6 pointer-events-auto border border-border shadow-2xl">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Confirm Your Order?</h3>
                  <p className="text-sm text-muted-foreground">
                    You are about to pay <span className="font-semibold text-foreground">₦{totalAmount.toLocaleString()}</span>. 
                    Funds will be held securely in escrow.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowConfirmModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  
                  <button 
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : (
                      <><ShieldCheck className="w-4 h-4" /> Pay Securely</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    }>
      <OrderPageContent />
    </Suspense>
  );
}