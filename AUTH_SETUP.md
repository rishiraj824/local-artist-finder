# Authentication & Contact Sync Setup

This document describes the authentication flow and contact syncing implementation.

## Authentication Flow

### 1. Phone Authentication Screen
**File:** `src/screens/auth/PhoneAuthScreen.tsx`

- User enters their phone number
- Phone number is formatted as (XXX) XXX-XXXX
- On submit, sends verification code via Firebase Auth
- Automatically adds +1 prefix for US numbers

**Features:**
- Real-time phone number formatting
- Input validation
- Loading states
- Error handling with alerts

### 2. Verification Code Screen
**File:** `src/screens/auth/VerificationCodeScreen.tsx`

- User enters 6-digit verification code
- Auto-focuses next input as user types
- Auto-verifies when all 6 digits entered
- Option to resend code if not received

**Features:**
- 6 separate input fields for better UX
- Auto-focus and backspace handling
- Resend code functionality
- Back button to change phone number

### 3. Contacts Sync Screen
**File:** `src/screens/auth/ContactsSyncScreen.tsx`

- Optional screen after authentication
- Explains benefits of contact syncing
- Requests contacts permission
- Finds friends who are using the app
- Shows count of friends found

**Features:**
- Permission request handling
- Loading states during sync
- Skip option for users who don't want to sync
- Privacy information

## Navigation Flow

The navigation flow is controlled in `src/navigation/AppNavigator.tsx`:

```
Not Authenticated:
  PhoneAuth → VerificationCode → ContactsSync → Main App

Already Authenticated:
  Main App (Events Screen)
```

**State Management:**
- Auth state tracked in AuthContext
- Local state for auth step (phone/code/contacts)
- Conditionally renders screens based on auth status

## Services

### Auth Service
**File:** `src/services/authService.ts`

Methods:
- `sendVerificationCode(phoneNumber)` - Send SMS code
- `verifyCode(code)` - Verify code and sign in
- `getCurrentUser()` - Get user profile from Firestore
- `signOut()` - Sign out current user

### Contacts Service
**File:** `src/services/contactsService.ts`

Methods:
- `requestPermission()` - Request contacts access
- `getPhoneContacts()` - Get all phone contacts
- `syncContactsAndFindFriends()` - Sync contacts and find friends on app
- `getFriends()` - Get current user's friends list

## Firebase Configuration

### Authentication
- Uses Firebase Phone Auth
- Requires reCAPTCHA verification in web/production
- Auto-creates user profile in Firestore on first sign-in

### Firestore Collections

**users collection:**
```typescript
{
  id: string,
  phoneNumber: string,
  displayName?: string,
  photoURL?: string,
  createdAt: Date,
  contacts: string[] // Array of phone numbers
}
```

## Security

### API Keys
- All third-party API keys moved to backend
- Client config.ts only contains backend API URL
- API keys stored in backend .env file

### Firestore Rules
Rules in `firestore.rules`:
- All operations require authentication
- Users can only read/write their own data
- Phone numbers used for friend matching

## Testing the Auth Flow

### 1. Start Backend Server
```bash
cd ../local-artist-finder-backend
npm install
npm run dev
```

### 2. Configure Firebase
Ensure Firebase is properly configured:
- Enable Phone Authentication in Firebase Console
- Add your app to Firebase project
- Download and add service account key to backend

### 3. Test on Device
For physical device testing:
1. Find your computer's IP: `ipconfig getifaddr en0` (Mac)
2. Update `src/config.ts`:
   ```typescript
   backendApiUrl: 'http://192.168.x.x:3000/api'
   ```
3. Ensure both device and computer are on same network

### 4. Phone Auth Notes
- In development, Firebase may provide test phone numbers
- For production, you'll need to set up proper reCAPTCHA
- SMS rates apply based on Firebase plan

## Troubleshooting

### "Not authenticated" errors
- Verify Firebase Auth is initialized
- Check auth token is being sent in headers
- Ensure user is signed in before accessing protected features

### Contacts permission denied
- Check app permissions in device settings
- On iOS, ensure NSContactsUsageDescription in Info.plist
- On Android, ensure READ_CONTACTS permission in manifest

### Backend connection issues
- Verify backend server is running
- Check backendApiUrl is correct
- Ensure no firewall blocking connections
- For device testing, use computer's IP not localhost

## Environment Variables

### Frontend (.env) - Not needed anymore
API keys have been moved to backend for security.

### Backend (.env)
```env
PORT=3000
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
EDM_TRAIN_API_KEY=your_api_key
ALLOWED_ORIGINS=http://localhost:8081,exp://localhost:8081
```

## Features

### Social Features
After authentication and contact sync, users can:
- See which friends are going to events
- View friends' endorsements
- Discover events through friends' activity
- Get notified when friends join

### Privacy
- Contacts are only used for friend matching
- Phone numbers are hashed before comparison
- Users can skip contact sync
- No contact data stored on backend
