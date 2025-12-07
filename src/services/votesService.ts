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
import { EventVote, EventVoteSummary, Friend } from '../types/social';
import { contactsService } from './contactsService';

export class VotesService {
  private votesCollection = collection(db, 'votes');

  /**
   * Vote on an event (or update existing vote)
   */
  async voteOnEvent(
    eventId: string,
    eventName: string,
    eventDate: string,
    venueName: string,
    status: 'interested' | 'going' | 'not_going'
  ): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    // Use userId-eventId as document ID to ensure one vote per user per event
    const voteId = `${user.uid}_${eventId}`;
    const voteRef = doc(this.votesCollection, voteId);

    const voteData = {
      eventId,
      eventName,
      eventDate,
      venueName,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      status,
      updatedAt: serverTimestamp(),
    };

    // Check if vote already exists
    const existingVote = await getDoc(voteRef);
    if (existingVote.exists()) {
      // Update existing vote
      await setDoc(voteRef, voteData, { merge: true });
    } else {
      // Create new vote
      await setDoc(voteRef, {
        ...voteData,
        createdAt: serverTimestamp(),
      });
    }

    return voteRef.id;
  }

  /**
   * Get all votes for an event
   */
  async getEventVotes(eventId: string): Promise<EventVote[]> {
    const q = query(
      this.votesCollection,
      where('eventId', '==', eventId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const votes: EventVote[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      votes.push({
        id: doc.id,
        eventId: data.eventId,
        eventName: data.eventName,
        eventDate: data.eventDate,
        venueName: data.venueName,
        userId: data.userId,
        userName: data.userName,
        status: data.status,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      });
    });

    return votes;
  }

  /**
   * Get vote summary for an event including friends' votes
   */
  async getEventVoteSummary(eventId: string): Promise<EventVoteSummary> {
    const votes = await this.getEventVotes(eventId);

    let interested = 0;
    let going = 0;
    let notGoing = 0;

    const friendsGoingIds: string[] = [];
    const friendsInterestedIds: string[] = [];

    votes.forEach((vote) => {
      switch (vote.status) {
        case 'interested':
          interested++;
          friendsInterestedIds.push(vote.userId);
          break;
        case 'going':
          going++;
          friendsGoingIds.push(vote.userId);
          break;
        case 'not_going':
          notGoing++;
          break;
      }
    });

    // Get friends list to filter which voters are friends
    const friends = await contactsService.getFriends();
    const friendUserIds = new Set(friends.map((f) => f.userId));

    const friendsGoing = votes
      .filter((v) => v.status === 'going' && friendUserIds.has(v.userId))
      .map((v) => friends.find((f) => f.userId === v.userId)!)
      .filter(Boolean);

    const friendsInterested = votes
      .filter((v) => v.status === 'interested' && friendUserIds.has(v.userId))
      .map((v) => friends.find((f) => f.userId === v.userId)!)
      .filter(Boolean);

    return {
      eventId,
      totalVotes: votes.length,
      interested,
      going,
      notGoing,
      friendsGoing,
      friendsInterested,
    };
  }

  /**
   * Get current user's votes
   */
  async getMyVotes(status?: 'interested' | 'going' | 'not_going'): Promise<EventVote[]> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    let q;
    if (status) {
      q = query(
        this.votesCollection,
        where('userId', '==', user.uid),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        this.votesCollection,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const votes: EventVote[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      votes.push({
        id: doc.id,
        eventId: data.eventId,
        eventName: data.eventName,
        eventDate: data.eventDate,
        venueName: data.venueName,
        userId: data.userId,
        userName: data.userName,
        status: data.status,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      });
    });

    return votes;
  }

  /**
   * Get current user's vote for a specific event
   */
  async getMyVote(eventId: string): Promise<EventVote | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const voteId = `${user.uid}_${eventId}`;
    const voteRef = doc(this.votesCollection, voteId);
    const voteDoc = await getDoc(voteRef);

    if (!voteDoc.exists()) {
      return null;
    }

    const data = voteDoc.data();
    return {
      id: voteDoc.id,
      eventId: data.eventId,
      eventName: data.eventName,
      eventDate: data.eventDate,
      venueName: data.venueName,
      userId: data.userId,
      userName: data.userName,
      status: data.status,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
    };
  }

  /**
   * Delete a vote
   */
  async deleteVote(eventId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const voteId = `${user.uid}_${eventId}`;
    const voteRef = doc(this.votesCollection, voteId);

    // Verify the vote exists
    const voteDoc = await getDoc(voteRef);
    if (!voteDoc.exists()) {
      throw new Error('Vote not found');
    }

    await deleteDoc(voteRef);
  }

  /**
   * Check if current user has voted on an event
   */
  async hasVoted(eventId: string): Promise<boolean> {
    const vote = await this.getMyVote(eventId);
    return vote !== null;
  }
}

export const votesService = new VotesService();
