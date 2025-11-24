import {
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types/social';

export class AuthService {
  private verificationId: string | null = null;

  /**
   * Send verification code to phone number
   */
  async sendVerificationCode(phoneNumber: string): Promise<void> {
    try {
      // Note: In production, you'll need to set up reCAPTCHA for web
      // For React Native, use @react-native-firebase/auth instead
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      this.verificationId = confirmation.verificationId;
      console.log('Verification code sent to:', phoneNumber);
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      throw new Error(error.message || 'Failed to send verification code');
    }
  }

  /**
   * Verify code and sign in user
   */
  async verifyCode(code: string): Promise<FirebaseUser> {
    try {
      if (!this.verificationId) {
        throw new Error('No verification ID found. Please request a code first.');
      }

      const credential = PhoneAuthProvider.credential(this.verificationId, code);
      const userCredential = await signInWithCredential(auth, credential);

      // Create or update user profile in Firestore
      await this.createOrUpdateUserProfile(userCredential.user);

      return userCredential.user;
    } catch (error: any) {
      console.error('Error verifying code:', error);
      throw new Error(error.message || 'Invalid verification code');
    }
  }

  /**
   * Create or update user profile in Firestore
   */
  private async createOrUpdateUserProfile(firebaseUser: FirebaseUser): Promise<void> {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create new user profile
      const newUser: Omit<User, 'id'> = {
        phoneNumber: firebaseUser.phoneNumber || '',
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
        contacts: [],
      };

      await setDoc(userRef, {
        ...newUser,
        createdAt: serverTimestamp(),
      });
      console.log('Created new user profile');
    } else {
      // Update existing user
      await updateDoc(userRef, {
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      });
      console.log('Updated user profile');
    }
  }

  /**
   * Get current user from Firestore
   */
  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return null;

    return {
      id: userDoc.id,
      ...userDoc.data(),
    } as User;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: Partial<Pick<User, 'displayName' | 'photoURL'>>): Promise<void> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error('No user signed in');

    const userRef = doc(db, 'users', firebaseUser.uid);
    await updateDoc(userRef, updates);
  }

  /**
   * Update user contacts list
   */
  async updateUserContacts(phoneNumbers: string[]): Promise<void> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error('No user signed in');

    const userRef = doc(db, 'users', firebaseUser.uid);
    await updateDoc(userRef, {
      contacts: phoneNumbers,
    });
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    await signOut(auth);
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Check if user is signed in
   */
  isSignedIn(): boolean {
    return !!auth.currentUser;
  }

  /**
   * Get current Firebase user
   */
  getCurrentFirebaseUser(): FirebaseUser | null {
    return auth.currentUser;
  }
}

export const authService = new AuthService();
