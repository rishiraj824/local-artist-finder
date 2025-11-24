import { encode as base64Encode } from 'base-64';
import { config } from '../config';
import { SpotifyArtist, SpotifyTrack } from '../types';

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

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
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * Get access token using client credentials flow
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = base64Encode(
        `${config.spotify.clientId}:${config.spotify.clientSecret}`
      );

      const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      this.accessToken = data.access_token;
      // Set expiry to 50 minutes (tokens last 1 hour)
      this.tokenExpiry = Date.now() + 50 * 60 * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  /**
   * Search for an artist by name
   * @param artistName - Artist name to search for
   */
  async searchArtist(artistName: string): Promise<SpotifyArtist | null> {
    try {
      const token = await this.getAccessToken();

      const url = buildUrl(`${SPOTIFY_API_BASE_URL}/search`, {
        q: artistName,
        type: 'artist',
        limit: '1',
      });

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const artists = data.artists.items;
      return artists.length > 0 ? artists[0] : null;
    } catch (error) {
      console.error('Error searching for artist on Spotify:', error);
      return null;
    }
  }

  /**
   * Get an artist's top tracks
   * @param artistId - Spotify artist ID
   * @param market - Market/country code (default: US)
   */
  async getArtistTopTracks(
    artistId: string,
    market: string = 'US'
  ): Promise<SpotifyTrack[]> {
    try {
      const token = await this.getAccessToken();

      const url = buildUrl(
        `${SPOTIFY_API_BASE_URL}/artists/${artistId}/top-tracks`,
        { market }
      );

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.tracks;
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
