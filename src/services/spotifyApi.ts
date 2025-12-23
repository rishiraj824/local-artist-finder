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
   * Clean artist name for better search results
   * Removes common suffixes and formatting that cause search issues
   */
  private cleanArtistName(artistName: string): string {
    let cleaned = artistName.trim();

    // Remove country codes in parentheses: "FISHER (AU)" -> "FISHER"
    cleaned = cleaned.replace(/\s*\([A-Z]{2}\)$/i, '');

    // Remove "b2b" and similar annotations
    cleaned = cleaned.replace(/\s+(b2b|B2B|vs\.?|VS\.?|x)\s+.*/i, '');

    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    console.log(`[Spotify] Cleaned artist name: "${artistName}" -> "${cleaned}"`);
    return cleaned;
  }

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
      const cleanedName = this.cleanArtistName(artistName);

      const url = buildUrl(`${SPOTIFY_API_BASE_URL}/search`, {
        q: cleanedName,
        type: 'artist',
        limit: '5', // Get top 5 to find best match
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

      if (artists.length === 0) {
        console.warn(`[Spotify] No results found for: "${artistName}" (cleaned: "${cleanedName}")`);
        return null;
      }

      // Try to find exact or close match
      const exactMatch = artists.find((a: SpotifyArtist) =>
        a.name.toLowerCase() === cleanedName.toLowerCase()
      );

      if (exactMatch) {
        console.log(`[Spotify] Exact match found: "${exactMatch.name}"`);
        return exactMatch;
      }

      // Return most popular artist if no exact match
      console.log(`[Spotify] Using best match: "${artists[0].name}" for query "${artistName}"`);
      return artists[0];
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
