import {
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { EventVote, EventVoteSummary, Friend } from '../types/social';
import { authService } from './authService';
import { contactsService } from './contactsService';

export class VotingService {
  /**
   * Vote on an event
   */
  async voteOnEvent(
    eventId: string,
    eventName: string,
    eventDate: string,
    venueName: string,
    status: 'interested' | 'going' | 'not_going'
  ): Promise<EventVote> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) throw new Error('No user signed in');

      const voteId = `${currentUser.id}_${eventId}`;
      const voteRef = doc(db, 'event_votes', voteId);

      const vote: Omit<EventVote, 'id'> = {
        eventId,
        eventName,
        eventDate,
        venueName,
        userId: currentUser.id,
        userName: currentUser.displayName || 'Anonymous',
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(voteRef, {
        ...vote,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('Vote recorded:', voteId, status);

      return {
        id: voteId,
        ...vote,
      };
    } catch (error) {
      console.error('Error voting on event:', error);
      throw error;
    }
  }

  /**
   * Remove vote from an event
   */
  async removeVote(eventId: string): Promise<void> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) throw new Error('No user signed in');

      const voteId = `${currentUser.id}_${eventId}`;
      const voteRef = doc(db, 'event_votes', voteId);

      await deleteDoc(voteRef);
      console.log('Vote removed:', voteId);
    } catch (error) {
      console.error('Error removing vote:', error);
      throw error;
    }
  }

  /**
   * Get user's vote for an event
   */
  async getMyVote(eventId: string): Promise<EventVote | null> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) return null;

      const voteId = `${currentUser.id}_${eventId}`;
      const voteRef = doc(db, 'event_votes', voteId);
      const voteDoc = await getDoc(voteRef);

      if (!voteDoc.exists()) return null;

      const data = voteDoc.data();
      return {
        id: voteDoc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      } as EventVote;
    } catch (error) {
      console.error('Error getting vote:', error);
      return null;
    }
  }

  /**
   * Get vote summary for an event (including friends' votes)
   */
  async getEventVoteSummary(eventId: string): Promise<EventVoteSummary> {
    try {
      // Get friends
      const friends = await contactsService.getFriends();
      const friendIds = friends.map((f) => f.userId);

      // Add current user
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        friendIds.push(currentUser.id);
      }

      if (friendIds.length === 0) {
        return {
          eventId,
          totalVotes: 0,
          interested: 0,
          going: 0,
          notGoing: 0,
          friendsGoing: [],
          friendsInterested: [],
        };
      }

      // Query votes - batch by 10 (Firestore 'in' limit)
      const allVotes: EventVote[] = [];
      const batchSize = 10;

      for (let i = 0; i < friendIds.length; i += batchSize) {
        const batch = friendIds.slice(i, i + batchSize);

        const votesRef = collection(db, 'event_votes');
        const q = query(
          votesRef,
          where('eventId', '==', eventId),
          where('userId', 'in', batch)
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          allVotes.push({
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
          } as EventVote);
        });
      }

      // Calculate summary
      const summary: EventVoteSummary = {
        eventId,
        totalVotes: allVotes.length,
        interested: allVotes.filter((v) => v.status === 'interested').length,
        going: allVotes.filter((v) => v.status === 'going').length,
        notGoing: allVotes.filter((v) => v.status === 'not_going').length,
        friendsGoing: [],
        friendsInterested: [],
      };

      // Map votes to friends
      const friendMap = new Map(friends.map((f) => [f.userId, f]));

      allVotes.forEach((vote) => {
        const friend = friendMap.get(vote.userId);
        if (friend) {
          if (vote.status === 'going') {
            summary.friendsGoing.push(friend);
          } else if (vote.status === 'interested') {
            summary.friendsInterested.push(friend);
          }
        }
      });

      return summary;
    } catch (error) {
      console.error('Error getting vote summary:', error);
      return {
        eventId,
        totalVotes: 0,
        interested: 0,
        going: 0,
        notGoing: 0,
        friendsGoing: [],
        friendsInterested: [],
      };
    }
  }

  /**
   * Get events user is going to
   */
  async getMyGoingEvents(): Promise<EventVote[]> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) return [];

      const votesRef = collection(db, 'event_votes');
      const q = query(
        votesRef,
        where('userId', '==', currentUser.id),
        where('status', '==', 'going'),
        orderBy('eventDate', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const votes: EventVote[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        votes.push({
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
        } as EventVote);
      });

      return votes;
    } catch (error) {
      console.error('Error getting going events:', error);
      return [];
    }
  }

  /**
   * Get events friends are going to
   */
  async getFriendsGoingEvents(): Promise<EventVote[]> {
    try {
      const friends = await contactsService.getFriends();
      if (friends.length === 0) return [];

      const friendIds = friends.map((f) => f.userId);
      const allVotes: EventVote[] = [];
      const batchSize = 10;

      for (let i = 0; i < friendIds.length; i += batchSize) {
        const batch = friendIds.slice(i, i + batchSize);

        const votesRef = collection(db, 'event_votes');
        const q = query(
          votesRef,
          where('userId', 'in', batch),
          where('status', '==', 'going'),
          orderBy('eventDate', 'asc')
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          allVotes.push({
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
            updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
          } as EventVote);
        });
      }

      return allVotes;
    } catch (error) {
      console.error('Error getting friends going events:', error);
      return [];
    }
  }
}

export const votingService = new VotingService();
