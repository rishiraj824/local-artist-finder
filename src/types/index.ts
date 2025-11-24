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
  };
  artistList: EDMTrainArtist[];
  ticketLink?: string;
  ages?: string;
  festivalId?: string;
  genres?: string[];
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
  Events: undefined;
  ArtistDetails: {
    artistName: string;
    eventName: string;
    ticketLink?: string;
  };
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
