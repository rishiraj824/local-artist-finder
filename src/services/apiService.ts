import { auth } from '../config/firebase';
import { config } from '../config';

// Backend API URL - change this for production
const API_URL = config.backendApiUrl || 'http://localhost:3000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  /**
   * Get authentication headers with Firebase ID token
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Not authenticated');
    }

    const idToken = await user.getIdToken();
    return {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'API request failed');
    }

    return data.data as T;
  }

  // ==================== USER ENDPOINTS ====================

  /**
   * Get current user profile
   */
  async getProfile() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/users/profile`, { headers });
    return this.handleResponse(response);
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: { displayName?: string; photoURL?: string }) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });
    return this.handleResponse(response);
  }

  /**
   * Sync contacts and find friends
   */
  async syncContacts(phoneNumbers: string[]) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/users/sync-contacts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ contacts: phoneNumbers }),
    });
    return this.handleResponse(response);
  }

  /**
   * Get friends list
   */
  async getFriends() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/users/friends`, { headers });
    return this.handleResponse(response);
  }

  // ==================== ENDORSEMENT ENDPOINTS ====================

  /**
   * Endorse an event
   */
  async endorseEvent(
    eventId: string,
    eventName: string,
    eventDate: string,
    venueName: string,
    comment?: string
  ) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/endorsements`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'event',
        targetId: eventId,
        targetName: eventName,
        comment,
        metadata: {
          eventDate,
          venueName,
        },
      }),
    });
    return this.handleResponse(response);
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
  ) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/endorsements`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'artist',
        targetId: artistId,
        targetName: artistName,
        comment,
        metadata: {
          genres,
          spotifyUrl,
        },
      }),
    });
    return this.handleResponse(response);
  }

  /**
   * Get endorsements for a target (event or artist)
   */
  async getEndorsements(targetId: string, type: 'event' | 'artist') {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_URL}/endorsements?targetId=${targetId}&type=${type}`,
      { headers }
    );
    return this.handleResponse(response);
  }

  /**
   * Get user's endorsements
   */
  async getMyEndorsements() {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/endorsements/my`, { headers });
    return this.handleResponse(response);
  }

  /**
   * Delete endorsement
   */
  async deleteEndorsement(endorsementId: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/endorsements/${endorsementId}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse(response);
  }

  /**
   * Check if user has endorsed an item
   */
  async hasEndorsed(targetId: string, type: 'event' | 'artist'): Promise<boolean> {
    try {
      const endorsements = await this.getMyEndorsements();
      return endorsements.some(
        (e: any) => e.targetId === targetId && e.type === type
      );
    } catch (error) {
      console.error('Error checking endorsement:', error);
      return false;
    }
  }

  // ==================== VOTE ENDPOINTS ====================

  /**
   * Vote on an event
   */
  async voteOnEvent(
    eventId: string,
    eventName: string,
    eventDate: string,
    venueName: string,
    status: 'interested' | 'going' | 'not_going'
  ) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/votes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        eventId,
        eventName,
        eventDate,
        venueName,
        status,
      }),
    });
    return this.handleResponse(response);
  }

  /**
   * Get vote summary for an event
   */
  async getEventVoteSummary(eventId: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/votes/event/${eventId}`, {
      headers,
    });
    return this.handleResponse(response);
  }

  /**
   * Get user's votes
   */
  async getMyVotes(status?: 'interested' | 'going' | 'not_going') {
    const headers = await this.getAuthHeaders();
    const url = status
      ? `${API_URL}/votes/my?status=${status}`
      : `${API_URL}/votes/my`;
    const response = await fetch(url, { headers });
    return this.handleResponse(response);
  }

  /**
   * Get user's vote for an event
   */
  async getMyVote(eventId: string) {
    try {
      const votes = await this.getMyVotes();
      return votes.find((v: any) => v.eventId === eventId) || null;
    } catch (error) {
      console.error('Error getting vote:', error);
      return null;
    }
  }

  /**
   * Delete vote
   */
  async deleteVote(eventId: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/votes/${eventId}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
