"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MapPin, Navigation, CheckCircle, AlertTriangle, Loader2, MessageCircle, Copy, Check } from "lucide-react";
import { getTrackingSessionDetails, updateExternalDriverLocation } from "@/app/actions/tracking";
import { useToast } from "@/components/providers/toast-provider";

export default function DriverTrackingPage() {
  const params = useParams();
  const token = params.token as string;
  const { addToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState(""); // For invalid/expired links
  const [locationError, setLocationError] = useState(""); // For browser blocking GPS
  const [isSharing, setIsSharing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
  }, [token]);

  // Helper to get location safely
  const getLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
      });
    });
  };

  // 1. Native EWA Map Sharing (Continuous)
  const startSharing = async () => {
    setIsProcessing(true);
    setLocationError(""); // Clear previous location errors
    
    try {
      const position = await getLocation();
      const { latitude, longitude } = position.coords;
      
      const result = await updateExternalDriverLocation(token, latitude, longitude);
      
      if (result.success) {
        setIsSharing(true);
        setLastUpdate(new Date().toLocaleTimeString());
        addToast({ type: "success", title: "Location Shared!", message: "Keeping your location updated..." });
        
        // Start watching for continuous updates
        navigator.geolocation.watchPosition(
          async (pos) => {
            await updateExternalDriverLocation(token, pos.coords.latitude, pos.coords.longitude);
            setLastUpdate(new Date().toLocaleTimeString());
          },
          (err) => console.error("Watch error:", err),
          { enableHighAccuracy: true }
        );
      } else {
        setLocationError(result.error || "Failed to update location.");
      }
    } catch (err: any) {
      if (err.code === 1) {
        setLocationError("Your browser blocked location access. Please use WhatsApp instead.");
      } else if (err.code === 2) {
        setLocationError("GPS is unavailable. Please turn on your phone's location.");
      } else {
        setLocationError("Location request timed out. Please use WhatsApp instead.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Smart WhatsApp Share (Fixed Encoding)
  const handleWhatsAppShare = async () => {
    setIsProcessing(true);
    
    const shortId = order?.id ? order.id.slice(0, 8).toUpperCase() : "N/A";
    const destination = order?.delivery_location || "N/A";
    const material = order?.material_type || "N/A";
    const quantity = order?.tonnage ? `${order.tonnage} ${order.unit || 'tons'}` : "N/A";

    let mapsLink = "";

    try {
      const position = await getLocation();
      const { latitude, longitude } = position.coords;
      mapsLink = `\n\n📍 *My Live Location:*\nhttps://maps.google.com/?q=${latitude},${longitude}`;
    } catch (err) {
      mapsLink = `\n\n_(I will share my live location shortly)_`;
    }

    const messageText = `🚚 *EWA Logistics - Live Delivery Update*
--------------------------------
📦 *Order:* #${shortId}
🧱 *Material:* ${material}
⚖️ *Quantity:* ${quantity}
📍 *Destination:* ${destination}

I am your assigned EWA driver. Here is my current status:${mapsLink}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(messageText)}`;
    window.open(whatsappUrl, '_blank');
    setIsProcessing(false);
  };

  // 3. Copy Branded Update
  const copyBrandedUpdate = async () => {
    setIsProcessing(true);
    const shortId = order?.id ? order.id.slice(0, 8).toUpperCase() : "N/A";
    const destination = order?.delivery_location || "N/A";
    const material = order?.material_type || "N/A";
    const quantity = order?.tonnage ? `${order.tonnage} ${order.unit || 'tons'}` : "N/A";
    const currentUrl = window.location.href;

    let mapsSection = "";
    
    try {
      const position = await getLocation();
      const { latitude, longitude } = position.coords;
      mapsSection = `\n\n📍 My exact location on Google Maps:\nhttps://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    } catch (err) {
      mapsSection = "\n\n(I will share my live location shortly.)";
    }

    const textToCopy = `🚚 EWA Logistics - Live Delivery Update
--------------------------------
📦 Order: #${shortId}
🧱 Material: ${material}
️ Quantity: ${quantity}
📍 Destination: ${destination}

I am your assigned EWA driver.${mapsSection}

Track my delivery status here:
${currentUrl}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      addToast({ type: "success", title: "Copied!", message: "Message copied to clipboard!" });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      addToast({ type: "error", title: "Error", message: "Failed to copy text." });
    } finally {
      setIsProcessing(false);
    }
  };

  // Show full page error ONLY if the tracking link itself is invalid/expired
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Link Invalid</h2>
        <p className="text-slate-600 max-w-sm mb-6">{error}</p>
        <p className="text-sm text-slate-500">Please contact the supplier or admin for a new tracking link.</p>
      </div>
    );
  }

  if (isLoading || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-600 font-medium text-lg">Verifying tracking link...</p>
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
              <span className="font-semibold text-slate-900 text-right">{order.material_type}</span>
            </div>
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">Quantity</span>
              <span className="font-semibold text-slate-900 text-right">{order.tonnage} {order.unit || 'tons'}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-slate-500">Destination</span>
              <span className="font-semibold text-slate-900 text-right max-w-[60%]">{order.delivery_location}</span>
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {!isSharing ? (
            <div className="text-center">
              
              {/* ✅ INSTANT WHATSAPP FALLBACK IF BROWSER BLOCKS GPS */}
              {locationError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-left animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-800 mb-1">Location Access Denied</p>
                      <p className="text-xs text-red-600">{locationError}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleWhatsAppShare}
                    disabled={isProcessing}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-5 h-5" />} 
                    Share via WhatsApp Now
                  </button>
                  <button
                    onClick={startSharing}
                    className="mt-2 w-full text-xs text-blue-600 font-medium hover:underline py-1"
                  >
                    Try EWA Map Again
                  </button>
                </div>
              )}

              <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                Choose how you want to update the customer.
              </p>
              
              {/* PRIMARY: Native EWA Map Sharing */}
              <button
                onClick={startSharing}
                disabled={isProcessing}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 border-2 border-blue-700 mb-4 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Navigation className="w-6 h-6" />} 
                {isProcessing ? "Getting Location..." : "Share via EWA Map (Best)"}
              </button>
              
              {/* Divider */}
              <div className="relative flex py-2 items-center mb-4">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium">OR USE BRANDED FALLBACK</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* FALLBACK 1: WhatsApp */}
              <button
                onClick={handleWhatsAppShare}
                disabled={isProcessing}
                className="w-full py-3.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 mb-3 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />} 
                {isProcessing ? "Preparing..." : "Share via WhatsApp (With Maps Link)"}
              </button>

              {/* FALLBACK 2: Copy Link */}
              <button
                onClick={copyBrandedUpdate}
                disabled={isProcessing}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 active:bg-black text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />} 
                {copied ? "Copied!" : "Copy Branded Update"}
              </button>
              
              <p className="text-xs text-slate-400 mt-4">
                🔒 Your location is only shared for this delivery
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-700 mb-2">Sharing Active!</h3>
              <p className="text-slate-600 text-sm mb-2">The customer can see your live location on the EWA map.</p>
              {lastUpdate && (
                <p className="text-xs text-slate-400 mb-6">Last updated: {lastUpdate}</p>
              )}
              <p className="text-sm text-blue-600 font-medium">
                💡 Keep this page open while driving.
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