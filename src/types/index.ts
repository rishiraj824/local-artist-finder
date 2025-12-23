// Event Types
export type EventType = 'festival' | 'rave' | 'afters' | 'show';

// EDM Train API Types
export interface EDMTrainEvent {
  id: string;
  name: string;
  date: string;
  startTime?: string;
  endTime?: string;
  venue: {
    name: string;
    location: string;
    latitude?: number;
    longitude?: number;
  };
  artistList: EDMTrainArtist[];
  ticketLink?: string;
  ages?: string;
  festivalId?: string;
  genres?: string[];
  eventType?: EventType;
}

export interface EDMTrainArtist {
  id: string;
  name: string;
}

// Spotify API Types
export interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  genres: string[];
  popularity: number;
  followers: {
    total: number;
  };
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  preview_url: string | null;
  duration_ms: number;
  album: {
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  external_urls: {
    spotify: string;
  };
}

// Location Types
export interface LocationData {
  city: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
}

// Navigation Types
export type RootStackParamList = {
  MainTabs: undefined;
  Events: undefined;
  Genres: undefined;
  ArtistDetails: {
    artistName: string;
    eventName: string;
    ticketLink?: string;
  };
  GenreDetail: {
    genreName: string;
  };
  Settings: undefined;
};

// Extended Event with Tracks
export interface EventWithTracks extends EDMTrainEvent {
  tracks?: MusicTrack[];
  artistsWithDetails?: ArtistWithTracks[];
  isLoadingTracks?: boolean;
}

// Artist with full details and tracks
export interface ArtistWithTracks {
  artist: SpotifyArtist;
  tracks: MusicTrack[];
}

// Music Track Type
export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  imageUrl: string | null;
  duration: number;
  previewUrl: string | null;
  externalUrl: string;
  source: 'spotify';
  popularity?: number;
}

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider: 'google' | 'spotify';
  spotifyAccessToken?: string;
  spotifyRefreshToken?: string;
  spotifyFollowedArtistsCount?: number;
  genresDiscovered?: string[];
  genresDiscoveredCount?: number;
  lastSpotifySync?: Date;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  exploredGenres: string[];
  savedEvents: string[];
  favoriteArtists: string[];
}
