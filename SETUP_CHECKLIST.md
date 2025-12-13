# Setup Checklist for Authentication

Use this checklist to ensure everything is configured correctly.

## Pre-Setup Verification

- [x] Firebase project exists: `local-artist-discovery`
- [x] Firebase credentials in `.env` file
- [x] Spotify credentials in `.env` file
- [x] Required npm packages installed

## Firebase Setup

### 1. Enable Google Authentication
- [ ] Go to [Firebase Console → Authentication](https://console.firebase.google.com/project/local-artist-discovery/authentication/providers)
- [ ] Enable Google provider
- [ ] Add support email
- [ ] Click Save

### 2. Create Firestore Database
- [ ] Go to [Firestore Database](https://console.firebase.google.com/project/local-artist-discovery/firestore)
- [ ] Click "Create database"
- [ ] Choose "Production mode"
- [ ] Select region: `us-central1` (or your preference)

### 3. Deploy Firestore Security Rules
```bash
# Run these commands:
firebase login
firebase init firestore  # Choose existing project: local-artist-discovery
firebase deploy --only firestore:rules
```
- [ ] Firestore rules deployed successfully

### 4. Download Configuration Files

#### iOS Configuration
- [ ] Go to [Firebase Console → Project Settings](https://console.firebase.google.com/project/local-artist-discovery/settings/general)
- [ ] Under "Your apps", find iOS app (Bundle ID: `com.localartistfinder.app`)
- [ ] If iOS app doesn't exist, click "Add app" and create it
- [ ] Download `GoogleService-Info.plist`
- [ ] Place file in project root: `/GoogleService-Info.plist`
- [ ] Verify file exists: `ls -la GoogleService-Info.plist`

#### Android Configuration
- [ ] In same Firebase Console page, find Android app
- [ ] Package name: `com.localartistfinder.app`
- [ ] If Android app doesn't exist, create it (you'll need SHA-1 later)
- [ ] Download `google-services.json`
- [ ] Place file in project root: `/google-services.json`
- [ ] Verify file exists: `ls -la google-services.json`

### 5. Get Web Client ID
- [ ] Go to [Firebase Console → Project Settings](https://console.firebase.google.com/project/local-artist-discovery/settings/general)
- [ ] Scroll to "Your apps"
- [ ] Find or add a Web app
- [ ] Copy the Web Client ID (format: `xxx.apps.googleusercontent.com`)
- [ ] Add to `.env` file:
```env
GOOGLE_WEB_CLIENT_ID=your_web_client_id_here
```
- [ ] Verify Web Client ID is in `.env`

### 6. Android SHA-1 Certificate (Android Only)
```bash
# Generate debug keystore if needed:
keytool -genkey -v -keystore ~/.android/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000

# Get SHA-1:
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
```
- [ ] Copy the SHA-1 fingerprint
- [ ] Go to Firebase Console → Android app → Add fingerprint
- [ ] Paste SHA-1 and save

## Spotify Setup

### 1. Configure Spotify App
- [ ] Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- [ ] Find or create app: "Local Artist Finder"
- [ ] Click "Edit Settings"
- [ ] Add Redirect URIs:
  - [ ] `localartistfinder://callback`
  - [ ] `exp://localhost:8081/--/callback`
- [ ] Click "Save"

### 2. Verify Credentials
- [ ] Spotify Client ID in `.env`
- [ ] Spotify Client Secret in `.env`

## Build & Test

### 1. Clean and Prebuild
```bash
# Clean any existing builds:
rm -rf ios android

# Prebuild native code:
npx expo prebuild
```
- [ ] iOS folder created
- [ ] Android folder created
- [ ] No errors during prebuild

### 2. iOS Build
```bash
# Navigate to iOS folder and install pods:
cd ios && pod install && cd ..

# Run on iOS:
npx expo run:ios
```
- [ ] iOS app builds successfully
- [ ] App launches in simulator
- [ ] Login screen appears

### 3. Android Build
```bash
# Run on Android:
npx expo run:android
```
- [ ] Android app builds successfully
- [ ] App launches in emulator
- [ ] Login screen appears

### 4. Test Google Sign-In

#### On iOS
- [ ] Tap "Continue with Google"
- [ ] Google sign-in sheet appears
- [ ] Select Google account
- [ ] Successfully redirects to Events screen
- [ ] User appears in [Firestore Console](https://console.firebase.google.com/project/local-artist-discovery/firestore/data/users)

#### On Android
- [ ] Tap "Continue with Google"
- [ ] Google sign-in appears
- [ ] Select Google account
- [ ] Successfully redirects to Events screen
- [ ] User appears in Firestore

### 5. Test Spotify Sign-In
- [ ] Tap "Continue with Spotify"
- [ ] Browser opens with Spotify login
- [ ] Login to Spotify
- [ ] Approve permissions
- [ ] Redirects back to app
- [ ] Successfully navigates to Events screen
- [ ] User appears in Firestore with `spotify_` prefix

### 6. Test Persistence
- [ ] Close app completely
- [ ] Reopen app
- [ ] Should auto-login (not show Login screen)
- [ ] User data loads correctly

### 7. Verify Firestore Data
- [ ] Go to [Firestore Console](https://console.firebase.google.com/project/local-artist-discovery/firestore)
- [ ] Check `users` collection exists
- [ ] User document has correct structure:
  ```
  {
    email: string
    displayName: string
    provider: 'google' or 'spotify'
    preferences: {
      exploredGenres: []
      savedEvents: []
      favoriteArtists: []
    }
    createdAt: timestamp
    updatedAt: timestamp
  }
  ```

## Troubleshooting

### If Google Sign-In Fails

#### "DEVELOPER_ERROR" (Android)
- [ ] Verify SHA-1 is added to Firebase Console
- [ ] Ensure package name is correct: `com.localartistfinder.app`
- [ ] Rebuild: `npx expo prebuild --clean && npx expo run:android`

#### "Sign in cancelled" (iOS)
- [ ] Verify `GoogleService-Info.plist` exists in project root
- [ ] Check file is properly formatted (open in text editor)
- [ ] Rebuild: `npx expo prebuild --clean && npx expo run:ios`

#### "No Web Client ID"
- [ ] Check `GOOGLE_WEB_CLIENT_ID` in `.env`
- [ ] Verify format: `xxx-xxx.apps.googleusercontent.com`
- [ ] Restart Metro bundler

### If Spotify Sign-In Fails

#### "Invalid redirect URI"
- [ ] Verify redirect URIs in Spotify dashboard:
  - `localartistfinder://callback`
  - `exp://localhost:8081/--/callback`
- [ ] Ensure no typos in URIs

#### Browser doesn't redirect back
- [ ] Check `scheme: "localartistfinder"` in `app.json`
- [ ] Rebuild app

### If Firestore Operations Fail

#### "Permission denied"
- [ ] Verify rules are deployed: `firebase deploy --only firestore:rules`
- [ ] Check user is authenticated before Firestore calls
- [ ] View rules in [Firestore Console → Rules](https://console.firebase.google.com/project/local-artist-discovery/firestore/rules)

## Final Verification

- [ ] Both Google and Spotify sign-in work
- [ ] User data appears in Firestore
- [ ] App persists authentication (auto-login works)
- [ ] No console errors during sign-in
- [ ] Navigation works correctly after login
- [ ] Sign-out works and returns to Login screen

## Production Checklist (When Ready)

- [ ] Update Firebase security rules if needed
- [ ] Add production redirect URIs to Spotify app
- [ ] Generate production keystores for Android
- [ ] Add production SHA-1/SHA-256 to Firebase
- [ ] Test on physical devices (iOS and Android)
- [ ] Review Firestore indexes for performance
- [ ] Set up Firebase Analytics (optional)
- [ ] Configure Firebase App Check (optional for security)

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Prebuild
npx expo prebuild

# Run iOS
npx expo run:ios

# Run Android
npx expo run:android

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Get SHA-1 (Android)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Clean build
rm -rf ios android && npx expo prebuild
```

## Resources

- [AUTHENTICATION_README.md](./AUTHENTICATION_README.md) - Quick start guide
- [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) - Detailed setup instructions
- [AUTHENTICATION_IMPLEMENTATION.md](./AUTHENTICATION_IMPLEMENTATION.md) - Technical details
- [Firebase Console](https://console.firebase.google.com/project/local-artist-discovery)
- [Spotify Dashboard](https://developer.spotify.com/dashboard)

---

**Status**:
- ✅ = Completed
- [ ] = Needs to be done

Mark items as you complete them to track your progress!
