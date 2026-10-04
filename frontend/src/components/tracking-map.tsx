"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { createClient } from "@/lib/supabase/client";
import "leaflet/dist/leaflet.css";
import { AlertTriangle } from "lucide-react"; // ✅ Added for stopped warning

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
  iconUrl: "https://cdn-icons-png.flaticon.com/512/713/713311.png",
  iconRetinaUrl: "https://cdn-icons-png.flaticon.com/512/713/713311.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// ✅ Haversine formula to calculate distance between two coordinates in meters
const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // Radius of the earth in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

interface TrackingMapProps {
  orderId: string;
  deliveryLat?: number;
  deliveryLng?: number;
}

export default function TrackingMap({ orderId, deliveryLat, deliveryLng }: TrackingMapProps) {
  const supabase = createClient();
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number; lastUpdate: string } | null>(null);
  const [isStopped, setIsStopped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch initial location and timestamp
    const fetchInitialLocation = async () => {
      const { data } = await supabase
        .from("orders")
        .select("driver_lat, driver_lng, last_location_update")
        .eq("id", orderId)
        .single();

      if (data?.driver_lat && data?.driver_lng && data?.last_location_update) {
        setDriverLocation({ lat: data.driver_lat, lng: data.driver_lng, lastUpdate: data.last_location_update });
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
          const newUpdate = payload.new.last_location_update;

          if (newLat && newLng && newUpdate) {
            if (driverLocation) {
              // Calculate distance in meters
              const distance = getDistanceFromLatLonInMeters(
                driverLocation.lat,
                driverLocation.lng,
                newLat,
                newLng
              );
              
              // Calculate time difference in milliseconds
              const timeDiff = Date.now() - new Date(driverLocation.lastUpdate).getTime();
              
              // ✅ STOPPED DETECTION: Less than 50 meters moved AND over 3 minutes (180,000 ms) passed
              if (distance < 50 && timeDiff > 180000) {
                setIsStopped(true);
              } else if (distance >= 50) {
                setIsStopped(false); // Driver is moving again!
              }
            }
            setDriverLocation({ lat: newLat, lng: newLng, lastUpdate: newUpdate });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, supabase, driverLocation]);

  if (isLoading) {
    return (
      <div className="h-[400px] bg-slate-800/50 rounded-xl border border-slate-700 flex items-center justify-center text-slate-400">
        Loading Live Map...
      </div>
    );
  }

  const center: [number, number] = driverLocation 
    ? [driverLocation.lat, driverLocation.lng] 
    : deliveryLat && deliveryLng 
    ? [deliveryLat, deliveryLng] 
    : [9.0820, 8.6753]; // Default to Abuja, Nigeria

  const zoom = driverLocation || (deliveryLat && deliveryLng) ? 14 : 6;

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 h-[400px] w-full z-0 relative">
      
      {/* ✅ STOPPED WARNING BADGE */}
      {isStopped && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold animate-pulse">
          <AlertTriangle className="w-4 h-4" />
          Driver has been stationary for 3+ mins
        </div>
      )}

      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: "100%", width: "100%" }} 
        scrollWheelZoom={false}
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
                <p className={`font-bold ${isStopped ? "text-red-500" : "text-orange-500"}`}>
                  {isStopped ? "⚠️ Driver Stopped" : "🚚 Driver Location"}
                </p>
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
            pathOptions={{ color: isStopped ? "#ef4444" : "#f97316", weight: 3, dashArray: "5, 5" }} 
            positions={[[driverLocation.lat, driverLocation.lng], [deliveryLat, deliveryLng]]} 
          />
        )}
      </MapContainer>
    </div>
  );
}