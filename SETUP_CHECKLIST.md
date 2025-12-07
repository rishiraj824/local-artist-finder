# Complete Setup Checklist

Follow these steps in order to get your app fully configured with authentication.

---

## Part 1: Firebase Setup

### ✅ Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add project** → **Create a project**
3. **Project name**: `Local Artist Finder`
4. **Project ID**: Will be auto-generated (e.g., `local-artist-finder-a1b2c`)
5. Enable Google Analytics (optional)
6. Click **Create project**

**Important**: Note your **Project ID** - you'll need it!

---

### ✅ Step 2: Add iOS App

1. In Firebase Console, click the **iOS** icon
2. **iOS bundle ID**: `com.localartistfinder.app`
3. **App nickname**: `Local Artist Finder iOS`
4. Click **Register app**
5. **Download** `GoogleService-Info.plist`
6. Move it to your project:
   ```bash
   mv ~/Downloads/GoogleService-Info.plist /Users/rishi/local-artist-finder/
   ```
7. Skip remaining Firebase setup steps (already done in code)

---

### ✅ Step 3: Add Android App

1. Click **Add app** → Select **Android**
2. **Android package name**: `com.localartistfinder.app`
3. **App nickname**: `Local Artist Finder Android`
4. Click **Register app**
5. **Download** `google-services.json`
6. Move it to your project:
   ```bash
   mv ~/Downloads/google-services.json /Users/rishi/local-artist-finder/
   ```
7. Skip remaining setup steps

---

### ✅ Step 4: Add Web App (for Google OAuth)

1. Click **Add app** → Select **Web** (</> icon)
2. **App nickname**: `Local Artist Finder Web`
3. **Do NOT** check Firebase Hosting
4. Click **Register app**
5. **Copy the Firebase configuration** (you'll need it next)

---

### ✅ Step 5: Get Web Client ID

1. Stay on the same screen, or go to **Project Settings** → **General**
2. Scroll to **Your apps** → Find the **Web app**
3. Copy the **Web client ID** (looks like: `123456789-abc123def.apps.googleusercontent.com`)

---

### ✅ Step 6: Enable Authentication Methods

1. Go to **Authentication** → **Sign-in method**
2. **Enable Phone**:
   - Click **Phone**
   - Toggle **Enable**
   - Click **Save**
3. **Enable Google**:
   - Click **Google**
   - Toggle **Enable**
   - Set support email
   - Click **Save**
4. **Enable Apple**:
   - Click **Apple**
   - Toggle **Enable**
   - Leave empty for now (we'll fill this after Apple setup)
   - Click **Save**

---

### ✅ Step 7: Update .env File

Open `/Users/rishi/local-artist-finder/.env` and fill in these values:

```bash
# Get these from Firebase Console -> Project Settings -> General -> Your apps -> Web app
FIREBASE_API_KEY=AIza...                                    # From firebaseConfig
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com           # From firebaseConfig
FIREBASE_PROJECT_ID=your-project-id                         # From firebaseConfig
FIREBASE_STORAGE_BUCKET=your-project.appspot.com            # From firebaseConfig
FIREBASE_MESSAGING_SENDER_ID=123456789                      # From firebaseConfig
FIREBASE_APP_ID=1:123456789:web:abc123                      # From firebaseConfig

# Get this from Firebase Console -> Project Settings -> General -> Your apps -> Web app
GOOGLE_WEB_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
```

**Where to find these values**:
- Firebase Console → **Project Settings** (gear icon) → **General** tab
- Scroll to **Your apps** section
- Find the **Web app** you created
- Click the config icon or "Config" to see the `firebaseConfig` object

---

## Part 2: Apple Developer Setup

### ✅ Step 8: Register App ID

1. Go to https://developer.apple.com/account
2. Sign in with your Apple Developer account
3. Navigate to **Certificates, Identifiers & Profiles**
4. Click **Identifiers** → Click **+** button
5. Select **App IDs** → Click **Continue**
6. **Description**: `Local Artist Finder`
7. **Bundle ID**: Select **Explicit** → Enter: `com.localartistfinder.app`
8. Under **Capabilities**, check ✅ **Sign In with Apple**
9. Click **Continue** → **Register**

---

### ✅ Step 9: Create Services ID

1. Go back to **Identifiers** → Click **+** button
2. Select **Services IDs** → Click **Continue**
3. **Description**: `Local Artist Finder Auth Service`
4. **Identifier**: `com.localartistfinder.app.signin`
5. Click **Continue** → **Register**

---

### ✅ Step 10: Configure Services ID

1. Click on the Services ID you just created (`com.localartistfinder.app.signin`)
2. Check ✅ **Sign In with Apple**
3. Click **Configure** next to Sign In with Apple
4. **Primary App ID**: Select `com.localartistfinder.app`
5. **Domains and Subdomains**: Enter your Firebase auth domain
   ```
   your-project.firebaseapp.com
   your-project.web.app
   ```
   (Replace `your-project` with your actual Firebase project ID from Step 1)

6. **Return URLs**: Enter Firebase auth handler
   ```
   https://your-project.firebaseapp.com/__/auth/handler
   ```
   (Replace `your-project` with your Firebase project ID)

7. Click **Save** → **Continue** → **Save**

---

### ✅ Step 11: Get Team ID

1. In Apple Developer Portal, click **Membership** (left sidebar)
2. Copy your **Team ID** (10-character code like `ABCD123456`)

---

### ✅ Step 12: Update Firebase with Apple Info

1. Go back to Firebase Console
2. Navigate to **Authentication** → **Sign-in method**
3. Click on **Apple** provider
4. Enter:
   - **Services ID**: `com.localartistfinder.app.signin`
   - **Apple Team ID**: Your Team ID from Step 11
5. Click **Save**

---

## Part 3: Android SHA-1 Certificate (Android Only)

### ✅ Step 13: Get SHA-1 Certificate

1. Generate debug keystore SHA-1:
   ```bash
   cd /Users/rishi/local-artist-finder
   npx expo prebuild
   cd android
   ./gradlew signingReport
   ```

2. Copy the **SHA1** fingerprint (looks like: `AA:BB:CC:DD:...`)

---

### ✅ Step 14: Add SHA-1 to Firebase

1. Go to Firebase Console → **Project Settings**
2. Scroll to **Your apps** → Select **Android app**
3. Click **Add fingerprint**
4. Paste the SHA-1 fingerprint
5. Click **Save**

---

## Part 4: Build the App

### ✅ Step 15: Install Dependencies

```bash
cd /Users/rishi/local-artist-finder
npm install
```

---

### ✅ Step 16: Generate Native Code

```bash
npx expo prebuild
```

This generates iOS and Android native code with all the plugins configured.

---

### ✅ Step 17: Build and Run

**For iOS**:
```bash
npx expo run:ios
```

**For Android**:
```bash
npx expo run:android
```

**Or use EAS Build** (recommended for production):
```bash
npm install -g eas-cli
eas build:configure
eas build --platform ios
eas build --platform android
```

---

## Verification Checklist

After completing all steps, verify:

### Firebase Console:
- ✅ iOS app added with `GoogleService-Info.plist` downloaded
- ✅ Android app added with `google-services.json` downloaded
- ✅ Web app added
- ✅ Phone authentication enabled
- ✅ Google authentication enabled
- ✅ Apple authentication enabled (with Services ID)
- ✅ SHA-1 certificate added (Android)

### Apple Developer Portal:
- ✅ App ID `com.localartistfinder.app` registered
- ✅ Sign In with Apple capability enabled on App ID
- ✅ Services ID `com.localartistfinder.app.signin` created
- ✅ Services ID configured with Firebase domains
- ✅ Team ID copied

### Local Files:
- ✅ `GoogleService-Info.plist` in project root
- ✅ `google-services.json` in project root
- ✅ `.env` file updated with Firebase credentials
- ✅ `.env` file updated with Google Web Client ID

---

## Quick Reference

### Your Identifiers

```
Firebase Project ID:    [Your project ID from Step 1]
iOS Bundle ID:          com.localartistfinder.app
Android Package:        com.localartistfinder.app
Apple App ID:           com.localartistfinder.app
Apple Services ID:      com.localartistfinder.app.signin
Apple Team ID:          [Your team ID from Step 11]

Firebase Auth Domain:   [your-project].firebaseapp.com
Firebase Return URL:    https://[your-project].firebaseapp.com/__/auth/handler
```

---

## Testing

After building the app:

1. **Test Phone Auth**:
   - Enter phone number → Receive SMS → Enter code → Success

2. **Test Google Sign-In**:
   - Tap "Continue with Google" → Select account → Success

3. **Test Apple Sign-In** (iOS only):
   - Tap "Continue with Apple" → Face ID/Touch ID → Success

All methods should create a user in Firebase Authentication and Firestore.

---

## Troubleshooting

### Firebase not found errors
- Make sure `GoogleService-Info.plist` and `google-services.json` are in project root
- Run `npx expo prebuild` again

### Google Sign-In fails on Android
- Verify SHA-1 certificate is added to Firebase
- Make sure you used the debug keystore SHA-1

### Apple Sign-In button not showing
- iOS 13.0+ required
- Run on physical device or iOS 13+ simulator

### "Web Client ID not found"
- Check `.env` file has `GOOGLE_WEB_CLIENT_ID`
- Restart Metro bundler: `npm start -- --reset-cache`

---

## Next Steps After Setup

1. Test all three auth methods
2. Deploy backend (see `DEPLOYMENT.md` in backend folder)
3. Update client config with backend URL
4. Test full app flow end-to-end
5. Set up production Firebase project for launch

---

## Need Help?

- Firebase: https://firebase.google.com/support
- Apple Developer: https://developer.apple.com/support/
- Expo: https://docs.expo.dev/

For detailed OAuth setup, see `OAUTH_SETUP.md`
