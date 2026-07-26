"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Loader2, CheckCircle } from "lucide-react";

interface DriverLocationShareProps {
  orderId: string;
  orderStatus: string;
}

export default function DriverLocationShare({ orderId, orderStatus }: DriverLocationShareProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  // Only allow sharing if the order is actively being delivered
  const canShare = ["loading", "in_transit"].includes(orderStatus);

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
          
          // Update Supabase
          supabase
            .from("orders")
            .update({ 
              driver_lat: latitude, 
              driver_lng: longitude,
              updated_at: new Date().toISOString() 
            })
            .eq("id", orderId)
            .then(({ error }) => {
              if (error) console.error("Location update failed:", error);
            });
        },
        (err) => {
          setError(err.message);
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
    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <MapPin className={`w-5 h-5 ${isSharing ? "text-blue-500 animate-pulse" : "text-slate-400"}`} />
        <div>
          <p className="text-sm font-semibold text-white">Live GPS Tracking</p>
          <p className="text-xs text-slate-400">
            {isSharing ? "Sharing location with customer..." : "Start sharing to update the map"}
          </p>
        </div>
      </div>
      
      <button
        onClick={() => setIsSharing(!isSharing)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
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
      
      {error && <p className="text-xs text-red-400 mt-2 w-full">{error}</p>}
    </div>
  );
}