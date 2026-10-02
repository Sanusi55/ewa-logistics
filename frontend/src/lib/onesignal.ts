// Tell TypeScript about the official OneSignal v16 global variables
declare global {
  interface Window {
    OneSignalDeferred: any[];
    OneSignal: any;
  }
}

export const initializeOneSignal = () => {
  if (typeof window !== 'undefined') {
    // 1. Initialize the official deferred queue
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    
    // 2. Push the init command to the queue
    window.OneSignalDeferred.push(function(OneSignal: any) {
      OneSignal.init({
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
  if (typeof window !== 'undefined' && window.OneSignalDeferred) {
    // 3. Push the login command to the queue so it waits for init to finish
    window.OneSignalDeferred.push(function(OneSignal: any) {
      OneSignal.login(userId)
        .then(() => {
          console.log('✅ OneSignal user ID set:', userId);
        })
        .catch((err: any) => {
          console.error('❌ Failed to set OneSignal user ID:', err);
        });
    });
  }
};