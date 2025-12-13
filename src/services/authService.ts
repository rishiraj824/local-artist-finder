import {
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import { makeRedirectUri } from 'expo-auth-session';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID || '165015050592-6k4etmo4kucruhfj9ih9i8sg24f0agnh.apps.googleusercontent.com',
  offlineAccess: true,
  scopes: ['profile', 'email'],
});

// Spotify OAuth Configuration
const SPOTIFY_CLIENT_ID = '68c5a42f94b44f4f9d70cbeb7f213dff';
const SPOTIFY_SCOPES = [
  'user-read-email',
  'user-read-private',
  'user-library-read',
  'user-top-read',
  'playlist-read-private',
];

// Enable web browser for OAuth
WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

class AuthService {
  private spotifyAuthRequest: AuthSession.AuthRequest | null = null;

  // Initialize Spotify Auth Request
  initSpotifyAuth() {
    const redirectUri = makeRedirectUri({
      scheme: 'localartistfinder',
      path: 'callback',
    });

    console.log('Spotify Redirect URI:', redirectUri);

    this.spotifyAuthRequest = new AuthSession.AuthRequest({
      clientId: SPOTIFY_CLIENT_ID,
      scopes: SPOTIFY_SCOPES,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
    });
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<FirebaseUser> {
    try {
      // Check if device supports Google Play Services (Android only)
      await GoogleSignin.hasPlayServices();

      // Get user info and ID token
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data?.idToken) {
        throw new Error('No ID token received from Google');
      }

      // Create Firebase credential with Google ID token
      const googleCredential = GoogleAuthProvider.credential(userInfo.data.idToken);

      // Sign in to Firebase with Google credential
      const userCredential = await signInWithCredential(auth, googleCredential);

      return userCredential.user;
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  }

  // Sign in with Spotify
  async signInWithSpotify(): Promise<{ accessToken: string; refreshToken?: string }> {
    try {
      if (!this.spotifyAuthRequest) {
        this.initSpotifyAuth();
      }

      const result = await this.spotifyAuthRequest!.promptAsync(discovery);

      if (result.type === 'success') {
        const { code } = result.params;

        if (!code) {
          throw new Error('No authorization code received from Spotify');
        }

        // Exchange authorization code for access token
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: SPOTIFY_CLIENT_ID,
            code,
            redirectUri: this.spotifyAuthRequest!.redirectUri,
            extraParams: {
              code_verifier: this.spotifyAuthRequest!.codeVerifier || '',
            },
          },
          discovery
        );

        if (!tokenResponse.accessToken) {
          throw new Error('No access token received from Spotify');
        }

        return {
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken,
        };
      } else if (result.type === 'error') {
        throw new Error(result.error?.message || 'Spotify authentication failed');
      } else {
        throw new Error('Spotify authentication was cancelled');
      }
    } catch (error: any) {
      console.error('Spotify Sign-In error:', error);
      throw new Error(error.message || 'Failed to sign in with Spotify');
    }
  }

  // Get current Firebase user
  getCurrentFirebaseUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      // Try to sign out from Google if available
      try {
        if (GoogleSignin.isSignedIn && typeof GoogleSignin.isSignedIn === 'function') {
          const isSignedIn = await GoogleSignin.isSignedIn();
          if (isSignedIn) {
            await GoogleSignin.signOut();
          }
        }
      } catch (googleError) {
        // Google Sign-In might not be available in Expo Go, continue anyway
        console.log('Google sign out not available:', googleError);
      }

      // Sign out from Firebase only if there's a Firebase user
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Don't throw error for sign out - just log it
      // This allows sign out to complete even if there are minor issues
    }
  }
}

export const authService = new AuthService();
