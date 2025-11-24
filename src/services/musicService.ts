import { spotifyService } from './spotifyApi';
import { SpotifyTrack, MusicTrack, ArtistWithTracks } from '../types';

export class MusicService {
  /**
   * Get artist's top tracks from Spotify
   * @param artistName - Artist name to search for
   */
  async getArtistTopTracks(artistName: string): Promise<MusicTrack[]> {
    try {
      const spotifyData = await spotifyService.getArtistWithTopTracks(artistName);

      if (spotifyData && spotifyData.topTracks.length > 0) {
        return this.transformSpotifyTracks(spotifyData.topTracks);
      }

      return [];
    } catch (error) {
      console.error('Error fetching artist top tracks from Spotify:', error);
      return [];
    }
  }

  /**
   * Get top tracks from multiple artists for an event
   * @param artistNames - Array of artist names
   * @param tracksPerArtist - Number of tracks per artist (default: 2)
   */
  async getTracksForEvent(
    artistNames: string[],
    tracksPerArtist: number = 2
  ): Promise<MusicTrack[]> {
    const allTracks: MusicTrack[] = [];

    // Fetch tracks for each artist in parallel
    await Promise.all(
      artistNames.map(async (artistName) => {
        try {
          const tracks = await this.getArtistTopTracks(artistName);
          // Take top N tracks per artist
          allTracks.push(...tracks.slice(0, tracksPerArtist));
        } catch (error) {
          console.error(`Error fetching tracks for ${artistName}:`, error);
        }
      })
    );

    // Sort by popularity (Spotify)
    const sortedTracks = allTracks.sort((a, b) => {
      const aPopularity = a.popularity || 0;
      const bPopularity = b.popularity || 0;
      return bPopularity - aPopularity;
    });

    // Return top 4-5 tracks overall
    return sortedTracks.slice(0, 5);
  }

  /**
   * Get artists with full details and their top tracks
   * @param artistNames - Array of artist names
   * @param tracksPerArtist - Number of tracks per artist (default: 3)
   */
  async getArtistsWithDetails(
    artistNames: string[],
    tracksPerArtist: number = 3
  ): Promise<ArtistWithTracks[]> {
    const artistsWithTracks: ArtistWithTracks[] = [];

    // Fetch details for each artist in parallel
    await Promise.all(
      artistNames.map(async (artistName) => {
        try {
          const spotifyData = await spotifyService.getArtistWithTopTracks(artistName);

          if (spotifyData && spotifyData.artist) {
            const tracks = this.transformSpotifyTracks(
              spotifyData.topTracks.slice(0, tracksPerArtist)
            );

            artistsWithTracks.push({
              artist: spotifyData.artist,
              tracks,
            });
          }
        } catch (error) {
          console.error(`Error fetching details for ${artistName}:`, error);
        }
      })
    );

    // Sort by artist popularity
    return artistsWithTracks.sort((a, b) => {
      return b.artist.popularity - a.artist.popularity;
    });
  }

  /**
   * Transform Spotify tracks to common MusicTrack format
   */
  private transformSpotifyTracks(tracks: SpotifyTrack[]): MusicTrack[] {
    return tracks.map((track) => ({
      id: track.id,
      title: track.name,
      artist: track.album.name,
      imageUrl: track.album.images[0]?.url || null,
      duration: track.duration_ms,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify,
      source: 'spotify' as const,
      popularity: (track as any).popularity || 0,
    }));
  }
}

export const musicService = new MusicService();
