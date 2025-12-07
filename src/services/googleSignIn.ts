import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';

// Configure Google Sign-In
// Get Web Client ID from Firebase Console -> Settings -> General -> Web app
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID || '', // From .env file
    offlineAccess: true,
    hostedDomain: '',
    forceCodeForRefreshToken: true,
  });
};

export const googleSignIn = async (): Promise<string> => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    // Return the ID token for Firebase authentication
    return userInfo.idToken || '';
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

export const googleSignOut = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Google Sign-Out error:', error);
  }
};
