import OneSignal from 'react-onesignal';

export const initializeOneSignal = async () => {
  if (typeof window !== 'undefined') {
    try {
      await OneSignal.init({
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
  if (typeof window !== 'undefined') {
    try {
      // This is the magic line that links the browser to the Supabase User ID
      await OneSignal.login(userId); 
      console.log('✅ OneSignal user ID set:', userId);
    } catch (error) {
      console.error('❌ Failed to set OneSignal user ID:', error);
    }
  }
};