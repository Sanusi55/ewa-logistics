"use client";

import { motion } from "framer-motion";
import { Truck, Package, ShieldCheck, MapPin, CreditCard, Clock, Users, Zap, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";

export default function ServicesPage() {
  const services = [
    {
      icon: Package,
      title: "Material Sourcing",
      desc: "Access verified suppliers of granite, sand, stone base, and more. Compare prices, quality ratings, and delivery times in one place.",
      features: ["Verified supplier network", "Quality guarantees", "Competitive bidding", "Bulk order discounts"],
      color: "from-blue-500 to-blue-700"
    },
    {
      icon: Truck,
      title: "Logistics & Delivery",
      desc: "Our fleet of verified drivers ensures your materials arrive on time, every time. Real-time tracking from pickup to drop-off.",
      features: ["GPS live tracking", "Flexible scheduling", "Insurance coverage", "Proof of delivery"],
      color: "from-purple-500 to-purple-700"
    },
    {
      icon: ShieldCheck,
      title: "Escrow Payment Protection",
      desc: "Your funds are held securely until you confirm delivery. No risk, no stress—just secure transactions every time.",
      features: ["Bank-grade security", "Dispute resolution", "Automatic refunds", "CBN-regulated accounts"],
      color: "from-green-500 to-green-700"
    },
    {
      icon: MapPin,
      title: "Real-Time Tracking",
      desc: "Watch your delivery move on the map with live ETAs, route optimization, and instant notifications.",
      features: ["Live GPS updates", "ETA predictions", "Route optimization", "Push notifications"],
      color: "from-orange-500 to-orange-700"
    },
    {
      icon: CreditCard,
      title: "Flexible Payment Options",
      desc: "Pay via bank transfer, card, or mobile money. Split payments for large orders. Transparent pricing with no hidden fees.",
      features: ["Multiple payment methods", "Split payments", "Invoice generation", "Receipt automation"],
      color: "from-pink-500 to-pink-700"
    },
    {
      icon: Users,
      title: "Dedicated Support",
      desc: "24/7 customer support via chat, phone, or WhatsApp. Our team is always ready to help with orders, tracking, or issues.",
      features: ["24/7 availability", "Multi-channel support", "Dedicated account managers", "Priority response"],
      color: "from-cyan-500 to-cyan-700"
    },
  ];

  const stats = [
    { label: "Active Deliveries", value: "1,250+", icon: Truck },
    { label: "Verified Partners", value: "340+", icon: Users },
    { label: "Secure Transactions", value: "98%", icon: ShieldCheck },
    { label: "Avg. Delivery Time", value: "<24h", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Hero Section */}
      <main className="pt-24 md:pt-32 px-6 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6 border border-blue-200 dark:border-blue-800">
              <Zap className="w-4 h-4" /> Premium Logistics Services
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              End-to-End Logistics <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Solutions for Construction
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              From material sourcing to final delivery, EWA Logistics provides secure, transparent, and efficient services for Nigeria's construction industry.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/materials" className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer">
                Browse Materials <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/auth/register" className="inline-flex items-center gap-2 px-8 py-4 border border-border text-foreground font-semibold rounded-full hover:bg-muted transition-all cursor-pointer">
                Become a Partner
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-20"
        >
          {stats.map((stat, i) => (
            <div key={i} className="glass p-6 rounded-2xl text-center border border-border">
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Services Grid */}
        <div className="max-w-7xl mx-auto mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive logistics solutions designed for the unique needs of Nigeria's construction sector.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 border border-border hover:shadow-lg transition-all group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform`}>
                  <service.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-4">{service.desc}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/login" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section - FIXED LINK */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mt-24 glass rounded-2xl p-8 md:p-12 text-center border border-border"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Streamline Your Logistics?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of contractors, suppliers, and drivers who trust EWA Logistics for secure, efficient material delivery.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity cursor-pointer">
              Get Started Free
            </Link>
            {/* ✅ FIXED: Link to homepage contact section instead of /contact */}
            <a href="/#contact" className="px-8 py-4 border border-border font-semibold rounded-full hover:bg-muted transition-colors cursor-pointer">
              Contact Sales
            </a>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border bg-muted/30">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} EWA Logistics. All rights reserved.
        </div>
      </footer>
    </div>
  );
}