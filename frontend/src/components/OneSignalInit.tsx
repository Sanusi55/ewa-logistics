"use client";

import { useEffect } from "react";
import { initializeOneSignal, setOneSignalUserId } from "@/lib/onesignal";
import { createClient } from "@/lib/supabase/client";

export default function OneSignalInit() {
  useEffect(() => {
    const supabase = createClient();

    const setupOneSignal = async () => {
      console.log('🔄 Starting OneSignal setup...');
      
      // 1. Load the official OneSignal SDK script
      const script = document.createElement("script");
      script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ OneSignal script loaded');
        initializeOneSignal();
      };
      document.head.appendChild(script);

      // 2. Function to link the user ID
      const linkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log('👤 Found logged in user:', user.id);
          setOneSignalUserId(user.id);
        } else {
          console.log('⏳ No user logged in yet, waiting for auth state change...');
        }
      };

      // 3. Check immediately on page load
      linkUser();

      // 4. Listen for the exact moment the user clicks "Login"
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔔 Auth state changed:', event);
        
        if (event === "SIGNED_IN" && session?.user) {
          console.log('👤 User signed in event fired:', session.user.id);
          setOneSignalUserId(session.user.id);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    setupOneSignal();
  }, []);

  return null;
}