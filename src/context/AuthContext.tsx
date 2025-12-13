import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { User } from '../types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithSpotify: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for Spotify user in AsyncStorage first
    const checkSpotifySession = async () => {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const spotifyUserStr = await AsyncStorage.getItem('spotifyUser');
        if (spotifyUserStr) {
          const spotifyUser = JSON.parse(spotifyUserStr);
          setUser(spotifyUser);
          setLoading(false);
          return true;
        }
      } catch (error) {
        console.error('Error checking Spotify session:', error);
      }
      return false;
    };

    // Subscribe to Firebase auth state changes
    const unsubscribe = authService.onAuthStateChange(async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          // Load user profile from Firestore
          const userProfile = await userService.getUser(fbUser.uid);
          setUser(userProfile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
        setLoading(false);
      } else {
        // Check for Spotify session if no Firebase user
        const hasSpotifySession = await checkSpotifySession();
        if (!hasSpotifySession) {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const fbUser = await authService.signInWithGoogle();

      // Create or update user profile in Firestore
      await userService.createOrUpdateUser(fbUser.uid, {
        email: fbUser.email || '',
        displayName: fbUser.displayName || undefined,
        photoURL: fbUser.photoURL || undefined,
        provider: 'google',
      });

      // Load user profile
      const userProfile = await userService.getUser(fbUser.uid);
      setUser(userProfile);
    } catch (error: any) {
      console.error('Sign in with Google error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithSpotify = async () => {
    try {
      setLoading(true);
      const { accessToken, refreshToken } = await authService.signInWithSpotify();

      // Get Spotify user profile
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Spotify user profile');
      }

      const spotifyProfile = await response.json();

      // For Spotify-only login, we need to use a different approach
      // since Firebase doesn't support Spotify auth directly
      // We'll create a custom user document
      const userId = `spotify_${spotifyProfile.id}`;

      await userService.createOrUpdateUser(userId, {
        email: spotifyProfile.email || '',
        displayName: spotifyProfile.display_name || undefined,
        photoURL: spotifyProfile.images?.[0]?.url || undefined,
        provider: 'spotify',
        spotifyAccessToken: accessToken,
        spotifyRefreshToken: refreshToken,
      });

      // Load user profile and store in AsyncStorage for persistence
      const userProfile = await userService.getUser(userId);
      setUser(userProfile);

      // Store Spotify session in AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('spotifyUser', JSON.stringify(userProfile));
    } catch (error: any) {
      console.error('Sign in with Spotify error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();

      // Clear Spotify session from AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem('spotifyUser');

      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if there's an error, clear local state
      setUser(null);
      setFirebaseUser(null);
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem('spotifyUser');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    firebaseUser,
    user,
    loading,
    signInWithGoogle,
    signInWithSpotify,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
