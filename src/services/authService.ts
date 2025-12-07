import {
  signInWithCustomToken,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { config } from "../config";
import { User } from "../types/social";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

const API_URL = config.backendApiUrl || "http://localhost:3000/api";

export class AuthService {
  private verificationId: string | null = null;

  /**
   * Send verification code to phone number via backend API
   */
  async sendVerificationCode(phoneNumber: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/auth/send-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send verification code");
      }

      this.verificationId = data.data.verificationId;

      // Log dev code for testing (only in development)
      if (data.data.devCode) {
        console.log("🔐 Development verification code:", data.data.devCode);
      }

      console.log("Verification code sent to:", phoneNumber);
    } catch (error: any) {
      console.error("Error sending verification code:", error);
      throw new Error(error.message || "Failed to send verification code");
    }
  }

  /**
   * Verify code and sign in user via backend API
   */
  async verifyCode(code: string): Promise<FirebaseUser> {
    try {
      if (!this.verificationId) {
        throw new Error(
          "No verification ID found. Please request a code first."
        );
      }

      // Verify code with backend
      const response = await fetch(`${API_URL}/auth/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verificationId: this.verificationId,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Invalid verification code");
      }

      // Sign in with custom token from backend
      const userCredential = await signInWithCustomToken(
        auth,
        data.data.customToken
      );

      // Note: Backend already created/updated the user profile
      // No need to do it again on the client side

      return userCredential.user;
    } catch (error: any) {
      console.error("Error verifying code:", error);
      throw new Error(error.message || "Invalid verification code");
    }
  }

  /**
   * Create or update user profile in Firestore
   */
  private async createOrUpdateUserProfile(
    firebaseUser: FirebaseUser
  ): Promise<void> {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create new user profile
      const newUser: Omit<User, "id"> = {
        phoneNumber: firebaseUser.phoneNumber || "",
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
        contacts: [],
      };

      await setDoc(userRef, {
        ...newUser,
        createdAt: serverTimestamp(),
      });
      console.log("Created new user profile");
    } else {
      // Update existing user
      await updateDoc(userRef, {
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      });
      console.log("Updated user profile");
    }
  }

  /**
   * Get current user from Firestore
   */
  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const userRef = doc(db, "users", firebaseUser.uid);
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
  async updateUserProfile(
    updates: Partial<Pick<User, "displayName" | "photoURL">>
  ): Promise<void> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error("No user signed in");

    const userRef = doc(db, "users", firebaseUser.uid);
    await updateDoc(userRef, updates);
  }

  /**
   * Update user contacts list
   */
  async updateUserContacts(phoneNumbers: string[]): Promise<void> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error("No user signed in");

    const userRef = doc(db, "users", firebaseUser.uid);
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

  /**
   * Sign in with Google
   */
  async signInWithGoogle(idToken: string): Promise<FirebaseUser> {
    try {
      const provider = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, provider);

      await this.createOrUpdateUserProfile(result.user);
      return result.user;
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      throw new Error(error.message || "Failed to sign in with Google");
    }
  }

  /**
   * Sign in with Apple (iOS only)
   */
  async signInWithApple(): Promise<FirebaseUser> {
    try {
      if (Platform.OS !== "ios") {
        throw new Error("Apple Sign-In is only available on iOS");
      }

      // Check if Apple Sign-In is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error("Apple Sign-In is not available on this device");
      }

      // Generate nonce for security
      const nonce = Math.random().toString(36).substring(2, 10);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );

      // Request Apple Sign-In
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      // Create Firebase credential
      const provider = new OAuthProvider("apple.com");
      const credential = provider.credential({
        idToken: appleCredential.identityToken!,
        rawNonce: nonce,
      });

      // Sign in with Firebase
      const result = await signInWithCredential(auth, credential);

      // Update user profile with Apple data if available
      if (appleCredential.fullName) {
        const displayName = [
          appleCredential.fullName.givenName,
          appleCredential.fullName.familyName,
        ]
          .filter(Boolean)
          .join(" ");

        if (displayName) {
          await this.updateUserProfile({ displayName });
        }
      }

      await this.createOrUpdateUserProfile(result.user);
      return result.user;
    } catch (error: any) {
      console.error("Error signing in with Apple:", error);
      if (error.code === "ERR_CANCELED") {
        throw new Error("Apple Sign-In was cancelled");
      }
      throw new Error(error.message || "Failed to sign in with Apple");
    }
  }
}

export const authService = new AuthService();
