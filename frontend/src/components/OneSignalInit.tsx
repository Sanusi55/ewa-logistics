"use client";

import { useEffect } from "react";
import { initializeOneSignal, setOneSignalUserId } from "@/lib/onesignal";
import { createClient } from "@/lib/supabase/client";

export default function OneSignalInit() {
  useEffect(() => {
    // 1. Load the official OneSignal SDK script
    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ OneSignal script loaded');
      
      // 2. Initialize the SDK (this sets up the queue)
      initializeOneSignal();
      
      // 3. Check if user is already logged in and link them
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setOneSignalUserId(user.id);
        }
      });

      // 4. Listen for future login/logout events
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setOneSignalUserId(session.user.id);
        }
      });
    };

    document.head.appendChild(script);
  }, []);

  return null;
}