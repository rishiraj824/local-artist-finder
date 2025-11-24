import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService } from '../services/authService';
import { User } from '../types/social';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  signIn: (phoneNumber: string, code: string) => Promise<void>;
  sendCode: (phoneNumber: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange(async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        // Load user profile from Firestore
        const userProfile = await authService.getCurrentUser();
        setUser(userProfile);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const sendCode = async (phoneNumber: string) => {
    await authService.sendVerificationCode(phoneNumber);
  };

  const signIn = async (phoneNumber: string, code: string) => {
    await authService.verifyCode(code);
    // User state will be updated via onAuthStateChange
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setFirebaseUser(null);
  };

  const value = {
    firebaseUser,
    user,
    loading,
    signIn,
    sendCode,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
