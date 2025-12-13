# Authentication Implementation - Quick Start

## What Was Added

✅ **Google Sign-In** via Firebase Authentication
✅ **Spotify OAuth** via Expo AuthSession
✅ **User Profile Management** in Firestore
✅ **User Preferences Tracking** (genres, events, artists)
✅ **Persistent Authentication** with AsyncStorage
✅ **Secure Login Screen** with both providers

## Quick Setup (5 Steps)

### 1. Download Firebase Configuration Files

**iOS:**
1. Go to [Firebase Console](https://console.firebase.google.com/project/local-artist-discovery/settings/general)
2. Download `GoogleService-Info.plist` for iOS app
3. Place it in project root: `/GoogleService-Info.plist`

**Android:**
1. Download `google-services.json` for Android app
2. Place it in project root: `/google-services.json`

### 2. Update Environment Variables

Add to `.env`:
```env
GOOGLE_WEB_CLIENT_ID=your_web_client_id_here
```

Get the Web Client ID from [Firebase Console → Project Settings → Web app](https://console.firebase.google.com/project/local-artist-discovery/settings/general)

### 3. Enable Firestore in Firebase Console

1. Go to [Firestore Database](https://console.firebase.google.com/project/local-artist-discovery/firestore)
2. Click "Create database"
3. Start in production mode
4. Choose region (us-central1)

### 4. Deploy Firestore Security Rules

```bash
firebase login
firebase init firestore  # If not already initialized
firebase deploy --only firestore:rules
```

### 5. Build the App

```bash
# Generate native code
npx expo prebuild

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

## Project Structure

```
src/
├── config/
│   └── firebase.ts              # Firebase initialization
├── context/
│   └── AuthContext.tsx          # Auth state management
├── hooks/
│   └── useUserPreferences.ts    # User preferences hook
├── screens/
│   └── LoginScreen.tsx          # Login UI
├── services/
│   ├── authService.ts           # Google & Spotify auth
│   └── userService.ts           # Firestore operations
└── types/
    └── index.ts                 # User & auth types

Configuration:
├── firestore.rules              # Firestore security rules
├── GoogleService-Info.plist     # iOS Firebase config (download)
├── google-services.json         # Android Firebase config (download)
└── .env                         # Environment variables
```

## How It Works

### Authentication Flow

```
User opens app
    ↓
Check if authenticated
    ↓
Not authenticated → Show Login Screen
    ↓
User taps "Continue with Google" or "Continue with Spotify"
    ↓
OAuth flow completes
    ↓
User profile created/updated in Firestore
    ↓
Navigate to main app
    ↓
Session persisted in AsyncStorage
```

### User Data Structure

```typescript
User {
  id: string                     // Firebase UID or spotify_{id}
  email: string
  displayName?: string
  photoURL?: string
  provider: 'google' | 'spotify'
  preferences: {
    exploredGenres: string[]     // Auto-tracked
    savedEvents: string[]        // User-saved
    favoriteArtists: string[]    // User-favorited
  }
}
```

## Using Authentication in Your Code

### Check if user is logged in

```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Text>Please log in</Text>;
  }

  return <Text>Welcome, {user?.displayName}!</Text>;
}
```

### Track user preferences

```typescript
import { useUserPreferences } from '../hooks/useUserPreferences';

function EventCard({ event }) {
  const { isEventSaved, addSavedEvent, removeSavedEvent } = useUserPreferences();

  const saved = isEventSaved(event.id);

  const handleToggleSave = async () => {
    if (saved) {
      await removeSavedEvent(event.id);
    } else {
      await addSavedEvent(event.id);
    }
  };

  return (
    <TouchableOpacity onPress={handleToggleSave}>
      <Text>{saved ? '❤️ Saved' : '🤍 Save'}</Text>
    </TouchableOpacity>
  );
}
```

### Sign out

```typescript
const { signOut } = useAuth();

const handleSignOut = async () => {
  await signOut();
  // User will be redirected to Login screen automatically
};
```

## Testing

### Test Google Sign-In
1. Open app on simulator/device
2. Tap "Continue with Google"
3. Select Google account
4. Should redirect to Events screen
5. Close and reopen app → should auto-login

### Test Spotify Sign-In
1. Tap "Continue with Spotify"
2. Browser opens for Spotify authorization
3. Login to Spotify
4. Should redirect back to app
5. Navigate to Events screen

### Verify in Firestore
1. Go to [Firestore Console](https://console.firebase.google.com/project/local-artist-discovery/firestore)
2. Check `users` collection
3. Should see user document created

## Common Issues

### "DEVELOPER_ERROR" on Android
- **Fix**: Add SHA-1 fingerprint to Firebase Console
- See [detailed instructions](./AUTHENTICATION_SETUP.md#step-6-add-sha-1-certificate-android-only)

### "No Web Client ID"
- **Fix**: Add `GOOGLE_WEB_CLIENT_ID` to `.env`
- Get it from Firebase Console → Settings → Web app

### "Invalid redirect URI" (Spotify)
- **Fix**: Add `localartistfinder://callback` to Spotify app settings
- Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

### "Permission denied" in Firestore
- **Fix**: Deploy Firestore rules with `firebase deploy --only firestore:rules`

## Documentation

📖 **[AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)**
Complete step-by-step setup guide with screenshots and troubleshooting

📋 **[AUTHENTICATION_IMPLEMENTATION.md](./AUTHENTICATION_IMPLEMENTATION.md)**
Technical implementation details and architecture decisions

## What's Tracked Automatically

Once users are authenticated, the app tracks:

1. **Explored Genres**: When user views a genre detail page
2. **Saved Events**: When user explicitly saves an event
3. **Favorite Artists**: When user marks an artist as favorite

All data is stored securely in Firestore and synced across devices.

## Next Steps

1. ✅ Complete the 5-step setup above
2. ✅ Test authentication on device/simulator
3. ✅ Verify user data in Firestore
4. 🔄 Add UI for viewing saved events
5. 🔄 Add UI for viewing explored genres
6. 🔄 Add profile screen with sign-out button

## Need Help?

- Check [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) for detailed instructions
- See [AUTHENTICATION_IMPLEMENTATION.md](./AUTHENTICATION_IMPLEMENTATION.md) for technical details
- Firebase Console: https://console.firebase.google.com/project/local-artist-discovery
- Spotify Dashboard: https://developer.spotify.com/dashboard

---

**Important**: Don't commit the following files to git (already in .gitignore):
- `GoogleService-Info.plist`
- `google-services.json`
- `serviceAccountKey.json`
