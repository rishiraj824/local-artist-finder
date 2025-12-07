# Backend Server Setup Guide

## What's Been Done

1. **Created backend server** with phone authentication endpoints
2. **Fixed Google Sign-In error** - updated `authService.ts:166` to pass both idToken and accessToken
3. **Updated phone auth** - now uses backend API instead of web Firebase SDK

## Next Steps to Complete Setup

### 1. Download Firebase Service Account Key

1. Open Firebase Console: https://console.firebase.google.com/project/local-artist-discovery/settings/serviceaccounts/adminsdk
2. Click **"Generate New Private Key"**
3. Save the downloaded JSON file as `serviceAccountKey.json` in the `backend/` directory

### 2. Start the Backend Server

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:3000`

### 3. Test the Setup

Once the backend is running, you can test:

#### Phone Authentication Flow:
1. Open your app on iOS simulator/device
2. Enter a phone number and tap "Send Verification Code"
3. Check the terminal running the backend server - you'll see the verification code logged
4. Enter the code in your app

#### Google Sign-In:
1. Tap "Continue with Google"
2. Sign in with your Google account
3. Should now work without the `auth/argument-error`

## Development Notes

- **Verification codes** are logged in the backend terminal during development
- **Phone auth** uses mock verification codes stored in Firestore
- **For production**, you'll need to integrate an SMS service (Twilio, AWS SNS, etc.)

## Troubleshooting

### Backend won't start
- Make sure `serviceAccountKey.json` exists in the `backend/` directory
- Check that the file has the correct Firebase project ID

### Phone auth fails
- Ensure backend is running on `http://localhost:3000`
- Check backend terminal for error messages
- Verify phone number is in E.164 format (+1234567890)

### Testing on physical device
- Update `src/config.ts` to use your computer's local IP instead of `localhost`:
  ```typescript
  backendApiUrl: 'http://192.168.1.XXX:3000/api'
  ```
- Replace `192.168.1.XXX` with your actual IP address
- You can find your IP with: `ifconfig | grep "inet "`
