# Setup Progress Checklist

## ✅ Completed

- [x] Firebase project created (`local-artist-discovery`)
- [x] Firebase web app added and Web Client ID obtained
- [x] Bundle ID updated to `com.discovery.localartist`
- [x] App ID registered in Apple Developer Portal

---

## 🔄 In Progress - Apple Developer Portal

### Step 1: Create Services ID
- [ ] Go to Identifiers → Click +
- [ ] Select Services IDs → Continue
- [ ] Description: `Local Artist Finder Auth Service`
- [ ] Identifier: `com.discovery.localartist.signin`
- [ ] Click Continue → Register

### Step 2: Configure Services ID
- [ ] Click on `com.discovery.localartist.signin`
- [ ] Check ✅ Sign In with Apple
- [ ] Click Configure
- [ ] Primary App ID: `com.discovery.localartist`
- [ ] Domains: `local-artist-discovery.firebaseapp.com` and `local-artist-discovery.web.app`
- [ ] Return URL: `https://local-artist-discovery.firebaseapp.com/__/auth/handler`
- [ ] Save → Continue → Save

### Step 3: Get Team ID
- [ ] Click Membership (left sidebar)
- [ ] Copy Team ID (10-character code)

---

## 📱 Firebase Configuration

### Step 4: Enable Apple Sign-In in Firebase
- [ ] Go to: https://console.firebase.google.com/project/local-artist-discovery/authentication/providers
- [ ] Click Apple provider → Enable
- [ ] Services ID: `com.discovery.localartist.signin`
- [ ] Team ID: [Your Team ID from Step 3]
- [ ] Save

### Step 5: Enable Other Auth Providers
- [ ] Enable Phone authentication
- [ ] Enable Google authentication (set support email)

### Step 6: Add iOS App
- [ ] Go to: https://console.firebase.google.com/project/local-artist-discovery/settings/general
- [ ] Click Add app → iOS
- [ ] Bundle ID: `com.discovery.localartist`
- [ ] App nickname: `Local Artist Finder iOS`
- [ ] Register app
- [ ] Download `GoogleService-Info.plist`
- [ ] Move to project root: `mv ~/Downloads/GoogleService-Info.plist /Users/rishi/local-artist-finder/`

### Step 7: Add Android App
- [ ] Click Add app → Android
- [ ] Package name: `com.discovery.localartist`
- [ ] App nickname: `Local Artist Finder Android`
- [ ] Register app
- [ ] Download `google-services.json`
- [ ] Move to project root: `mv ~/Downloads/google-services.json /Users/rishi/local-artist-finder/`

### Step 8: Add SHA-1 Certificate (Android)
- [ ] Generate native code: `npx expo prebuild`
- [ ] Get SHA-1: `cd android && ./gradlew signingReport`
- [ ] Copy SHA-1 fingerprint
- [ ] Firebase Console → Settings → Android app → Add fingerprint
- [ ] Paste SHA-1 → Save

---

## 🚀 Build & Test

### Step 9: Build the App
- [ ] Install dependencies: `npm install`
- [ ] Generate native code: `npx expo prebuild`
- [ ] Build iOS: `npx expo run:ios`
- [ ] Build Android: `npx expo run:android`

### Step 10: Test Authentication
- [ ] Test Phone authentication (SMS)
- [ ] Test Google Sign-In
- [ ] Test Apple Sign-In (iOS only)
- [ ] Verify user profiles created in Firestore

---

## Configuration Summary

**Bundle Identifier**: `com.discovery.localartist`

**Firebase Project**: `local-artist-discovery`

**Auth Methods**:
- Phone (SMS)
- Google Sign-In
- Apple Sign-In (iOS)

**Apple Developer**:
- App ID: `com.discovery.localartist`
- Services ID: `com.discovery.localartist.signin`

**Firebase Domains**:
- `local-artist-discovery.firebaseapp.com`
- `local-artist-discovery.web.app`

**Return URL**:
- `https://local-artist-discovery.firebaseapp.com/__/auth/handler`

**Google Web Client ID**:
- `165015050592-6k4etmo4kucruhfj9ih9i8sg24f0agnh.apps.googleusercontent.com`

---

## Quick Commands

```bash
# Move config files to project
mv ~/Downloads/GoogleService-Info.plist /Users/rishi/local-artist-finder/
mv ~/Downloads/google-services.json /Users/rishi/local-artist-finder/

# Build the app
cd /Users/rishi/local-artist-finder
npm install
npx expo prebuild

# Get SHA-1 for Android
cd android && ./gradlew signingReport

# Run the app
npx expo run:ios      # iOS
npx expo run:android  # Android
```

---

## Next: After Setup Complete

Once all checkboxes are ticked:
1. Deploy backend (see backend DEPLOYMENT.md)
2. Update client config with backend URL
3. Test full authentication flow
4. Test API calls to backend
5. Test social features (endorsements, votes)
