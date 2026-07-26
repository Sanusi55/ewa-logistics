"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { 
  ArrowRight, ShieldCheck, TrendingUp, Truck, Package, MapPin, CreditCard, 
  CheckCircle, Star, Phone, Mail, ChevronDown, ChevronUp, Send, Globe, 
  Share2, Camera, Link as LinkIcon, Zap, Lock, Award, RefreshCw, 
  MessageCircle, Shield, Clock, Building2, Users, Keyboard, FileText, Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import MagneticButton from "@/components/magnetic-button";
import { useToast } from "@/components/providers/toast-provider";
import { submitContactForm } from "@/app/actions/contact";

// --- Animated Counter Component ---
function AnimatedCounter({ end, duration = 2, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) animationFrame = requestAnimationFrame(step);
    };
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

// --- FAQ Item Component ---
function FAQItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm">
      <button onClick={onClick} className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors cursor-pointer">
        <span className="font-medium">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-orange-500" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      <motion.div initial={false} animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
        <p className="px-4 pb-4 text-muted-foreground">{answer}</p>
      </motion.div>
    </div>
  );
}

// --- Testimonial Component ---
function TestimonialCard({ name, role, content, rating }: { name: string; role: string; content: string; rating: number }) {
  return (
    <div className="glass p-6 rounded-2xl min-w-[300px] md:min-w-[400px] snap-center border border-border/50">
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-orange-400 text-orange-400" : "text-muted"}`} />
        ))}
      </div>
      <p className="text-muted-foreground mb-4 italic">"{content}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
}

// --- Marquee Item ---
function MarqueeItem({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2 px-6 py-2 whitespace-nowrap">
      <Icon className="w-4 h-4 text-orange-500 flex-shrink-0" />
      <span className="text-sm font-medium text-foreground/80">{text}</span>
    </div>
  );
}

export default function Home() {
  const { addToast } = useToast();
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const liveActivities = [
    { user: "Chioma A.", action: "ordered 5 tons of 1-Inch Granite", location: "Lekki, Lagos", time: "2 min ago" },
    { user: "Emmanuel O.", action: "completed a delivery", location: "Ikeja, Lagos", time: "5 min ago" },
    { user: "Sagamu Quarry", action: "added 50 tons of Stone Base to inventory", location: "Ogun State", time: "12 min ago" },
  ];
  const [activityIndex, setActivityIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % liveActivities.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "Active Deliveries", value: 1250, suffix: "+" },
    { label: "Verified Suppliers", value: 340, suffix: "+" },
    { label: "Secure Transactions", value: 98, suffix: "%" },
  ];

  const steps = [
    { icon: Package, title: "Place Order", desc: "Select materials & delivery location." },
    { icon: Truck, title: "Suppliers Bid", desc: "Verified suppliers submit competitive prices." },
    { icon: MapPin, title: "Driver Assigned", desc: "Drivers bid for delivery; you choose." },
    { icon: CreditCard, title: "Secure Payment", desc: "Funds held in escrow until delivery." },
    { icon: CheckCircle, title: "Track & Receive", desc: "Live GPS tracking until safe arrival." }
  ];

  const testimonials = [
    { name: "Chioma A.", role: "Project Manager, BuildRight Ltd", content: "EWA delivered 50 tons of granite to our Lekki site 2 days early. The escrow system gave us peace of mind!", rating: 5 },
    { name: "Emmanuel O.", role: "Truck Driver", content: "I've earned 3x more since joining EWA. The bidding system is fair and payments are always on time.", rating: 5 },
    { name: "Adebayo K.", role: "Supplier, Sagamu Quarry", content: "Managing inventory and orders on EWA is seamless. Our sales increased by 200% in 3 months!", rating: 5 }
  ];

  const faqs = [
    { q: "How does escrow payment work?", a: "Your payment is held securely until you confirm delivery. Funds are released only after successful completion." },
    { q: "Can I track my delivery?", a: "Yes! Live GPS tracking with ETA updates, route optimization, and push notifications." },
    { q: "How do I become a supplier?", a: "Submit documents & samples. We verify within 48 hours, then you can list materials instantly." },
    { q: "What is the delivery code system?", a: "When delivery arrives, you receive a unique 6-digit code. Share it with the driver to confirm delivery and release payment." }
  ];

  const handleFormSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      addToast({ 
        type: "error", 
        title: "Missing Information", 
        message: "Please fill in all fields" 
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitContactForm(formData);
      
      if (result.success) {
        setFormSubmitted(true);
        addToast({ 
          type: "success", 
          title: "Message Sent! ✉️", 
          message: result.message || "Thank you! We'll get back to you soon." 
        });
        setFormData({ name: "", email: "", message: "" });
        
        setTimeout(() => { 
          setFormSubmitted(false); 
        }, 3000);
      } else {
        addToast({ 
          type: "error", 
          title: "Error", 
          message: result.error || "Failed to send message. Please try again." 
        });
      }
    } catch (error: any) {
      addToast({ 
        type: "error", 
        title: "Error", 
        message: error.message || "An unexpected error occurred" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      
      {/* 📊 SCROLL PROGRESS BAR */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 origin-left z-[100] shadow-lg shadow-orange-500/50"
        style={{ scaleX }}
      />

      <Navbar />
      
      {/* 🔄 MARQUEE SECTION */}
      <div className="relative overflow-hidden bg-muted/30 border-b border-border py-2.5 z-20">
        <motion.div className="flex whitespace-nowrap" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 30, ease: "linear", repeat: Infinity }}>
          {[
            { icon: Lock, text: "🔒 Escrow Protected" }, { icon: CheckCircle, text: "✅ Verified Partners" },
            { icon: Truck, text: "🚚 Live GPS Tracking" }, { icon: Zap, text: "⚡ Fast Delivery" },
            { icon: Award, text: "🏆 500+ Companies" }, { icon: ShieldCheck, text: "🛡️ Secure Shipping" },
          ].map((item, i) => <MarqueeItem key={`f-${i}`} icon={item.icon} text={item.text} />)}
          {[
            { icon: Lock, text: "🔒 Escrow Protected" }, { icon: CheckCircle, text: "✅ Verified Partners" },
            { icon: Truck, text: "🚚 Live GPS Tracking" }, { icon: Zap, text: "⚡ Fast Delivery" },
            { icon: Award, text: "🏆 500+ Companies" }, { icon: ShieldCheck, text: "🛡️ Secure Shipping" },
          ].map((item, i) => <MarqueeItem key={`s-${i}`} icon={item.icon} text={item.text} />)}
        </motion.div>
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-muted/30 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-muted/30 to-transparent pointer-events-none" />
      </div>

      {/* 🎬 HERO SECTION WITH IMAGE BACKGROUND */}
      <main className="relative pt-20 md:pt-24 px-4 md:px-6 min-h-[80vh] md:min-h-[90vh] flex items-center">
        
        {/* ✅ Cinematic Image Background from Unsplash */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: 'url(https://images.unsplash.com/photo-1624084340915-8ef036692deb?q=80&w=1920&auto=format&fit=crop)' 
            }}
          />
          
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/40 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center w-full px-2">
          <motion.div style={{ y }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            
            {/* Live Activity Ticker */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs md:text-sm font-medium mb-4 md:mb-6 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="truncate max-w-[200px] md:max-w-md">
                Live: {liveActivities[activityIndex].user} {liveActivities[activityIndex].action}
              </span>
            </motion.div>

            {/* ✅ Responsive heading font sizes and line height */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }} 
              className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 md:mb-6 text-white leading-tight"
            >
              Premium Logistics &<br />
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 bg-clip-text text-transparent">
                Materials Marketplace
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.4 }} 
              className="text-base md:text-lg lg:text-xl text-gray-200 max-w-2xl mx-auto mb-8 md:mb-10 px-2"
            >
              Order granite, sand, and construction materials with secure escrow payments, real-time GPS tracking, and verified supplier bidding.
            </motion.p>
            
            {/* 🧲 MAGNETIC BUTTONS (Updated to use as="a" for valid HTML) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.6 }} 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 md:mb-16"
            >
              <MagneticButton 
                as="a"
                href="/materials"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
                magneticStrength={0.4}
              >
                Order Materials <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
              
              <MagneticButton 
                as="a"
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 backdrop-blur-sm transition-all"
                magneticStrength={0.4}
              >
                Become a Partner
              </MagneticButton>
            </motion.div>

            {/* ⌨️ Keyboard Shortcut Hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center justify-center gap-2 mb-8 md:mb-16"
            >
              <kbd className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-gray-300">
                <Keyboard className="w-3 h-3" />
                <span>⌘</span>
                <span>+</span>
                <span>K</span>
              </kbd>
              <span className="hidden md:inline text-xs text-gray-400">to search & navigate instantly</span>
            </motion.div>

            {/* ✅ Responsive stats grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.8 }} 
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto w-full"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="p-4 md:p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-sm">
                  <div className="text-2xl md:text-3xl font-bold mb-1 flex items-center justify-center gap-2 text-orange-500">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-xs md:text-sm text-gray-300">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* 🏢 TRUSTED BY SECTION */}
      <section className="py-12 border-y border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">Trusted by Nigeria's Top Construction Firms</p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {["Dangote Group", "Julius Berger", "Reynolds Construction", "CCECC", "Setraco"].map((company) => (
              <div key={company} className="flex items-center gap-2 text-lg md:text-xl font-bold text-foreground/70 hover:text-orange-500 transition-colors cursor-default">
                <Building2 className="w-5 h-5 md:w-6 md:h-6" /> {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🛡️ TRUST BADGES SECTION */}
      <section className="py-16 md:py-20 px-4 md:px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose EWA Logistics?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Built for reliability, security, and speed in the construction industry.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shield, title: "Escrow Protection", desc: "Your funds are 100% secure until you confirm delivery." },
            { icon: CheckCircle, title: "Verified Partners", desc: "Every supplier and driver undergoes strict background checks." },
            { icon: Clock, title: "24/7 Support", desc: "Round-the-clock assistance for orders, tracking, and disputes." },
            { icon: Zap, title: "Lightning Fast", desc: "Average delivery time under 24 hours across major cities." }
          ].map((badge, i) => (
            <motion.div 
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-6 rounded-2xl border border-border hover:border-orange-500/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4 group-hover:scale-110 transition-transform">
                <badge.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">{badge.title}</h3>
              <p className="text-sm text-muted-foreground">{badge.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🔄 HOW EWA WORKS */}
      <section id="how-it-works" className="py-16 md:py-20 px-4 md:px-6 max-w-6xl mx-auto bg-muted/20 rounded-3xl my-8 md:my-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How EWA Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">From order to delivery in 5 simple steps. Transparent, secure, and efficient.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {steps.map((step, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: i * 0.1 }} 
              className="glass p-6 rounded-2xl text-center relative border border-border/50"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
              {i < steps.length - 1 && <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-border" />}
            </motion.div>
          ))}
        </div>
      </section>

      {/* 💬 TESTIMONIALS */}
      <section id="testimonials" className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Real stories from contractors, drivers, and suppliers who trust EWA.</p>
          </motion.div>
          <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory custom-scrollbar">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <TestimonialCard {...t} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ❓ FAQ */}
      <section id="faq" className="py-16 md:py-20 px-4 md:px-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">Everything you need to know about using EWA Logistics.</p>
        </motion.div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} isOpen={openFAQ === i} onClick={() => setOpenFAQ(openFAQ === i ? null : i)} />
          ))}
        </div>
      </section>

      {/* 📞 CONTACT - WITH DATABASE INTEGRATION */}
      <section id="contact" className="py-16 md:py-20 px-4 md:px-6 bg-muted/20">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground mb-6">Have questions? We're here to help 24/7.</p>
            
            <div className="space-y-4 mb-8">
              <a href="tel:+2348161305942" className="flex items-center gap-3 hover:text-orange-500 transition-colors cursor-pointer">
                <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span>+234 816 130 5942</span>
              </a>
              
              <a href="https://wa.me/2349035790128" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all group cursor-pointer">
                <div className="p-2 bg-green-500 rounded-full text-white shadow-sm flex-shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-700 dark:text-green-400">WhatsApp Chat</p>
                  <p className="text-xs text-green-600 dark:text-green-500">Tap to chat directly: 0903 579 0128</p>
                </div>
              </a>
              
              <a href="mailto:support@ewalogistics.com" className="flex items-center gap-3 hover:text-orange-500 transition-colors cursor-pointer">
                <Mail className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span>support@ewalogistics.com</span>
              </a>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Babangida Market FHA Lugbe</p>
                  <p className="text-sm text-muted-foreground">Abuja, Nigeria</p>
                </div>
              </div>
            </div>

            {/* ✅ Response Time Info */}
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">Response Time</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    We typically respond within 24 hours. For urgent matters, use WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.form 
            initial={{ opacity: 0, x: 20 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            onSubmit={handleFormSubmit} 
            className="glass p-6 rounded-2xl space-y-4 border border-border"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
              <input 
                required 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-orange-500 transition-all" 
                placeholder="Your name" 
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
              <input 
                required 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-orange-500 transition-all" 
                placeholder="you@example.com" 
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message <span className="text-red-500">*</span></label>
              <textarea 
                required 
                value={formData.message} 
                onChange={(e) => setFormData({ ...formData, message: e.target.value })} 
                rows={4} 
                className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 ring-orange-500 transition-all resize-none" 
                placeholder="How can we help?" 
                disabled={isSubmitting}
              />
            </div>
            <button 
              type="submit" 
              disabled={formSubmitted || isSubmitting} 
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-70 cursor-pointer shadow-lg shadow-orange-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                </>
              ) : formSubmitted ? (
                <>
                  <CheckCircle className="w-4 h-4" /> Message Sent!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Message
                </>
              )}
            </button>
            
            <p className="text-xs text-center text-muted-foreground">
              Your message will be saved and reviewed by our team.
            </p>
          </motion.form>
        </div>
      </section>

      {/* 🦶 FOOTER WITH LOGO - UPDATED WITH BLOG LINK */}
      <footer className="py-12 px-4 md:px-6 border-t border-border bg-background">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <img 
                src="/logo.png" 
                alt="EWA Logistics" 
                className="h-10 w-auto object-contain"
              />
              <span className="font-bold text-lg">EWA Logistics</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">Premium logistics and construction materials marketplace. Secure. Transparent. Reliable.</p>
            <p className="text-xs text-muted-foreground">RC: 9608218</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/materials" className="hover:text-orange-500 transition-colors">Order Materials</Link></li>
              <li><Link href="/signup" className="hover:text-orange-500 transition-colors">Driver Portal</Link></li>
              <li><Link href="/signup" className="hover:text-orange-500 transition-colors">Supplier Portal</Link></li>
              <li><Link href="/dashboard/tracking" className="hover:text-orange-500 transition-colors">Live Tracking</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-orange-500 transition-colors">About Us</Link></li>
              <li><Link href="/delivery-code" className="hover:text-orange-500 transition-colors">How Delivery Works</Link></li>
              <li><Link href="/careers" className="hover:text-orange-500 transition-colors">Careers</Link></li>
              <li><Link href="/press" className="hover:text-orange-500 transition-colors">Press & Media</Link></li>
              <li><Link href="/blog" className="hover:text-orange-500 transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-orange-500 transition-colors flex items-center gap-2">
                <FileText className="w-3 h-3" /> Privacy Policy
              </Link></li>
              <li><Link href="/terms" className="hover:text-orange-500 transition-colors flex items-center gap-2">
                <FileText className="w-3 h-3" /> Terms of Service
              </Link></li>
              <li><Link href="/escrow-policy" className="hover:text-orange-500 transition-colors flex items-center gap-2">
                <Shield className="w-3 h-3" /> Escrow Policy
              </Link></li>
              <li><Link href="/refund-policy" className="hover:text-orange-500 transition-colors flex items-center gap-2">
                <FileText className="w-3 h-3" /> Refund Policy
              </Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p className="mb-2">© {new Date().getFullYear()} EWA Logistics Limited. All rights reserved.</p>
          <p className="text-xs">Babangida Market FHA Lugbe, Abuja, Nigeria | RC: 9608218</p>
        </div>
      </footer>
    </div>
  );
}