import { config } from '../config';
import { SpotifyArtist, SpotifyTrack } from '../types';

// Backend API URL
const API_URL = config.backendApiUrl || 'http://localhost:3000/api';

// Helper to build URL with query params
const buildUrl = (base: string, params: Record<string, string>) => {
  const url = new URL(base);
  Object.keys(params).forEach((key) => {
    if (params[key]) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

export class SpotifyService {

  /**
   * Search for an artist by name using backend API
   * @param artistName - Artist name to search for
   */
  async searchArtist(artistName: string): Promise<SpotifyArtist | null> {
    try {
      const url = buildUrl(`${API_URL}/music/search`, {
        query: artistName,
      });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        return data.data;
      }

      return null;
    } catch (error) {
      console.error('Error searching for artist on Spotify:', error);
      return null;
    }
  }

  /**
   * Get an artist's top tracks using backend API
   * @param artistId - Spotify artist ID
   * @param market - Market/country code (default: US)
   */
  async getArtistTopTracks(
    artistId: string,
    market: string = 'US'
  ): Promise<SpotifyTrack[]> {
    try {
      const url = buildUrl(
        `${API_URL}/music/artist/${artistId}/top-tracks`,
        { market }
      );

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        return data.data;
      }

      return [];
    } catch (error) {
      console.error('Error fetching artist top tracks:', error);
      throw new Error('Failed to fetch artist tracks');
    }
  }

  /**
   * Get artist details and their top tracks
   * @param artistName - Artist name
   */
  async getArtistWithTopTracks(artistName: string): Promise<{
    artist: SpotifyArtist;
    topTracks: SpotifyTrack[];
  } | null> {
    try {
      const artist = await this.searchArtist(artistName);

      if (!artist) {
        return null;
      }

      const topTracks = await this.getArtistTopTracks(artist.id);

      return {
        artist,
        topTracks,
      };
    } catch (error) {
      console.error('Error fetching artist with top tracks:', error);
      return null;
    }
  }
}

export const spotifyService = new SpotifyService();
