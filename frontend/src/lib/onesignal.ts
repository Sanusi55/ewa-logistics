// Tell TypeScript about the global OneSignal object
declare global {
  interface Window {
    OneSignal: any;
  }
}

export const initializeOneSignal = async () => {
  if (typeof window !== 'undefined' && window.OneSignal) {
    try {
      await window.OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
        allowLocalhostAsSecureOrigin: true, // Allows testing on localhost
      });
      console.log('✅ OneSignal initialized');
    } catch (error) {
      console.error('❌ OneSignal initialization error:', error);
    }
  }
};

export const setOneSignalUserId = async (userId: string) => {
  if (typeof window !== 'undefined' && window.OneSignal) {
    try {
      // This is the official way to link a user ID
      await window.OneSignal.login(userId); 
      console.log('✅ OneSignal user ID set:', userId);
    } catch (error) {
      console.error('❌ Failed to set OneSignal user ID:', error);
    }
  }
};