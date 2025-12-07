# OAuth Setup Guide (Google & Apple Sign-In)

This guide walks you through setting up Google and Apple Sign-In for the Local Artist Finder app.

## Prerequisites

- Firebase project created
- Apple Developer account (for Apple Sign-In)
- Google Cloud Console access (for Google Sign-In)

---

## 🔵 Google Sign-In Setup

### Step 1: Enable Google Sign-In in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. Click **Enable**
6. Set a support email
7. Click **Save**

### Step 2: Get OAuth Credentials

#### For iOS:

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Under **Your apps**, select your iOS app
3. Download `GoogleService-Info.plist`
4. Place it in the root directory of your project: `/local-artist-finder/GoogleService-Info.plist`

#### For Android:

1. In Firebase Console, go to **Project Settings**
2. Under **Your apps**, select your Android app
3. Download `google-services.json`
4. Place it in the root directory: `/local-artist-finder/google-services.json`

### Step 3: Get Web Client ID

1. In Firebase Console, go to **Project Settings**
2. Scroll down to **Your apps**
3. Find the **Web app** (if not created, add a web app)
4. Copy the **Web Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)

### Step 4: Configure Google Sign-In in Your App

Open `src/services/googleSignIn.ts` and update the `webClientId`:

```typescript
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: 'YOUR_WEB_CLIENT_ID_HERE', // Paste your Web Client ID here
    offlineAccess: true,
    hostedDomain: '',
    forceCodeForRefreshToken: true,
  });
};
```

### Step 5: Add SHA-1 Certificate (Android only)

For Android, you need to add your SHA-1 certificate fingerprint to Firebase:

```bash
# Get debug certificate fingerprint
cd android
./gradlew signingReport

# Or use keytool (macOS/Linux)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Copy the SHA-1 fingerprint, then:

1. Go to Firebase Console → Project Settings
2. Under **Your apps**, select Android app
3. Click **Add fingerprint**
4. Paste the SHA-1 fingerprint
5. Click **Save**

---

## 🍎 Apple Sign-In Setup

### Step 1: Configure Apple Developer Account

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select **Identifiers**
4. Find your App ID (or create one): `com.localartistfinder.app`
5. Check **Sign In with Apple** capability
6. Click **Save**

### Step 2: Create Services ID (for Web/Backend)

1. In Apple Developer Portal, go to **Identifiers**
2. Click **+** to create a new identifier
3. Select **Services IDs**
4. Register a Services ID (e.g., `com.localartistfinder.app.signin`)
5. Enable **Sign In with Apple**
6. Configure domains:
   - **Domains**: Your backend domain (e.g., `your-backend.com`)
   - **Return URLs**: Your Firebase auth domain (get from Firebase Console)
7. Click **Save**

### Step 3: Enable Apple Sign-In in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Authentication** → **Sign-in method**
3. Click on **Apple** provider
4. Click **Enable**
5. Enter your **Services ID** from Step 2
6. Optional: Upload your Apple Team ID and Key ID for advanced configuration
7. Click **Save**

### Step 4: Update Xcode Configuration (iOS)

When you run `npx expo prebuild`, Expo will automatically configure Apple Sign-In in your iOS project based on `app.json`.

Verify in Xcode:

1. Open `ios/local-artist-finder.xcworkspace` in Xcode
2. Select your target → **Signing & Capabilities**
3. Ensure **Sign In with Apple** capability is added
4. If not, click **+ Capability** and add **Sign In with Apple**

---

## 📱 Build the App with OAuth

Since you've added new native features (Google & Apple Sign-In), you need to rebuild the app:

### Option 1: EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Option 2: Local Development Build

```bash
# Generate native directories
npx expo prebuild

# For iOS
npx expo run:ios

# For Android
npx expo run:android
```

---

## 🧪 Testing OAuth

### Testing Google Sign-In:

1. **iOS Simulator**: Works with development builds
2. **Android Emulator**: Requires Google Play Services installed
3. **Physical Device**: Works on both iOS and Android

### Testing Apple Sign-In:

1. **iOS Simulator**: Works on iOS 13.0+
2. **Android**: Not available (Apple Sign-In is iOS-only)
3. **Physical Device**: Works on iOS 13.0+ devices

---

## 🔧 Troubleshooting

### Google Sign-In Issues

#### "DEVELOPER_ERROR" on Android

**Cause**: SHA-1 certificate not added to Firebase

**Fix**:
```bash
# Get your SHA-1
cd android && ./gradlew signingReport

# Add it to Firebase Console → Project Settings → Android app → Add fingerprint
```

#### "No user found" error

**Cause**: Web Client ID is incorrect or not configured

**Fix**: Double-check the Web Client ID in `src/services/googleSignIn.ts`

#### "Sign in failed" on iOS

**Cause**: `GoogleService-Info.plist` missing or incorrect

**Fix**: Download fresh `GoogleService-Info.plist` from Firebase and replace it

### Apple Sign-In Issues

#### "This app is not available in your country or region"

**Cause**: App not properly configured in Apple Developer Portal

**Fix**:
1. Verify App ID has Sign In with Apple enabled
2. Verify Services ID is configured with correct domains

#### "Invalid nonce" error

**Cause**: Nonce mismatch during authentication

**Fix**: This usually means the Firebase configuration is incorrect. Verify:
- Services ID is correct in Firebase Console
- Apple Team ID and Key ID are configured (if using advanced setup)

#### "Apple Sign-In button not showing"

**Cause**: Device doesn't support Apple Sign-In

**Fix**: Apple Sign-In requires iOS 13.0+ and physical device (or simulator with iOS 13.0+)

---

## 🔐 Security Best Practices

1. **Never commit credentials**:
   - Add to `.gitignore`:
     ```
     GoogleService-Info.plist
     google-services.json
     ```

2. **Rotate keys regularly**:
   - Rotate OAuth credentials every 6-12 months
   - Revoke old credentials after rotation

3. **Use environment-specific configs**:
   - Different Firebase projects for dev/staging/prod
   - Different OAuth credentials for each environment

4. **Monitor for suspicious activity**:
   - Set up Firebase Authentication alerts
   - Monitor failed sign-in attempts

---

## 📝 Configuration Checklist

### Google Sign-In:
- ✅ Google provider enabled in Firebase
- ✅ `GoogleService-Info.plist` downloaded (iOS)
- ✅ `google-services.json` downloaded (Android)
- ✅ Web Client ID added to `googleSignIn.ts`
- ✅ SHA-1 certificate added to Firebase (Android)
- ✅ App rebuilt with `eas build` or `expo prebuild`

### Apple Sign-In:
- ✅ Sign In with Apple enabled in App ID
- ✅ Services ID created and configured
- ✅ Apple provider enabled in Firebase
- ✅ Services ID added to Firebase
- ✅ `usesAppleSignIn: true` in `app.json`
- ✅ App rebuilt with `eas build` or `expo prebuild`

---

## 🎯 Next Steps

After completing this setup:

1. Test all three auth methods (Phone, Google, Apple)
2. Verify user profiles are created in Firestore
3. Test auth flow on both iOS and Android devices
4. Set up production OAuth credentials before app launch
5. Configure Firebase Authentication settings:
   - Email verification (optional)
   - Password reset (for future email/password auth)
   - Authorized domains

---

## 📚 Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Google Sign-In for React Native](https://github.com/react-native-google-signin/google-signin)
- [Expo Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
- [Apple Sign In with Firebase](https://firebase.google.com/docs/auth/ios/apple)
- [OAuth 2.0 Best Practices](https://oauth.net/2/oauth-best-practice/)

---

## 💬 Support

If you encounter issues:

1. Check Firebase Authentication logs
2. Review device logs (Xcode Console / Android Logcat)
3. Verify all configuration files are in place
4. Ensure OAuth credentials match between Firebase and native configs
5. Test on a physical device (some features don't work on simulators)

For platform-specific help:
- **Google**: [Google Sign-In Troubleshooting](https://developers.google.com/identity/sign-in/ios/troubleshooting)
- **Apple**: [Apple Sign-In Troubleshooting](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api/verifying_a_user)
