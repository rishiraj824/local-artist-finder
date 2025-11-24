import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Endorsement, EventEndorsement, ArtistEndorsement } from '../types/social';
import { authService } from './authService';
import { contactsService } from './contactsService';

export class EndorsementService {
  /**
   * Endorse an event
   */
  async endorseEvent(
    eventId: string,
    eventName: string,
    eventDate: string,
    venueName: string,
    comment?: string
  ): Promise<EventEndorsement> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) throw new Error('No user signed in');

      const endorsement: Omit<EventEndorsement, 'id'> = {
        userId: currentUser.id,
        userName: currentUser.displayName || 'Anonymous',
        userPhoto: currentUser.photoURL,
        type: 'event',
        targetId: eventId,
        targetName: eventName,
        eventDate,
        venueName,
        comment,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'endorsements'), {
        ...endorsement,
        createdAt: serverTimestamp(),
      });

      console.log('Event endorsed:', docRef.id);

      return {
        id: docRef.id,
        ...endorsement,
      };
    } catch (error) {
      console.error('Error endorsing event:', error);
      throw error;
    }
  }

  /**
   * Endorse an artist
   */
  async endorseArtist(
    artistId: string,
    artistName: string,
    genres?: string[],
    spotifyUrl?: string,
    comment?: string
  ): Promise<ArtistEndorsement> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) throw new Error('No user signed in');

      const endorsement: Omit<ArtistEndorsement, 'id'> = {
        userId: currentUser.id,
        userName: currentUser.displayName || 'Anonymous',
        userPhoto: currentUser.photoURL,
        type: 'artist',
        targetId: artistId,
        targetName: artistName,
        genres,
        spotifyUrl,
        comment,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'endorsements'), {
        ...endorsement,
        createdAt: serverTimestamp(),
      });

      console.log('Artist endorsed:', docRef.id);

      return {
        id: docRef.id,
        ...endorsement,
      };
    } catch (error) {
      console.error('Error endorsing artist:', error);
      throw error;
    }
  }

  /**
   * Remove endorsement
   */
  async removeEndorsement(endorsementId: string): Promise<void> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) throw new Error('No user signed in');

      // Verify the endorsement belongs to the user
      const endorsementRef = doc(db, 'endorsements', endorsementId);
      const endorsementDoc = await getDoc(endorsementRef);

      if (!endorsementDoc.exists()) {
        throw new Error('Endorsement not found');
      }

      const data = endorsementDoc.data();
      if (data.userId !== currentUser.id) {
        throw new Error('Not authorized to remove this endorsement');
      }

      await deleteDoc(endorsementRef);
      console.log('Endorsement removed:', endorsementId);
    } catch (error) {
      console.error('Error removing endorsement:', error);
      throw error;
    }
  }

  /**
   * Get endorsements for an event
   */
  async getEventEndorsements(eventId: string): Promise<EventEndorsement[]> {
    try {
      const friends = await contactsService.getFriends();
      const friendIds = friends.map((f) => f.userId);

      // Get current user
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        friendIds.push(currentUser.id);
      }

      if (friendIds.length === 0) return [];

      const endorsementsRef = collection(db, 'endorsements');
      const q = query(
        endorsementsRef,
        where('type', '==', 'event'),
        where('targetId', '==', eventId),
        where('userId', 'in', friendIds.slice(0, 10)), // Limit to first 10 friends
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const endorsements: EventEndorsement[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        endorsements.push({
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        } as EventEndorsement);
      });

      return endorsements;
    } catch (error) {
      console.error('Error getting event endorsements:', error);
      return [];
    }
  }

  /**
   * Get endorsements for an artist
   */
  async getArtistEndorsements(artistId: string): Promise<ArtistEndorsement[]> {
    try {
      const friends = await contactsService.getFriends();
      const friendIds = friends.map((f) => f.userId);

      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        friendIds.push(currentUser.id);
      }

      if (friendIds.length === 0) return [];

      const endorsementsRef = collection(db, 'endorsements');
      const q = query(
        endorsementsRef,
        where('type', '==', 'artist'),
        where('targetId', '==', artistId),
        where('userId', 'in', friendIds.slice(0, 10)),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const endorsements: ArtistEndorsement[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        endorsements.push({
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        } as ArtistEndorsement);
      });

      return endorsements;
    } catch (error) {
      console.error('Error getting artist endorsements:', error);
      return [];
    }
  }

  /**
   * Get user's own endorsements
   */
  async getMyEndorsements(limitCount: number = 20): Promise<Endorsement[]> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) return [];

      const endorsementsRef = collection(db, 'endorsements');
      const q = query(
        endorsementsRef,
        where('userId', '==', currentUser.id),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const endorsements: Endorsement[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        endorsements.push({
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        } as Endorsement);
      });

      return endorsements;
    } catch (error) {
      console.error('Error getting my endorsements:', error);
      return [];
    }
  }

  /**
   * Check if user has endorsed an item
   */
  async hasEndorsed(targetId: string, type: 'event' | 'artist'): Promise<boolean> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) return false;

      const endorsementsRef = collection(db, 'endorsements');
      const q = query(
        endorsementsRef,
        where('userId', '==', currentUser.id),
        where('type', '==', type),
        where('targetId', '==', targetId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking endorsement:', error);
      return false;
    }
  }
}

export const endorsementService = new EndorsementService();
