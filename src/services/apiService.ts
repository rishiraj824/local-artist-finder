import { auth } from '../config/firebase';
import { config } from '../config';

// Backend API URL - change this for production
const API_URL = config.backendApiUrl || 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface UserProfile {
  displayName?: string;
  photoURL?: string;
}

interface Friend {
  userId: string;
  phoneNumber: string;
  displayName?: string;
  photoURL?: string;
  addedAt: Date;
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
   * @deprecated Consider using authService.getCurrentUser() instead
   */
  async getProfile(): Promise<UserProfile> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/users/profile`, { headers });
    return this.handleResponse<UserProfile>(response);
  }

  /**
   * Update user profile
   * @deprecated Consider using authService.updateUserProfile() instead
   */
  async updateProfile(updates: UserProfile): Promise<UserProfile> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });
    return this.handleResponse<UserProfile>(response);
  }

  /**
   * Sync contacts and find friends
   * @deprecated Use contactsService.syncContactsAndFindFriends() instead (direct Firestore)
   */
  async syncContacts(phoneNumbers: string[]): Promise<Friend[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/users/sync-contacts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ contacts: phoneNumbers }),
    });
    return this.handleResponse<Friend[]>(response);
  }

  /**
   * Get friends list
   * @deprecated Use contactsService.getFriends() instead (direct Firestore)
   */
  async getFriends(): Promise<Friend[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_URL}/users/friends`, { headers });
    return this.handleResponse<Friend[]>(response);
  }

  // ==================== DEPRECATED ENDPOINTS ====================
  // The following methods are deprecated and kept only for backwards compatibility.
  // Use the corresponding Firestore services instead:
  // - endorsementsService for endorsements
  // - votesService for votes
}

export const apiService = new ApiService();
