import * as Contacts from 'expo-contacts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Friend } from '../types/social';
import { authService } from './authService';

export class ContactsService {
  /**
   * Request contacts permission
   */
  async requestPermission(): Promise<boolean> {
    const { status } = await Contacts.requestPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Get phone contacts
   */
  async getPhoneContacts(): Promise<string[]> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error('Contacts permission denied');
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      // Extract and normalize phone numbers
      const phoneNumbers: string[] = [];
      data.forEach((contact) => {
        contact.phoneNumbers?.forEach((phone) => {
          const normalized = this.normalizePhoneNumber(phone.number || '');
          if (normalized) {
            phoneNumbers.push(normalized);
          }
        });
      });

      // Remove duplicates
      return Array.from(new Set(phoneNumbers));
    } catch (error) {
      console.error('Error getting contacts:', error);
      throw error;
    }
  }

  /**
   * Normalize phone number to E.164 format
   * This is a simple implementation - you may want to use libphonenumber-js for production
   */
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Simple US number normalization (add +1 if not present)
    if (digits.length === 10) {
      return `+1${digits}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }

    // Return as-is if it starts with +
    if (phone.startsWith('+')) {
      return `+${digits}`;
    }

    return '';
  }

  /**
   * Sync contacts with Firebase and find friends
   */
  async syncContactsAndFindFriends(): Promise<Friend[]> {
    try {
      // Get phone contacts
      const phoneNumbers = await this.getPhoneContacts();
      console.log(`Found ${phoneNumbers.length} contacts`);

      // Update user's contacts list in Firestore
      await authService.updateUserContacts(phoneNumbers);

      // Find users in Firestore who match these phone numbers
      const friends = await this.findUsersByPhoneNumbers(phoneNumbers);
      console.log(`Found ${friends.length} friends on the app`);

      return friends;
    } catch (error) {
      console.error('Error syncing contacts:', error);
      throw error;
    }
  }

  /**
   * Find users by phone numbers
   */
  private async findUsersByPhoneNumbers(phoneNumbers: string[]): Promise<Friend[]> {
    if (phoneNumbers.length === 0) return [];

    const friends: Friend[] = [];

    // Firestore 'in' queries are limited to 10 items, so batch them
    const batchSize = 10;
    for (let i = 0; i < phoneNumbers.length; i += batchSize) {
      const batch = phoneNumbers.slice(i, i + batchSize);

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phoneNumber', 'in', batch));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        friends.push({
          userId: doc.id,
          phoneNumber: data.phoneNumber,
          displayName: data.displayName,
          photoURL: data.photoURL,
          addedAt: data.createdAt?.toDate() || new Date(),
        });
      });
    }

    return friends;
  }

  /**
   * Get friends for current user
   */
  async getFriends(): Promise<Friend[]> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user signed in');
      }

      // Get user's contacts
      const contacts = currentUser.contacts || [];

      // Find friends
      return await this.findUsersByPhoneNumbers(contacts);
    } catch (error) {
      console.error('Error getting friends:', error);
      throw error;
    }
  }
}

export const contactsService = new ContactsService();
