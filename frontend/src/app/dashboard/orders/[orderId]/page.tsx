"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { MapPin, Phone, MessageSquare, Star, CheckCircle2, Clock, Truck } from "lucide-react";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.orderId;

  const steps = [
    { title: "Order Placed", time: "May 28, 09:00 AM", done: true },
    { title: "Supplier Confirmed", time: "May 28, 09:45 AM", done: true },
    { title: "Driver Assigned", time: "May 28, 10:30 AM", done: true },
    { title: "In Transit", time: "Est. 2h 15m", done: false, active: true },
    { title: "Delivered", time: "Pending", done: false },
  ];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Order #{orderId}</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold animate-pulse">
            🚛 In Transit
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Timeline & Status */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass p-6 rounded-xl">
              <h3 className="font-semibold mb-4">Delivery Timeline</h3>
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                        step.done ? "bg-green-500 border-green-500 text-white" : 
                        step.active ? "border-blue-500 bg-white dark:bg-slate-900" : "border-muted text-muted"
                      }`}>
                        {step.done && <CheckCircle2 className="w-3 h-3" />}
                        {step.active && <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />}
                      </div>
                      {i < steps.length - 1 && <div className={`w-0.5 h-8 ${step.done ? "bg-green-500" : "bg-muted"}`} />}
                    </div>
                    <div className={`pb-6 ${!step.done && !step.active ? "opacity-50" : ""}`}>
                      <p className={`font-medium ${step.active ? "text-blue-500" : ""}`}>{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="glass p-6 rounded-xl h-64 relative overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <div className="absolute inset-0 grid-pattern opacity-30" />
              <div className="text-center z-10">
                <MapPin className="w-8 h-8 text-primary mx-auto mb-2 animate-bounce" />
                <p className="font-medium">Live GPS Tracking</p>
                <p className="text-sm text-muted-foreground">Mapbox / Google Maps integration coming next!</p>
              </div>
            </div>
          </div>

          {/* Right: Driver & Order Info */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-xl">
              <h3 className="font-semibold mb-4">Your Driver</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  E
                </div>
                <div>
                  <p className="font-bold">Emmanuel O.</p>
                  <div className="flex items-center gap-1 text-sm text-yellow-500">
                    <Star className="w-3 h-3 fill-yellow-500" /> 4.9 (124 trips)
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium cursor-pointer">
                  <Phone className="w-4 h-4" /> Call
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium cursor-pointer">
                  <MessageSquare className="w-4 h-4" /> Chat
                </button>
              </div>
            </div>

            <div className="glass p-6 rounded-xl">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Material</span>
                  <span className="font-medium">1-Inch Granite</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">5 Tons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">$120.00</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>$1,200.00</span>
                </div>
              </div>
              <button className="w-full mt-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium cursor-pointer">
                Report Issue
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}