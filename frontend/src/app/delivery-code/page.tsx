"use client";

import { motion } from "framer-motion";
import { 
  Package, Truck, CheckCircle, Key, MapPin, Clock, 
  Shield, Eye, AlertTriangle, ArrowRight, Phone, Mail,
  Smartphone, FileCheck, Award, Lock, Users
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";

export default function DeliveryCodePage() {
  const steps = [
    {
      number: 1,
      title: "Order Created",
      icon: Package,
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      description: "When you place an order, EWA automatically generates a unique 6-digit delivery code (e.g., EWA-847291). This code is visible only to you in your dashboard.",
      details: [
        "Unique code generated for each order",
        "Code is private and secure",
        "Available in your order dashboard",
        "Valid until delivery is completed"
      ]
    },
    {
      number: 2,
      title: "Truck Arrives",
      icon: Truck,
      color: "from-purple-500 to-pink-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      description: "When the driver arrives at your location, GPS tracking confirms the destination has been reached. The order status changes to 'Awaiting Customer Confirmation'.",
      details: [
        "GPS confirms destination reached",
        "Status updates automatically",
        "You receive a notification",
        "Driver waits for your inspection"
      ]
    },
    {
      number: 3,
      title: "Inspect Materials",
      icon: Eye,
      color: "from-orange-500 to-red-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      description: "Before sharing the code, thoroughly inspect the delivered materials. Check the quantity, size, and condition to ensure everything matches your order.",
      details: [
        "Verify quantity delivered",
        "Check material size and quality",
        "Inspect delivery condition",
        "Confirm matches your order"
      ]
    },
    {
      number: 4,
      title: "Share the Code",
      icon: Key,
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      description: "Once satisfied, share your unique delivery code with the driver. The driver enters it into the EWA platform to confirm successful delivery.",
      details: [
        "Tell driver your 6-digit code",
        "Driver enters code in EWA app",
        "Code validates the delivery",
        "Only share after inspection"
      ]
    },
    {
      number: 5,
      title: "Delivery Completed",
      icon: CheckCircle,
      color: "from-green-500 to-teal-500",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      description: "The system records everything: GPS location, timestamp, driver ID, and confirmation code. Your order is marked as complete and payment is released to the supplier.",
      details: [
        "GPS location recorded",
        "Delivery timestamp logged",
        "Driver ID verified",
        "Order marked as completed"
      ]
    }
  ];

  const faqs = [
    {
      q: "What if I don't receive my delivery code?",
      a: "Your delivery code is automatically generated when you place an order. You can find it in your dashboard under 'My Orders'. If you can't find it, contact our 24/7 support team."
    },
    {
      q: "Can I share the code before inspecting the materials?",
      a: "We strongly recommend inspecting the materials first. Once you share the code, the delivery is marked as complete and payment is released. If there are issues after sharing the code, contact support immediately."
    },
    {
      q: "What if the driver asks for the code before I'm ready?",
      a: "Never share the code until you've fully inspected the materials. The driver must wait for your confirmation. If a driver pressures you, report them through the app or contact support."
    },
    {
      q: "Can someone else receive the delivery for me?",
      a: "Yes, but you must share your code with the authorized person. Make sure they inspect the materials before sharing the code with the driver."
    },
    {
      q: "What happens if I lose my delivery code?",
      a: "You can always find your delivery code in your dashboard. If you have trouble accessing it, our support team can help verify your identity and provide the code."
    },
    {
      q: "Is the delivery code secure?",
      a: "Yes, each code is unique to your order and can only be used once. The code is encrypted and stored securely. Only you can see it until you share it with the driver."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Secure Delivery System
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              How the <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Delivery Code</span> Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A simple 5-step process that ensures secure, verified deliveries every time. 
              Your code is your confirmation - only share it when you're satisfied.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-500/20 rounded-xl flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Important Security Notice</h3>
                <p className="text-sm text-muted-foreground">
                  Your delivery code is like a digital signature. <strong className="text-orange-500">Never share it before inspecting the materials.</strong> Once shared, the delivery is marked complete and payment is released to the supplier. If you have any concerns, contact our 24/7 support team immediately.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">5 Simple Steps</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Follow these steps to ensure a smooth and secure delivery experience.
            </p>
          </motion.div>

          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className={`glass p-8 rounded-2xl border ${step.border} hover:border-opacity-60 transition-all`}>
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Step Number & Icon */}
                      <div className="flex-shrink-0">
                        <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                          <Icon className="w-10 h-10 text-white" />
                          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center">
                            <span className="text-sm font-bold">{step.number}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {step.description}
                        </p>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {step.details.map((detail, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <CheckCircle className={`w-4 h-4 flex-shrink-0`} style={{ color: 'rgb(249, 115, 22)' }} />
                              <span className="text-sm text-muted-foreground">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute left-10 top-full w-0.5 h-8 bg-gradient-to-b from-orange-500/50 to-transparent" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Use Delivery Codes?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our delivery code system protects everyone involved in the transaction.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Secure Verification",
                description: "Unique codes prevent fraud and ensure only authorized deliveries are completed."
              },
              {
                icon: Lock,
                title: "Payment Protection",
                description: "Funds are held in escrow until you confirm delivery with your code."
              },
              {
                icon: MapPin,
                title: "GPS Tracking",
                description: "Every delivery is tracked and verified with location data."
              },
              {
                icon: Clock,
                title: "Timestamp Records",
                description: "All deliveries are logged with exact time and date for your records."
              },
              {
                icon: Users,
                title: "Driver Verification",
                description: "Driver ID is recorded, ensuring accountability for every delivery."
              },
              {
                icon: Award,
                title: "Dispute Resolution",
                description: "Complete records help resolve any disputes quickly and fairly."
              }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass p-6 rounded-2xl border border-border hover:border-orange-500/30 transition-all group"
              >
                <div className="p-3 bg-orange-500/10 rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Everything you need to know about the delivery code system.
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.details
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl border border-border group"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/50 transition-colors rounded-xl list-none">
                  <span className="font-medium pr-4">{faq.q}</span>
                  <ArrowRight className="w-5 h-5 text-orange-500 flex-shrink-0 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass p-12 rounded-3xl border border-border"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience Secure Delivery?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust EWA Logistics for secure, 
              verified construction material deliveries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/materials"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-orange-500/20"
              >
                Order Materials <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/#contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border rounded-xl font-semibold hover:bg-muted transition-colors cursor-pointer"
              >
                Contact Support
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-12 px-6 bg-muted/30 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Need Help?</h3>
            <p className="text-muted-foreground">Our support team is available 24/7 to assist you.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Phone className="w-5 h-5 text-orange-500" />
              <p className="text-sm font-medium">+234 816 130 5942</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Mail className="w-5 h-5 text-orange-500" />
              <p className="text-sm font-medium">support@ewalogistics.com</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              <p className="text-sm font-medium">Babangida Market FHA Lugbe, Abuja</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} EWA Logistics Limited. All rights reserved.</p>
        <p className="mt-2">RC: 9608218 | Babangida Market FHA Lugbe, Abuja, Nigeria</p>
      </footer>
    </div>
  );
}