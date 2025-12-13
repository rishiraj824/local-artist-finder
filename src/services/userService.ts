import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, UserPreferences } from '../types';

class UserService {
  private readonly USERS_COLLECTION = 'users';

  // Create or update user profile
  async createOrUpdateUser(
    userId: string,
    data: {
      email: string;
      displayName?: string;
      photoURL?: string;
      provider: 'google' | 'spotify';
      spotifyAccessToken?: string;
      spotifyRefreshToken?: string;
    }
  ): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create new user
        await setDoc(userRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          preferences: {
            exploredGenres: [],
            savedEvents: [],
            favoriteArtists: [],
          },
        });
      } else {
        // Update existing user
        await updateDoc(userRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  }

  // Get user profile
  async getUser(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      const data = userDoc.data();
      return {
        id: userDoc.id,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        provider: data.provider,
        spotifyAccessToken: data.spotifyAccessToken,
        spotifyRefreshToken: data.spotifyRefreshToken,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
        preferences: data.preferences || {
          exploredGenres: [],
          savedEvents: [],
          favoriteArtists: [],
        },
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  // Add explored genre
  async addExploredGenre(userId: string, genre: string): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        'preferences.exploredGenres': arrayUnion(genre),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding explored genre:', error);
      throw error;
    }
  }

  // Add saved event
  async addSavedEvent(userId: string, eventId: string): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        'preferences.savedEvents': arrayUnion(eventId),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding saved event:', error);
      throw error;
    }
  }

  // Remove saved event
  async removeSavedEvent(userId: string, eventId: string): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const savedEvents = userData.preferences?.savedEvents || [];
        const updatedEvents = savedEvents.filter((id: string) => id !== eventId);

        await updateDoc(userRef, {
          'preferences.savedEvents': updatedEvents,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error removing saved event:', error);
      throw error;
    }
  }

  // Add favorite artist
  async addFavoriteArtist(userId: string, artistId: string): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      await updateDoc(userRef, {
        'preferences.favoriteArtists': arrayUnion(artistId),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding favorite artist:', error);
      throw error;
    }
  }

  // Get user preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const user = await this.getUser(userId);
      return user?.preferences || null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  // Update Spotify tokens
  async updateSpotifyTokens(
    userId: string,
    accessToken: string,
    refreshToken?: string
  ): Promise<void> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const updateData: any = {
        spotifyAccessToken: accessToken,
        updatedAt: serverTimestamp(),
      };

      if (refreshToken) {
        updateData.spotifyRefreshToken = refreshToken;
      }

      await updateDoc(userRef, updateData);
    } catch (error) {
      console.error('Error updating Spotify tokens:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
