// Tell TypeScript about the global OneSignal object
declare global {
  interface Window {
    OneSignal: any;
  }
}

export const initializeOneSignal = () => {
  if (typeof window !== 'undefined') {
    // Initialize the push queue
    window.OneSignal = window.OneSignal || [];
    
    window.OneSignal.push(function () {
      window.OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
        allowLocalhostAsSecureOrigin: true, // Allows testing on localhost
      })
        .then(() => {
          console.log('✅ OneSignal initialized successfully');
        })
        .catch((err: any) => {
          console.error('❌ OneSignal initialization error:', err);
        });
    });
  }
};

export const setOneSignalUserId = (userId: string) => {
  if (typeof window !== 'undefined' && window.OneSignal) {
    // Use the push queue to ensure the SDK is fully ready before logging in
    window.OneSignal.push(function () {
      window.OneSignal.login(userId)
        .then(() => {
          console.log('✅ OneSignal user ID set:', userId);
        })
        .catch((err: any) => {
          console.error('❌ Failed to set OneSignal user ID:', err);
        });
    });
  }
};