import base64 from 'base-64';
import { useState, useEffect, useCallback } from 'react';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '@env';

// Comprehensive Electronic Music Genres (based on Wikipedia and industry standards)
const ELECTRONIC_MUSIC_GENRES = [
  // House
  'house', 'deep-house', 'tech-house', 'progressive-house', 'electro-house',
  'future-house', 'tropical-house', 'bass-house', 'chicago-house', 'acid-house',
  'big-room', 'melbourne-bounce', 'uk-garage', 'speed-garage',

  // Techno
  'techno', 'minimal-techno', 'detroit-techno', 'acid-techno', 'hard-techno',
  'industrial-techno', 'dub-techno',

  // Trance
  'trance', 'progressive-trance', 'psytrance', 'uplifting-trance', 'vocal-trance',
  'tech-trance', 'goa-trance', 'psychedelic-trance',

  // Drum & Bass / Jungle
  'drum-and-bass', 'dnb', 'jungle', 'liquid-funk', 'neurofunk', 'jump-up',

  // Dubstep / Bass Music
  'dubstep', 'brostep', 'riddim', 'trap', 'future-bass', 'bass',
  'drumstep', 'uk-dubstep',

  // Breakbeat / Breaks
  'breakbeat', 'breaks', 'nu-skool-breaks', 'progressive-breaks',
  'florida-breaks', 'acid-breaks',

  // Hardcore / Hardstyle
  'hardcore', 'hardstyle', 'gabber', 'happy-hardcore', 'uk-hardcore',
  'speedcore', 'terrorcore', 'frenchcore', 'rawstyle',

  // Ambient / Downtempo
  'ambient', 'downtempo', 'chillout', 'trip-hop', 'lo-fi', 'chillwave',
  'ambient-dub', 'dark-ambient', 'psybient',

  // Electro
  'electro', 'electroclash', 'electro-funk', 'miami-bass',

  // IDM / Experimental
  'idm', 'glitch', 'glitch-hop', 'experimental', 'microhouse', 'clicks-and-cuts',

  // Synthwave / Retro
  'synthwave', 'synthpop', 'vaporwave', 'darkwave', 'retrowave', 'outrun',

  // Industrial
  'industrial', 'ebm', 'aggrotech', 'dark-electro', 'power-noise',

  // Dance / Disco
  'disco', 'nu-disco', 'italo-disco', 'dance', 'eurodance', 'hands-up',

  // UK Genres
  'grime', 'garage', '2-step', 'bassline', 'uk-funky',

  // Other
  'edm', 'electronica', 'rave', 'club', 'dancehall', 'moombahton',
  'footwork', 'juke', 'vogue', 'ballroom', 'jersey-club',
  'phonk', 'drift-phonk', 'wave', 'hardwave'
];

// Helper function to wait for a specified time
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry function with exponential backoff
const retryWithBackoff = async <T,>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`[retryWithBackoff] Attempt ${i + 1} of ${maxRetries}`);
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`[retryWithBackoff] Attempt ${i + 1} failed, retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  throw lastError;
};

export const useSpotifyApi = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [artists, setArtists] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    console.log('[useSpotifyApi] Fetching access token...');
    try {
      return await retryWithBackoff(async () => {
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${base64.encode(
              `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
            )}`,
          },
          body: 'grant_type=client_credentials',
        });

        console.log('[useSpotifyApi] Token response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('[useSpotifyApi] Access token received successfully');
          setAccessToken(data.access_token);
          return data.access_token;
        } else {
          const errorText = await response.text();
          console.error('[useSpotifyApi] Failed to get access token:', response.status, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      }, 3, 1000);
    } catch (error) {
      console.error('[useSpotifyApi] Error fetching access token after retries:', error);
      console.error('[useSpotifyApi] Network troubleshooting:');
      console.error('  1. Check your internet connection');
      console.error('  2. If on simulator/emulator, ensure network access is enabled');
      console.error('  3. Try running: expo start --clear');
      console.error('  4. Verify Spotify API credentials are correct');
    }

    return null;
  }, []);

  useEffect(() => {
    if (!accessToken) {
      getAccessToken();
    }
  }, [accessToken, getAccessToken]);

  const getGenreSeeds = useCallback(async (): Promise<string[]> => {
    console.log('[useSpotifyApi] getGenreSeeds called, accessToken exists:', !!accessToken);
    let token = accessToken;
    if (!token) {
      console.log('[useSpotifyApi] No token available, fetching new one...');
      const newToken = await getAccessToken();
      if (!newToken) {
        console.error('[useSpotifyApi] Failed to get access token');
        return [];
      }
      token = newToken;
      console.log('[useSpotifyApi] New token obtained');
    }

    console.log('[useSpotifyApi] Fetching genre seeds from Spotify API...');
    console.log('[useSpotifyApi] Using token:', token.substring(0, 20) + '...');

    const url = 'https://api.spotify.com/v1/recommendations/available-genre-seeds';
    console.log('[useSpotifyApi] Request URL:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[useSpotifyApi] Genre seeds response status:', response.status);
      console.log('[useSpotifyApi] Response headers:', JSON.stringify(response.headers));

      if (response.ok) {
        const data = await response.json();
        console.log('[useSpotifyApi] Raw response data:', JSON.stringify(data).substring(0, 200));
        console.log('[useSpotifyApi] Genre seeds received:', data.genres?.length, 'genres');
        return data.genres || [];
      } else {
        const errorText = await response.text();
        console.log('[useSpotifyApi] Spotify API unavailable (status:', response.status + '), using comprehensive electronic music genres');
        if (response.status !== 404) {
          // Only log detailed errors for non-404 responses
          console.error('[useSpotifyApi] Unexpected error response:', errorText);
        }
        return ELECTRONIC_MUSIC_GENRES;
      }
    } catch (error) {
      console.log('[useSpotifyApi] Network error, using comprehensive electronic music genres');
      console.error('[useSpotifyApi] Error details:', error instanceof Error ? error.message : String(error));
      return ELECTRONIC_MUSIC_GENRES;
    }

    return ELECTRONIC_MUSIC_GENRES;
  }, [accessToken, getAccessToken]);

  const getRandomTrack = useCallback(async (genre: string): Promise<any | null> => {
    console.log('[useSpotifyApi] getRandomTrack called for genre:', genre);
    let token = accessToken;
    if (!token) {
      console.log('[useSpotifyApi] No token for getRandomTrack, fetching new one...');
      const newToken = await getAccessToken();
      if (!newToken) {
        console.error('[useSpotifyApi] Failed to get token for getRandomTrack');
        return null;
      }
      token = newToken;
    }

    try {
      // First, search for top artists in this genre with year filter
      const artistResponse = await fetch(`https://api.spotify.com/v1/search?q=genre:"${genre}"%20year:2024-2025&type=artist&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (artistResponse.ok) {
        const artistData = await artistResponse.json();
        const artists = artistData.artists.items;

        if (artists.length > 0) {
          // Sort by followers and pick a top artist
          const sortedArtists = artists.sort((a: any, b: any) =>
            (b.followers?.total || 0) - (a.followers?.total || 0)
          );
          const topArtist = sortedArtists[Math.floor(Math.random() * Math.min(3, sortedArtists.length))];

          console.log('[useSpotifyApi] Selected artist:', topArtist.name, 'with', topArtist.followers?.total, 'followers');

          // Get tracks from this artist
          const trackResponse = await fetch(`https://api.spotify.com/v1/artists/${topArtist.id}/top-tracks?market=US`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (trackResponse.ok) {
            const trackData = await trackResponse.json();
            if (trackData.tracks.length > 0) {
              const randomTrack = trackData.tracks[Math.floor(Math.random() * trackData.tracks.length)];
              console.log('[useSpotifyApi] Found track:', randomTrack.name, 'by', topArtist.name);
              return randomTrack;
            }
          }
        }
      }

      // Fallback: search for tracks directly with year filter
      const response = await fetch(`https://api.spotify.com/v1/search?q=genre:"${genre}"%20year:2024-2025&type=track&limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('[useSpotifyApi] getRandomTrack response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        if (data.tracks.items.length > 0) {
          // Sort by popularity and pick a random top track
          const sortedTracks = data.tracks.items.sort((a: any, b: any) =>
            (b.popularity || 0) - (a.popularity || 0)
          );
          const randomTrack = sortedTracks[Math.floor(Math.random() * Math.min(5, sortedTracks.length))];
          console.log('[useSpotifyApi] Found track:', randomTrack.name);
          return randomTrack;
        } else {
          console.log('[useSpotifyApi] No tracks found for genre:', genre);
        }
      } else {
        const errorText = await response.text();
        console.error('[useSpotifyApi] Failed to get random track:', response.status, errorText);
      }
    } catch (error) {
      console.error('[useSpotifyApi] Error fetching random track:', error);
    }

    return null;
  }, [accessToken, getAccessToken]);

  const searchGenre = useCallback(async (genreName: string) => {
    console.log('[useSpotifyApi] searchGenre called for:', genreName);
    let token = accessToken;
    if (!token) {
      const newToken = await getAccessToken();
      if (!newToken) {
        setArtists([]);
        setTracks([]);
        return;
      }
      token = newToken;
    }

    try {
      // Use Spotify Recommendations API with genre seed to get tracks
      const recommendationsResponse = await fetch(
        `https://api.spotify.com/v1/recommendations?seed_genres=${genreName}&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (recommendationsResponse.ok) {
        const data = await recommendationsResponse.json();
        console.log('[useSpotifyApi] Recommendations received:', data.tracks?.length, 'tracks');

        if (data.tracks && data.tracks.length > 0) {
          // Extract unique artists from recommended tracks
          const artistMap = new Map();
          const tracksList = [];

          for (const track of data.tracks) {
            // Add track to list
            tracksList.push(track);

            // Add artists from this track
            for (const artist of track.artists) {
              if (!artistMap.has(artist.id)) {
                artistMap.set(artist.id, artist);
              }
            }
          }

          // Get full artist details for top artists
          const artistIds = Array.from(artistMap.keys()).slice(0, 20);
          if (artistIds.length > 0) {
            const artistDetailsResponse = await fetch(
              `https://api.spotify.com/v1/artists?ids=${artistIds.join(',')}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (artistDetailsResponse.ok) {
              const artistData = await artistDetailsResponse.json();
              // Sort by followers
              const sortedArtists = artistData.artists.sort(
                (a: any, b: any) => (b.followers?.total || 0) - (a.followers?.total || 0)
              );
              console.log('[useSpotifyApi] Found', sortedArtists.length, 'artists for genre:', genreName);
              console.log('[useSpotifyApi] Top artist:', sortedArtists[0]?.name, 'with', sortedArtists[0]?.followers?.total, 'followers');
              setArtists(sortedArtists.slice(0, 10));
            }
          }

          // Sort tracks by popularity
          const sortedTracks = tracksList.sort(
            (a: any, b: any) => (b.popularity || 0) - (a.popularity || 0)
          );
          console.log('[useSpotifyApi] Found', sortedTracks.length, 'tracks for genre:', genreName);
          setTracks(sortedTracks.slice(0, 10));
        } else {
          console.log('[useSpotifyApi] No recommendations found for genre:', genreName);
          setArtists([]);
          setTracks([]);
        }
      } else {
        const errorText = await recommendationsResponse.text();
        console.log('[useSpotifyApi] Recommendations failed for genre:', genreName, '- trying fallback search');

        // Fallback: search for tracks by genre name with year filter
        try {
          const searchResponse = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(genreName)}%20year:2024-2025&type=track&limit=50`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            console.log('[useSpotifyApi] Fallback search found:', searchData.tracks?.items?.length, 'tracks');

            if (searchData.tracks?.items && searchData.tracks.items.length > 0) {
              // Extract unique artists
              const artistMap = new Map();
              const tracksList = searchData.tracks.items;

              for (const track of tracksList) {
                for (const artist of track.artists) {
                  if (!artistMap.has(artist.id)) {
                    artistMap.set(artist.id, artist);
                  }
                }
              }

              // Get full artist details
              const artistIds = Array.from(artistMap.keys()).slice(0, 20);
              if (artistIds.length > 0) {
                const artistDetailsResponse = await fetch(
                  `https://api.spotify.com/v1/artists?ids=${artistIds.join(',')}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                if (artistDetailsResponse.ok) {
                  const artistData = await artistDetailsResponse.json();
                  const sortedArtists = artistData.artists.sort(
                    (a: any, b: any) => (b.followers?.total || 0) - (a.followers?.total || 0)
                  );
                  console.log('[useSpotifyApi] Fallback found', sortedArtists.length, 'artists');
                  setArtists(sortedArtists.slice(0, 10));
                }
              }

              // Sort tracks by popularity
              const sortedTracks = tracksList.sort(
                (a: any, b: any) => (b.popularity || 0) - (a.popularity || 0)
              );
              setTracks(sortedTracks.slice(0, 10));
              return;
            }
          }
        } catch (fallbackError) {
          console.log('[useSpotifyApi] Fallback search also failed:', fallbackError);
        }

        // If everything fails, set empty arrays
        setArtists([]);
        setTracks([]);
      }
    } catch (error) {
      console.error('[useSpotifyApi] Error in searchGenre:', error);
      setArtists([]);
      setTracks([]);
    }
  }, [accessToken, getAccessToken]);

  return { getAccessToken, getGenreSeeds, getRandomTrack, artists, tracks, searchGenre };
};