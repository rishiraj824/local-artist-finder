# Social Features Setup Guide

This guide explains how to set up and use the new social features: **Friend Discovery**, **Event Endorsements**, and **Vote to Attend**.

## Features Overview

### 1. **Phone-Based Authentication**
- Users sign in with their phone number
- SMS verification code authentication via Firebase Auth

### 2. **Friend Discovery (Phone Contacts)**
- Automatically find friends who are also using the app
- No friend requests needed - just sync your contacts
- See which friends are going to events

### 3. **Event Endorsements**
- Endorse events and artists you love
- Add comments explaining why you recommend them
- See which friends have endorsed events/artists

### 4. **Vote to Attend**
- Mark yourself as "Interested" or "Going" to events
- See how many friends are attending
- Coordinate with friends on which events to attend together

---

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `local-artist-finder` (or your choice)
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

### Step 2: Add Web App to Firebase

1. In your Firebase project, click the **Web icon** `</>`
2. Register app with nickname: `Local Artist Finder Web`
3. **Copy the Firebase config object** - you'll need this!

It looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 3: Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Phone** provider:
   - Click on "Phone"
   - Toggle "Enable"
   - Click "Save"

### Step 4: Create Firestore Database

1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Select **Production mode** (we'll set rules next)
4. Choose database location (closest to your users)
5. Click "Enable"

### Step 5: Set Firestore Security Rules

Go to **Firestore Database > Rules** and paste these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isOwner(userId);
      allow delete: if false;
    }

    // Endorsements collection
    match /endorsements/{endorsementId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update: if false;
      allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }

    // Event votes collection
    match /event_votes/{voteId} {
      allow read: if isSignedIn();
      allow create, update: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }
  }
}
```

Click **Publish** to save the rules.

### Step 6: Configure Firebase in Your App

Open `src/config/firebase.ts` and update with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

**Option 1: Hardcode (Quick Start)**
Replace the values directly in `firebase.ts`

**Option 2: Environment Variables (Recommended)**
1. Add to your `.env` file:
```env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

2. The `firebase.ts` file already reads from `process.env`

---

## Testing the Features

### 1. Build and Run the App

```bash
# Start the development server
npx expo start

# Or run on specific platform
npx expo start --ios
npx expo start --android
```

### 2. Test Authentication

**Note:** Phone authentication with Firebase requires a real device for SMS. For development:

**Option A: Use Firebase Test Phone Numbers**
1. Go to Firebase Console > Authentication > Sign-in method > Phone
2. Scroll to "Phone numbers for testing"
3. Add a test phone number (e.g., `+1 555-123-4567`) with code `123456`
4. Use this number in the app - no SMS will be sent

**Option B: Use Real Device**
- Build the app with `eas build` or use Expo Go
- Test with your real phone number
- You'll receive actual SMS codes

### 3. Test Friend Discovery

1. Create multiple test accounts (different phone numbers)
2. Add these numbers to your phone's contacts
3. In the app, go to the Friends/Profile screen
4. Tap "Sync Contacts"
5. Your friends who have accounts will appear

### 4. Test Voting

1. Browse to an event in the Events list
2. Scroll down to see the voting buttons:
   - **⭐ Interested** - You're interested but not committed
   - **✓ Going** - You're definitely attending
3. Tap a button to vote
4. If friends have also voted, you'll see "👥 X friends interested"
5. Tap to expand and see which friends are going

### 5. Test Endorsements

1. Browse to an event
2. Scroll to the endorsement button (🤍)
3. Tap to endorse
4. Add an optional comment: "This artist is amazing! Must see!"
5. Submit
6. The button changes to ❤️ Endorsed
7. Friends will see your endorsement with your comment

---

## Architecture Overview

### Services

**`authService.ts`** - Phone authentication
- Send verification codes
- Verify codes and sign in
- Manage user profiles in Firestore

**`contactsService.ts`** - Friend discovery
- Request contacts permission
- Sync phone contacts
- Find friends in Firestore by phone number

**`endorsementService.ts`** - Endorsements
- Endorse events and artists
- Add comments
- View friends' endorsements

**`votingService.ts`** - Voting
- Vote "interested" or "going" on events
- Get vote summaries
- See which friends are attending

### Components

**`VoteButton.tsx`** - Voting UI
- Displays "Interested" and "Going" buttons
- Shows vote counts
- Lists friends attending

**`EndorseButton.tsx`** - Endorsement UI
- Endorse button with modal for comments
- Shows endorsement count
- Lists friends' endorsements

**`AuthContext.tsx`** - Authentication state
- Provides `user` object throughout app
- Manages sign in/out
- Handles auth state changes

### Firestore Collections

**`users/`** - User profiles
```typescript
{
  id: string,
  phoneNumber: string,
  displayName?: string,
  photoURL?: string,
  contacts: string[],  // Phone numbers from contacts
  createdAt: timestamp
}
```

**`endorsements/`** - Event/artist endorsements
```typescript
{
  id: string,
  userId: string,
  userName: string,
  type: 'event' | 'artist',
  targetId: string,  // Event ID or Artist ID
  targetName: string,
  comment?: string,
  createdAt: timestamp,
  // Event-specific
  eventDate?: string,
  venueName?: string,
  // Artist-specific
  genres?: string[],
  spotifyUrl?: string
}
```

**`event_votes/`** - Event attendance votes
```typescript
{
  id: string,  // Format: userId_eventId
  eventId: string,
  eventName: string,
  eventDate: string,
  venueName: string,
  userId: string,
  userName: string,
  status: 'interested' | 'going' | 'not_going',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## Permissions

The app requires these permissions:

### iOS (`ios.infoPlist` in app.json)
- `NSContactsUsageDescription` - Access contacts to find friends

### Android (`android.permissions` in app.json)
- `READ_CONTACTS` - Access contacts to find friends

These are already configured in `app.json`.

---

## Privacy & Security

### User Data Collection
- **Phone numbers** - For authentication and friend discovery
- **Contacts** - To find friends (stored as phone numbers only)
- **Names** - Optional display names
- **Endorsements & votes** - Visible to friends only

### Data Visibility
- Only users you're friends with (in your contacts) can see your votes and endorsements
- Your profile is visible to all signed-in users for friend discovery
- Your phone number is never displayed publicly

### Best Practices
1. **Update Privacy Policy** - Include:
   - Phone number collection
   - Contact access
   - How friend discovery works
   - Data retention policy

2. **GDPR Compliance** (if applicable):
   - Add data export functionality
   - Add account deletion
   - Add consent checkboxes

3. **Rate Limiting** - Add in Firebase:
   - Firestore > Settings > Quotas
   - Limit reads/writes per user

---

## Common Issues & Solutions

### Issue: "No verification ID found"
**Solution:** Make sure you call `sendCode()` before `verifyCode()`

### Issue: "Phone auth not working in development"
**Solution:** Use Firebase test phone numbers (see Testing section above)

### Issue: "Contacts permission denied"
**Solution:**
- Check `app.json` has correct permissions
- Rebuild the app after adding permissions
- On iOS: Settings > App > Allow Contacts

### Issue: "Firestore permission denied"
**Solution:**
- Check security rules are published
- Make sure user is signed in
- Check userId matches in security rules

### Issue: "Friends not showing up"
**Solution:**
- Both users must be signed in
- Phone numbers must match exactly (E.164 format)
- Users must have each other's numbers in contacts
- Try syncing contacts again

---

## Next Steps

### Optional Features to Add

1. **Profile Screen**
   - View your votes and endorsements
   - Edit display name and photo
   - Manage friends list

2. **Social Feed**
   - See friends' recent activity
   - Filter by endorsements/votes
   - Comment on endorsements

3. **Push Notifications**
   - Friend endorsed an event you're interested in
   - Friend is going to same event
   - New events from endorsed artists

4. **Event Groups**
   - Create groups for attending events together
   - Group chat
   - Split tickets/costs

5. **Artist Follow**
   - Follow artists to get notified of new events
   - See which friends follow same artists

---

## Troubleshooting Commands

```bash
# Clear Expo cache
npx expo start --clear

# Clear all caches and reinstall
rm -rf node_modules
npm install
npx expo start --clear

# Check Firebase connection
# Add console logs to firebase.ts to verify config loaded

# View Firestore data
# Go to Firebase Console > Firestore Database > Data tab
```

---

## Production Checklist

Before launching:
- [ ] Update Firebase security rules for production
- [ ] Set up Firebase App Check (prevent API abuse)
- [ ] Configure rate limiting
- [ ] Add analytics tracking
- [ ] Test with real phone numbers on real devices
- [ ] Update privacy policy
- [ ] Add GDPR compliance features (if needed)
- [ ] Test friend discovery with multiple accounts
- [ ] Test voting and endorsements
- [ ] Monitor Firestore usage and costs
- [ ] Set up Firebase alerts for errors

---

## Support

For issues with:
- **Firebase**: Check [Firebase Documentation](https://firebase.google.com/docs)
- **Expo Contacts**: Check [Expo Contacts Docs](https://docs.expo.dev/versions/latest/sdk/contacts/)
- **React Native Firebase**: Check [RNFB Docs](https://rnfirebase.io/)

## Cost Estimates

Firebase Free Tier (Spark Plan):
- **Authentication**: 10K verifications/month
- **Firestore**: 50K reads, 20K writes, 20K deletes per day
- **Storage**: 1GB

For most small apps, this is sufficient. Monitor usage in Firebase Console > Usage and billing.
