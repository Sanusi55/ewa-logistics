"use client";

import { useEffect } from "react";
import { initializeOneSignal, setOneSignalUserId } from "@/lib/onesignal";
import { createClient } from "@/lib/supabase/client";

export default function OneSignalInit() {
  useEffect(() => {
    // 1. Initialize OneSignal SDK
    initializeOneSignal();

    const supabase = createClient();

    // 2. Check if user is already logged in when the app loads
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setOneSignalUserId(user.id);
      }
    });

    // 3. Listen for real-time login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        console.log("✅ User signed in, linking to OneSignal:", session.user.id);
        setOneSignalUserId(session.user.id);
      } else if (event === "SIGNED_OUT") {
        console.log("🚪 User signed out");
        // Optional: You can also call OneSignal.logout() here if needed
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null; // This component doesn't render anything visually
}