// Tell TypeScript about the official OneSignal v16 global variables
declare global {
  interface Window {
    OneSignalDeferred: any[];
    OneSignal: any;
  }
}

let isOneSignalReady = false;
let pendingUserId: string | null = null;

export const initializeOneSignal = () => {
  if (typeof window !== 'undefined') {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    
    window.OneSignalDeferred.push(function(OneSignal: any) {
      OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
        allowLocalhostAsSecureOrigin: true, // Allows testing on localhost
      })
        .then(() => {
          console.log('✅ OneSignal initialized successfully');
          isOneSignalReady = true;
          
          // If a user ID was provided before init finished, process it now
          if (pendingUserId) {
            processLogin(OneSignal, pendingUserId);
            pendingUserId = null;
          }
        })
        .catch((err: any) => {
          console.error('❌ OneSignal initialization error:', err);
        });
    });
  }
};

const processLogin = (OneSignal: any, userId: string) => {
  OneSignal.login(userId)
    .then(() => {
      console.log('✅ OneSignal user ID set:', userId);
      return OneSignal.Notifications.requestPermission(true);
    })
    .then((permissionGranted: boolean) => {
      if (permissionGranted) {
        console.log('✅ User subscribed to push notifications!');
      } else {
        console.log('⚠️ User declined notification permission');
      }
    })
    .catch((err: any) => {
      console.error('❌ Failed to set OneSignal user ID or request permission:', err);
    });
};

export const setOneSignalUserId = (userId: string) => {
  if (typeof window !== 'undefined') {
    if (isOneSignalReady && window.OneSignal) {
      // SDK is already fully initialized, we can call it directly
      processLogin(window.OneSignal, userId);
    } else {
      // SDK is still initializing, save the ID to be processed when init finishes
      pendingUserId = userId;
      
      // Also push to the queue as a fallback
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(function(OneSignal: any) {
        if (pendingUserId === userId) {
          processLogin(OneSignal, userId);
          pendingUserId = null;
        }
      });
    }
  }
};