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
    
    script.onload = async () => {
      console.log('✅ OneSignal script loaded');
      
      // 2. Initialize the SDK
      await initializeOneSignal();
      
      // 3. Check if user is already logged in and link them
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await setOneSignalUserId(user.id);
      }

      // 4. Listen for future login/logout events
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setOneSignalUserId(session.user.id);
        }
      });
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
    };
  }, []);

  return null;
}