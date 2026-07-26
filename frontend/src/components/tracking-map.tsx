"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { createClient } from "@/lib/supabase/client";
import "leaflet/dist/leaflet.css";

// ✅ FIX: Leaflet default marker icon issue in Next.js
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

// ✅ PREMIUM: Custom Truck Icon for the Driver
const truckIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/713/713311.png", // Free truck icon
  iconRetinaUrl: "https://cdn-icons-png.flaticon.com/512/713/713311.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

interface TrackingMapProps {
  orderId: string;
  deliveryLat?: number; // Customer delivery location
  deliveryLng?: number;
}

export default function TrackingMap({ orderId, deliveryLat, deliveryLng }: TrackingMapProps) {
  const supabase = createClient();
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch initial location
    const fetchInitialLocation = async () => {
      const { data } = await supabase
        .from("orders")
        .select("driver_lat, driver_lng")
        .eq("id", orderId)
        .single();

      if (data?.driver_lat && data?.driver_lng) {
        setDriverLocation({ lat: data.driver_lat, lng: data.driver_lng });
      }
      setIsLoading(false);
    };

    fetchInitialLocation();

    // 2. Subscribe to Realtime updates
    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newLat = payload.new.driver_lat;
          const newLng = payload.new.driver_lng;
          if (newLat && newLng) {
            setDriverLocation({ lat: newLat, lng: newLng });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, supabase]);

  if (isLoading) {
    return (
      <div className="h-[400px] bg-slate-800/50 rounded-xl border border-slate-700 flex items-center justify-center text-slate-400">
        Loading Live Map...
      </div>
    );
  }

  // Default center (Nigeria) if no location is available yet
  const center: [number, number] = driverLocation 
    ? [driverLocation.lat, driverLocation.lng] 
    : deliveryLat && deliveryLng 
    ? [deliveryLat, deliveryLng] 
    : [9.0820, 8.6753]; // Default to Abuja, Nigeria

  const zoom = driverLocation || (deliveryLat && deliveryLng) ? 14 : 6;

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 h-[400px] w-full z-0 relative">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: "100%", width: "100%" }} 
        scrollWheelZoom={false} // ✅ Prevents map from hijacking page scroll
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* ✅ Driver Marker with Custom Truck Icon */}
        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={truckIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-bold text-orange-500">🚚 Driver Location</p>
                <p className="text-xs text-slate-500">Live GPS Tracking Active</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ✅ Delivery Destination Marker */}
        {deliveryLat && deliveryLng && (
          <Marker position={[deliveryLat, deliveryLng]}>
            <Popup>
              <div className="text-center">
                <p className="font-bold text-green-600">📍 Delivery Destination</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ✅ Dashed Line connecting Driver to Destination */}
        {driverLocation && deliveryLat && deliveryLng && (
          <Polyline 
            pathOptions={{ color: "#f97316", weight: 3, dashArray: "5, 5" }} 
            positions={[[driverLocation.lat, driverLocation.lng], [deliveryLat, deliveryLng]]} 
          />
        )}
      </MapContainer>
    </div>
  );
}