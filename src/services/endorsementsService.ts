import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Endorsement, EventEndorsement, ArtistEndorsement } from '../types/social';

export class EndorsementsService {
  private endorsementsCollection = collection(db, 'endorsements');

  /**
   * Create an endorsement for an event
   */
  async endorseEvent(
    eventId: string,
    eventName: string,
    eventDate: string,
    venueName: string,
    comment?: string
  ): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    // Check if user already endorsed this event
    const existingEndorsement = await this.hasEndorsed(eventId, 'event');
    if (existingEndorsement) {
      throw new Error('You have already endorsed this event');
    }

    const endorsementRef = doc(this.endorsementsCollection);
    const endorsementData = {
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userPhoto: user.photoURL || undefined,
      type: 'event',
      targetId: eventId,
      targetName: eventName,
      comment: comment || undefined,
      eventDate,
      venueName,
      createdAt: serverTimestamp(),
    };

    await setDoc(endorsementRef, endorsementData);
    return endorsementRef.id;
  }

  /**
   * Create an endorsement for an artist
   */
  async endorseArtist(
    artistId: string,
    artistName: string,
    genres?: string[],
    spotifyUrl?: string,
    comment?: string
  ): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    // Check if user already endorsed this artist
    const existingEndorsement = await this.hasEndorsed(artistId, 'artist');
    if (existingEndorsement) {
      throw new Error('You have already endorsed this artist');
    }

    const endorsementRef = doc(this.endorsementsCollection);
    const endorsementData = {
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userPhoto: user.photoURL || undefined,
      type: 'artist',
      targetId: artistId,
      targetName: artistName,
      comment: comment || undefined,
      genres: genres || undefined,
      spotifyUrl: spotifyUrl || undefined,
      createdAt: serverTimestamp(),
    };

    await setDoc(endorsementRef, endorsementData);
    return endorsementRef.id;
  }

  /**
   * Get endorsements for a specific target (event or artist)
   */
  async getEndorsements(
    targetId: string,
    type: 'event' | 'artist'
  ): Promise<(EventEndorsement | ArtistEndorsement)[]> {
    const q = query(
      this.endorsementsCollection,
      where('targetId', '==', targetId),
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const endorsements: (EventEndorsement | ArtistEndorsement)[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      endorsements.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userPhoto: data.userPhoto,
        type: data.type,
        targetId: data.targetId,
        targetName: data.targetName,
        comment: data.comment,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        ...(type === 'event' && {
          eventDate: data.eventDate,
          venueName: data.venueName,
        }),
        ...(type === 'artist' && {
          genres: data.genres,
          spotifyUrl: data.spotifyUrl,
        }),
      } as EventEndorsement | ArtistEndorsement);
    });

    return endorsements;
  }

  /**
   * Get all endorsements by current user
   */
  async getMyEndorsements(): Promise<(EventEndorsement | ArtistEndorsement)[]> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const q = query(
      this.endorsementsCollection,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const endorsements: (EventEndorsement | ArtistEndorsement)[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      endorsements.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userPhoto: data.userPhoto,
        type: data.type,
        targetId: data.targetId,
        targetName: data.targetName,
        comment: data.comment,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        ...(data.type === 'event' && {
          eventDate: data.eventDate,
          venueName: data.venueName,
        }),
        ...(data.type === 'artist' && {
          genres: data.genres,
          spotifyUrl: data.spotifyUrl,
        }),
      } as EventEndorsement | ArtistEndorsement);
    });

    return endorsements;
  }

  /**
   * Delete an endorsement
   */
  async deleteEndorsement(endorsementId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    // Verify the endorsement belongs to the current user
    const endorsementRef = doc(this.endorsementsCollection, endorsementId);
    const endorsementDoc = await getDoc(endorsementRef);

    if (!endorsementDoc.exists()) {
      throw new Error('Endorsement not found');
    }

    if (endorsementDoc.data().userId !== user.uid) {
      throw new Error('You can only delete your own endorsements');
    }

    await deleteDoc(endorsementRef);
  }

  /**
   * Check if current user has endorsed a target
   */
  async hasEndorsed(targetId: string, type: 'event' | 'artist'): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const q = query(
      this.endorsementsCollection,
      where('userId', '==', user.uid),
      where('targetId', '==', targetId),
      where('type', '==', type)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : querySnapshot.docs[0].id;
  }

  /**
   * Get endorsement count for a target
   */
  async getEndorsementCount(targetId: string, type: 'event' | 'artist'): Promise<number> {
    const q = query(
      this.endorsementsCollection,
      where('targetId', '==', targetId),
      where('type', '==', type)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  }
}

export const endorsementsService = new EndorsementsService();
