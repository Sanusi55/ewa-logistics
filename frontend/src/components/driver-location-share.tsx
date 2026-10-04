"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MapPin, CheckCircle } from "lucide-react";

interface DriverLocationShareProps {
  orderId: string;
  orderStatus: string;
}

export default function DriverLocationShare({ orderId, orderStatus }: DriverLocationShareProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  // ✅ UPDATED: Added 'driver_assigned' to the list
  const canShare = ["driver_assigned", "supplier_driver_assigned", "loading", "in_transit", "pending_delivery_payment"].includes(orderStatus);

  useEffect(() => {
    let watchId: number;

    if (isSharing && canShare) {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        setIsSharing(false);
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // ✅ UPDATED: Now includes last_location_update for "Stopped" detection
          supabase
            .from("orders")
            .update({ 
              driver_lat: latitude, 
              driver_lng: longitude,
              last_location_update: new Date().toISOString() // ✅ CRITICAL for distance/time calculation
            })
            .eq("id", orderId)
            .then(({ error }) => {
              if (error) console.error("Location update failed:", error);
            });
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Unable to get location. Please enable GPS.");
          setIsSharing(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isSharing, orderId, canShare, supabase]);

  if (!canShare) return null;

  return (
    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <MapPin className={`w-5 h-5 ${isSharing ? "text-blue-500 animate-pulse" : "text-slate-400"}`} />
        <div>
          <p className="text-sm font-semibold text-white">Live GPS Tracking</p>
          <p className="text-xs text-slate-400">
            {isSharing ? "Sharing location with customer..." : "Tap to start sharing location"}
          </p>
        </div>
      </div>
      
      <button
        onClick={() => setIsSharing(!isSharing)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto ${
          isSharing 
            ? "bg-red-500 text-white hover:bg-red-600" 
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        {isSharing ? (
          <><CheckCircle className="w-4 h-4" /> Stop Sharing</>
        ) : (
          <><MapPin className="w-4 h-4" /> Start Sharing</>
        )}
      </button>
      
      {error && <p className="text-xs text-red-400 w-full text-center sm:text-left">{error}</p>}
    </div>
  );
}