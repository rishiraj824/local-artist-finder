# Publishing Guide for Local Artist Finder

## Prerequisites

Before you begin, ensure you have:

1. **Apple Developer Account** - $99/year (for iOS)
   - Sign up at: https://developer.apple.com/programs/

2. **Google Play Console Account** - $25 one-time fee (for Android)
   - Sign up at: https://play.google.com/console/

3. **Expo Account** - Free
   - Sign up at: https://expo.dev/signup

## Step 1: Create App Icons and Splash Screen

You need to create three image files in the `assets/` folder:

### Required Assets:
- **icon.png** - 1024x1024px (app icon)
- **adaptive-icon.png** - 1024x1024px (Android adaptive icon)
- **splash.png** - 1284x2778px (splash screen)

### Quick Way to Generate Assets:
Use an online tool or design tool to create your app icon, then:

```bash
# Expo can generate all required sizes from a single icon
# Just create icon.png (1024x1024) and Expo will handle the rest
```

**Design Tips:**
- Use your app's purple/pink color scheme (#8B5CF6, #EC4899)
- Keep it simple - icons should be recognizable at small sizes
- Avoid text if possible
- Test on both light and dark backgrounds

## Step 2: Login to Expo

```bash
eas login
```

Enter your Expo credentials.

## Step 3: Configure Your Project

```bash
eas build:configure
```

This will:
- Link your project to your Expo account
- Update app.json with your project ID
- Set up build profiles

## Step 4: Update Environment Variables

Your app uses API keys that need to be securely stored. Create a file called `eas-secrets.json`:

```json
{
  "EDM_TRAIN_API_KEY": "your-edm-train-key",
  "SPOTIFY_CLIENT_ID": "your-spotify-client-id",
  "SPOTIFY_CLIENT_SECRET": "your-spotify-client-secret"
}
```

**Important:** Add this to .gitignore!

## Step 5: Build for iOS

### A. Build for App Store

```bash
eas build --platform ios --profile production
```

This will:
- Create a production build
- Take 10-20 minutes
- Generate an IPA file

### B. What You'll Need:
- Apple ID
- Apple Team ID (found in Apple Developer account)
- App-specific password (for automated submission)

## Step 6: Build for Android

```bash
eas build --platform android --profile production
```

This will:
- Create an APK file for production
- Take 10-20 minutes
- Generate an APK you can upload

**Alternative:** Build an AAB (recommended by Google Play):

Edit `eas.json` and change:
```json
"production": {
  "android": {
    "buildType": "aab"
  }
}
```

## Step 7: Test Your Builds

### iOS Testing (TestFlight):
```bash
eas submit --platform ios --profile production
```

This uploads to TestFlight for beta testing.

### Android Testing (Internal Track):
```bash
eas submit --platform android --profile production
```

This uploads to Google Play internal testing track.

## Step 8: Prepare App Store Listings

### For iOS (App Store Connect):

1. Go to https://appstoreconnect.apple.com
2. Create a new app
3. Fill out:
   - App name: "Local Artist Finder"
   - Bundle ID: com.localartistfinder.app
   - Description: Your app description
   - Keywords: "EDM, events, music, concerts, local, artists"
   - Category: Music or Entertainment
   - Screenshots (required):
     - iPhone 6.7" (1290x2796) - 3-10 screenshots
     - iPhone 5.5" (1242x2208) - 3-10 screenshots
     - iPad Pro (2048x2732) - 3-10 screenshots
   - Privacy Policy URL (required if collecting location)

### For Android (Google Play Console):

1. Go to https://play.google.com/console
2. Create a new app
3. Fill out:
   - App name: "Local Artist Finder"
   - Default language: English
   - App/Game: App
   - Free/Paid: Free
   - Description: Your app description
   - Category: Music & Audio
   - Screenshots (required):
     - Phone: 2-8 screenshots
     - 7" Tablet: 1-8 screenshots
     - 10" Tablet: 1-8 screenshots
   - Feature graphic: 1024x500
   - Privacy Policy URL (required if collecting location)

## Step 9: Submit for Review

### iOS:
```bash
eas submit --platform ios --profile production
```

Or manually upload the IPA through App Store Connect.

**Review time:** Usually 1-3 days

### Android:
```bash
eas submit --platform android --profile production
```

Or manually upload the APK/AAB through Google Play Console.

**Review time:** Usually a few hours to 1-2 days

## Step 10: Privacy & Compliance

### Privacy Policy (Required)
Create a privacy policy that covers:
- Location data collection
- How you use EDM Train API data
- Spotify integration
- Third-party services

You can use a generator:
- https://www.privacypolicygenerator.info/
- https://www.freeprivacypolicy.com/

### App Store Privacy Declarations:
- Location: "We use your location to find events near you"
- Internet: "Required for fetching event data"

## Step 11: Monitor & Update

After publishing:

### Update Version Numbers:
In `app.json`, increment:
```json
{
  "version": "1.0.1",  // User-facing version
  "ios": {
    "buildNumber": "2"  // iOS build number
  },
  "android": {
    "versionCode": 2    // Android version code
  }
}
```

### Build Updates:
```bash
# For both platforms
eas build --platform all --profile production

# Or separately
eas build --platform ios --profile production
eas build --platform android --profile production
```

## Useful Commands

```bash
# Check build status
eas build:list

# View build logs
eas build:view [build-id]

# Cancel a build
eas build:cancel [build-id]

# Download build artifacts
eas build:download [build-id]

# List all your projects
eas project:list

# View submission history
eas submit:list
```

## Common Issues & Solutions

### iOS Build Fails:
- Ensure bundleIdentifier is unique
- Check Apple Developer account is active
- Verify provisioning profile is valid

### Android Build Fails:
- Check package name is unique
- Ensure all permissions are declared
- Verify gradle configuration

### App Rejected:
- Read rejection reason carefully
- Common issues:
  - Missing privacy policy
  - Unclear location usage description
  - Incomplete metadata
  - Missing screenshots

## Cost Summary

- **iOS**: $99/year (Apple Developer)
- **Android**: $25 one-time (Google Play)
- **Expo**: Free (for basic builds)
- **Total First Year**: $124
- **Total Subsequent Years**: $99/year

## Next Steps After Publishing

1. **Monitor Analytics**
   - App Store Connect Analytics
   - Google Play Console Statistics

2. **Respond to Reviews**
   - Address user feedback
   - Fix reported bugs

3. **Plan Updates**
   - New features
   - Bug fixes
   - Performance improvements

4. **Marketing**
   - Share on social media
   - Submit to app review sites
   - Reach out to EDM communities

## Support & Resources

- Expo Docs: https://docs.expo.dev/
- EAS Build Docs: https://docs.expo.dev/build/introduction/
- EAS Submit Docs: https://docs.expo.dev/submit/introduction/
- App Store Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Guidelines: https://play.google.com/about/developer-content-policy/

## Quick Reference Commands

```bash
# Complete build and submit workflow
eas build --platform all --profile production
eas submit --platform ios --profile production
eas submit --platform android --profile production

# Preview build (for testing)
eas build --platform all --profile preview

# Check everything is configured
eas build:configure
```
