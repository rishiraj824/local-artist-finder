import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const addExploredGenre = useCallback(
    async (genre: string) => {
      if (!user) return;

      try {
        setLoading(true);
        await userService.addExploredGenre(user.id, genre);
      } catch (error) {
        console.error('Error adding explored genre:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const addSavedEvent = useCallback(
    async (eventId: string) => {
      if (!user) return;

      try {
        setLoading(true);
        await userService.addSavedEvent(user.id, eventId);
      } catch (error) {
        console.error('Error adding saved event:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const removeSavedEvent = useCallback(
    async (eventId: string) => {
      if (!user) return;

      try {
        setLoading(true);
        await userService.removeSavedEvent(user.id, eventId);
      } catch (error) {
        console.error('Error removing saved event:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const addFavoriteArtist = useCallback(
    async (artistId: string) => {
      if (!user) return;

      try {
        setLoading(true);
        await userService.addFavoriteArtist(user.id, artistId);
      } catch (error) {
        console.error('Error adding favorite artist:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const isGenreExplored = useCallback(
    (genre: string): boolean => {
      if (!user?.preferences?.exploredGenres) return false;
      return user.preferences.exploredGenres.includes(genre);
    },
    [user]
  );

  const isEventSaved = useCallback(
    (eventId: string): boolean => {
      if (!user?.preferences?.savedEvents) return false;
      return user.preferences.savedEvents.includes(eventId);
    },
    [user]
  );

  const isArtistFavorite = useCallback(
    (artistId: string): boolean => {
      if (!user?.preferences?.favoriteArtists) return false;
      return user.preferences.favoriteArtists.includes(artistId);
    },
    [user]
  );

  return {
    loading,
    exploredGenres: user?.preferences?.exploredGenres || [],
    savedEvents: user?.preferences?.savedEvents || [],
    favoriteArtists: user?.preferences?.favoriteArtists || [],
    addExploredGenre,
    addSavedEvent,
    removeSavedEvent,
    addFavoriteArtist,
    isGenreExplored,
    isEventSaved,
    isArtistFavorite,
  };
};
