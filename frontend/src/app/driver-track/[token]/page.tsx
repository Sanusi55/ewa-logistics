"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { MapPin, Navigation, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { getTrackingSessionDetails, updateExternalDriverLocation } from "@/app/actions/tracking";
import { useToast } from "@/components/providers/toast-provider";

export default function DriverTrackingPage() {
  const params = useParams();
  const token = params.token as string;
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    async function validateLink() {
      try {
        const result = await getTrackingSessionDetails(token);
        if (result.error) {
          setError(result.error);
        } else {
          setOrder(result.order);
        }
      } catch (err) {
        setError("Failed to load tracking session");
      }
      setIsLoading(false);
    }
    validateLink();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [token]);

  const startSharing = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser. Please use a modern smartphone browser.");
      return;
    }

    setIsSharing(true);
    setError("");

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        const result = await updateExternalDriverLocation(token, latitude, longitude);
        
        if (result.success) {
          setLastUpdate(new Date().toLocaleTimeString());
          addToast({ type: "success", title: "Location Updated", message: "Your location is being shared" });
        } else {
          setError(result.error || "Failed to update location.");
          stopSharing();
        }
      },
      (err) => {
        let msg = "Unable to get your location.";
        if (err.code === 1) msg = "Location permission denied. Please allow location access in your browser settings.";
        if (err.code === 2) msg = "Location unavailable. Ensure GPS is turned on.";
        if (err.code === 3) msg = "Location request timed out. Please try again.";
        
        setError(msg);
        stopSharing();
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const stopSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsSharing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-600 font-medium">Verifying tracking link...</p>
      </div>
    );
  }

  if (error && !isSharing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Link Invalid</h2>
        <p className="text-slate-600 max-w-sm">{error}</p>
        <p className="text-sm text-slate-500 mt-4">Please contact the supplier or admin for a new tracking link.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
        <div className="max-w-md mx-auto text-center">
          <Navigation className="w-10 h-10 mx-auto mb-3 opacity-90" />
          <h1 className="text-2xl font-bold mb-1">EWA Logistics</h1>
          <p className="text-blue-100 text-sm">External Driver Tracking</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-md mx-auto w-full p-6 -mt-4 space-y-6">
        {/* Delivery Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" /> Delivery Details
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">Material</span>
              <span className="font-semibold text-slate-900 text-right">{order?.material_type}</span>
            </div>
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">Quantity</span>
              <span className="font-semibold text-slate-900 text-right">{order?.tonnage} {order?.unit || 'tons'}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-slate-500">Destination</span>
              <span className="font-semibold text-slate-900 text-right max-w-[60%]">{order?.delivery_location}</span>
            </div>
          </div>
        </div>

        {/* Action Card - WITH VISIBLE BUTTON */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {!isSharing ? (
            <div className="text-center">
              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                Tap the button below to start sharing your live GPS location with the customer. Keep this page open while driving.
              </p>
              
              {/* BIG VISIBLE BUTTON */}
              <button
                onClick={startSharing}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 border-2 border-blue-700"
                style={{ minHeight: '60px' }}
              >
                <Navigation className="w-6 h-6" /> 
                Start Sharing Location
              </button>
              
              <p className="text-xs text-slate-400 mt-4">
                🔒 Your location is only shared with the customer for this delivery
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-700 mb-2">Location Sharing Active</h3>
              <p className="text-slate-600 text-sm mb-2">Your live location is being sent to the customer.</p>
              {lastUpdate && (
                <p className="text-xs text-slate-400 mb-6">Last updated: {lastUpdate}</p>
              )}
              
              <button
                onClick={stopSharing}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 border-2 border-slate-300"
              >
                Stop Sharing
              </button>
            </div>
          )}

          {error && isSharing && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-sm text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400">
          Powered by EWA Logistics • Secure & Encrypted
        </p>
      </div>
    </div>
  );
}