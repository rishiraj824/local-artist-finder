// User types
export interface User {
  id: string;
  phoneNumber: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  contacts: string[]; // Array of phone numbers from user's contacts
}

// Friend types
export interface Friend {
  userId: string;
  phoneNumber: string;
  displayName?: string;
  photoURL?: string;
  addedAt: Date;
}

// Endorsement types
export interface Endorsement {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  type: 'event' | 'artist';
  targetId: string; // Event ID or Artist ID
  targetName: string; // Event name or Artist name
  comment?: string;
  createdAt: Date;
}

export interface EventEndorsement extends Endorsement {
  type: 'event';
  eventDate: string;
  venueName: string;
}

export interface ArtistEndorsement extends Endorsement {
  type: 'artist';
  genres?: string[];
  spotifyUrl?: string;
}

// Vote types
export interface EventVote {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  venueName: string;
  userId: string;
  userName: string;
  status: 'interested' | 'going' | 'not_going';
  createdAt: Date;
  updatedAt: Date;
}

// Vote summary for an event
export interface EventVoteSummary {
  eventId: string;
  totalVotes: number;
  interested: number;
  going: number;
  notGoing: number;
  friendsGoing: Friend[];
  friendsInterested: Friend[];
}

// Feed item types
export type FeedItem = {
  id: string;
  type: 'endorsement' | 'vote';
  user: {
    id: string;
    name: string;
    photo?: string;
  };
  createdAt: Date;
} & (
  | {
      type: 'endorsement';
      endorsement: EventEndorsement | ArtistEndorsement;
    }
  | {
      type: 'vote';
      vote: EventVote;
    }
);
