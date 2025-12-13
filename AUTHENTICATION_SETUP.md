# Authentication Setup Guide

This guide will help you set up Google and Spotify authentication for the Local Artist Finder app.

## Overview

The app supports two authentication methods:
- **Google Sign-In**: Uses Firebase Authentication with Google OAuth
- **Spotify OAuth**: Uses Spotify's OAuth 2.0 for direct Spotify login

Users can sign in with either method to track:
- Explored music genres
- Saved events they want to attend
- Favorite artists

## Prerequisites

- Firebase project created (should already exist: `local-artist-discovery`)
- Google Cloud Console access
- Spotify Developer account
- Expo CLI installed: `npm install -g expo-cli`

---

## Part 1: Firebase & Google Sign-In Setup

### Step 1: Enable Google Authentication in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `local-artist-discovery`
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. Toggle **Enable**
6. Set a support email
7. Click **Save**

### Step 2: Enable Firestore

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Start in **production mode**
4. Choose your region (e.g., `us-central1`)

### Step 3: Deploy Firestore Security Rules

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firestore (if not already done)
firebase init firestore

# Deploy the security rules
firebase deploy --only firestore:rules
```

The rules in `firestore.rules` ensure:
- Users can only read/write their own data
- All operations require authentication

### Step 4: Download Google Services Files

#### For iOS (GoogleService-Info.plist):

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Under **Your apps**, find your iOS app or add one:
   - Bundle ID: `com.localartistfinder.app`
3. Click **Download GoogleService-Info.plist**
4. Place it in the project root: `/GoogleService-Info.plist`

#### For Android (google-services.json):

1. In Firebase Console, under **Your apps**, find your Android app or add one:
   - Package name: `com.localartistfinder.app`
2. Click **Download google-services.json**
3. Place it in the project root: `/google-services.json`

### Step 5: Get Web Client ID

1. In Firebase Console, go to **Project Settings**
2. Scroll to **Your apps** section
3. Find or add a **Web app**
4. Copy the **Web Client ID** (format: `xxx-xxx.apps.googleusercontent.com`)
5. Update `.env` file:

```env
GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID_HERE
```

### Step 6: Add SHA-1 Certificate (Android Only)

For Android development builds:

```bash
# Generate debug keystore if it doesn't exist
keytool -genkey -v -keystore ~/.android/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000

# Get SHA-1 fingerprint
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Add the SHA-1 to Firebase:
1. Firebase Console → Project Settings
2. Under Android app, click **Add fingerprint**
3. Paste the SHA-1 fingerprint
4. Click **Save**

---

## Part 2: Spotify OAuth Setup

### Step 1: Create Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **Create app**
3. Fill in details:
   - **App name**: Local Artist Finder
   - **App description**: Discover local music events
   - **Redirect URIs**: Add these:
     ```
     localartistfinder://callback
     exp://localhost:8081/--/callback
     ```
4. Click **Save**

### Step 2: Get Spotify Credentials

1. In your Spotify app dashboard, copy:
   - **Client ID**
   - **Client Secret**
2. These should already be in your `.env` file:

```env
SPOTIFY_CLIENT_ID=68c5a42f94b44f4f9d70cbeb7f213dff
SPOTIFY_CLIENT_SECRET=70232e25e7024a16bc8387280697c9a5
```

### Step 3: Configure Redirect URIs

For production builds, you'll need to add additional redirect URIs:
- iOS: `localartistfinder://callback`
- Android: `localartistfinder://callback`

---

## Part 3: Building the App

Since we've added native authentication modules, you need to rebuild:

### Option 1: Development Build with Expo

```bash
# Prebuild native directories
npx expo prebuild

# For iOS
npx expo run:ios

# For Android
npx expo run:android
```

### Option 2: EAS Build (Production)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios --profile development

# Build for Android
eas build --platform android --profile development
```

---

## Part 4: Testing Authentication

### Testing Google Sign-In

1. **iOS Simulator**:
   - Works with development builds
   - Make sure you're signed into a Google account in Safari

2. **Android Emulator**:
   - Requires Google Play Services
   - Create an emulator with Play Store
   - Sign into Google account in emulator

3. **Physical Devices**:
   - Works on both iOS and Android
   - Recommended for final testing

### Testing Spotify Sign-In

1. **iOS/Android**:
   - Opens a web browser for OAuth
   - Redirects back to app after authorization
   - Test with your Spotify account

### Test User Flow

1. Open the app → should show Login screen
2. Tap "Continue with Google" → Google sign-in flow
3. After successful login → navigates to Events screen
4. Close app and reopen → should auto-login (persisted)
5. Test Spotify login similarly

---

## Part 5: Environment Variables

Ensure your `.env` file has all required variables:

```env
# EDM Train API
EDM_TRAIN_API_KEY=44285611-0590-491d-9320-4041b9c1c6cf

# Spotify
SPOTIFY_CLIENT_ID=68c5a42f94b44f4f9d70cbeb7f213dff
SPOTIFY_CLIENT_SECRET=70232e25e7024a16bc8387280697c9a5

# Firebase
FIREBASE_API_KEY=AIzaSyB15AqZwqEWZfG21AGOzTsP41zzk6Z0wRI
FIREBASE_AUTH_DOMAIN=local-artist-discovery.firebaseapp.com
FIREBASE_PROJECT_ID=local-artist-discovery
FIREBASE_STORAGE_BUCKET=local-artist-discovery.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=165015050592
FIREBASE_APP_ID=1:165015050592:web:0d4e39acc980e27d5ae605

# Google OAuth
GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID_HERE
```

---

## Troubleshooting

### Google Sign-In Issues

#### "DEVELOPER_ERROR" (Android)
- **Cause**: SHA-1 not added to Firebase or wrong package name
- **Fix**:
  1. Verify SHA-1 is added to Firebase Console
  2. Check package name matches: `com.localartistfinder.app`
  3. Rebuild the app after changes

#### "Sign in cancelled" (iOS)
- **Cause**: GoogleService-Info.plist not found or misconfigured
- **Fix**:
  1. Ensure `GoogleService-Info.plist` is in project root
  2. Run `npx expo prebuild --clean`
  3. Rebuild the app

#### "No Web Client ID"
- **Cause**: Missing `GOOGLE_WEB_CLIENT_ID` in .env
- **Fix**: Add the Web Client ID from Firebase Console

### Spotify Sign-In Issues

#### "Invalid redirect URI"
- **Cause**: Redirect URI not registered in Spotify dashboard
- **Fix**: Add `localartistfinder://callback` to Spotify app settings

#### Browser doesn't redirect back
- **Cause**: URL scheme not configured
- **Fix**: Ensure `scheme: "localartistfinder"` is in app.json

### Firestore Permission Denied

#### "Missing or insufficient permissions"
- **Cause**: Firestore rules not deployed or user not authenticated
- **Fix**:
  1. Deploy rules: `firebase deploy --only firestore:rules`
  2. Ensure user is signed in before making Firestore calls

---

## User Preferences Tracking

After authentication, the app automatically tracks:

### Explored Genres
- Automatically logged when user views a genre detail page
- Stored in Firestore: `users/{userId}/preferences.exploredGenres`

### Saved Events
- Users can save events they're interested in
- Stored in Firestore: `users/{userId}/preferences.savedEvents`

### Favorite Artists
- Users can mark artists as favorites
- Stored in Firestore: `users/{userId}/preferences.favoriteArtists`

### Using in Your Components

```typescript
import { useUserPreferences } from '../hooks/useUserPreferences';

function MyComponent() {
  const {
    exploredGenres,
    savedEvents,
    addSavedEvent,
    removeSavedEvent,
    isEventSaved,
  } = useUserPreferences();

  // Check if event is saved
  const isSaved = isEventSaved(eventId);

  // Save an event
  const handleSave = async () => {
    await addSavedEvent(eventId);
  };

  // Remove saved event
  const handleRemove = async () => {
    await removeSavedEvent(eventId);
  };
}
```

---

## Firebase Console Quick Links

- [Firebase Console](https://console.firebase.google.com/project/local-artist-discovery)
- [Authentication](https://console.firebase.google.com/project/local-artist-discovery/authentication/users)
- [Firestore Database](https://console.firebase.google.com/project/local-artist-discovery/firestore)
- [Project Settings](https://console.firebase.google.com/project/local-artist-discovery/settings/general)

---

## Security Best Practices

1. **Never commit sensitive files**:
   - `GoogleService-Info.plist`
   - `google-services.json`
   - `.env` (already in .gitignore)

2. **Firestore Rules**:
   - Always deploy rules before going to production
   - Test rules with Firebase Emulator Suite

3. **API Keys**:
   - Firebase API keys can be public (they're restricted by domain)
   - Spotify Client Secret should stay private (use backend proxy in production)

4. **OAuth Tokens**:
   - Tokens are stored securely in AsyncStorage
   - They're encrypted by the OS

---

## Next Steps

After setting up authentication:

1. Enable Firestore Authentication in Firebase Console
2. Deploy Firestore security rules
3. Download and add Google Services files
4. Update `.env` with Web Client ID
5. Add Spotify redirect URIs
6. Prebuild and run the app
7. Test both authentication methods
8. Verify user data is being stored in Firestore

For help, refer to:
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Expo Authentication Guide](https://docs.expo.dev/guides/authentication/)
- [Spotify OAuth Guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/)
