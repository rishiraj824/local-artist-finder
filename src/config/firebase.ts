import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from '@env';

// Firebase configuration
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY || 'AIzaSyB15AqZwqEWZfG21AGOzTsP41zzk6Z0wRI',
  authDomain: FIREBASE_AUTH_DOMAIN || 'local-artist-discovery.firebaseapp.com',
  projectId: FIREBASE_PROJECT_ID || 'local-artist-discovery',
  storageBucket: FIREBASE_STORAGE_BUCKET || 'local-artist-discovery.firebasestorage.app',
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID || '165015050592',
  appId: FIREBASE_APP_ID || '1:165015050592:web:0d4e39acc980e27d5ae605',
  measurementId: 'G-9F3NBEQ3ZT',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
export const db = getFirestore(app);

export default app;
