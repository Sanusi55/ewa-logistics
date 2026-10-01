"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function OneSignalProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Load the OneSignal SDK script
      const script = document.createElement("script");
      script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // @ts-ignore
        window.OneSignal = window.OneSignal || [];
        // @ts-ignore
        window.OneSignal.push(function () {
          // @ts-ignore
          window.OneSignal.init({
            appId: "14392f64-e298-42a8-9a2a-485a7074a3f7",
            allowLocalhostAsSecureOrigin: true, // Allows testing on localhost
            notifyButton: {
              enable: false, // We will prompt users naturally via the app
            },
          });
        });
      };
      document.head.appendChild(script);

      // 2. Sync Supabase User ID with OneSignal External User ID
      const supabase = createClient();
      
      const syncUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && typeof window !== "undefined" && (window as any).OneSignal) {
          // @ts-ignore
          (window as any).OneSignal.push(function () {
            // @ts-ignore
            (window as any).OneSignal.setExternalUserId(user.id);
          });
        }
      };
      
      syncUser();

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session?.user && typeof window !== "undefined" && (window as any).OneSignal) {
          // @ts-ignore
          (window as any).OneSignal.push(function () {
            // @ts-ignore
            (window as any).OneSignal.setExternalUserId(session.user.id);
          });
        } else if (event === "SIGNED_OUT" && typeof window !== "undefined" && (window as any).OneSignal) {
          // @ts-ignore
          (window as any).OneSignal.push(function () {
            // @ts-ignore
            (window as any).OneSignal.setExternalUserId(null);
          });
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  return <>{children}</>;
}