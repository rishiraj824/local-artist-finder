# Setup Instructions

## Quick Start - Adding Your API Keys

Before running the app, you need to configure your API keys.

### Step 1: Open the configuration file

Open `src/config.ts` in your editor.

### Step 2: Replace the placeholder values

Replace the empty strings with your actual API keys:

```typescript
export const config = {
  edmTrainApiKey: 'YOUR_EDM_TRAIN_API_KEY_HERE',
  spotify: {
    clientId: 'YOUR_SPOTIFY_CLIENT_ID_HERE',
    clientSecret: 'YOUR_SPOTIFY_CLIENT_SECRET_HERE',
  },
  soundcloud: {
    clientId: 'YOUR_SOUNDCLOUD_CLIENT_ID_HERE',
  },
};
```

### Step 3: Getting API Keys

#### EDM Train API
1. Go to https://edmtrain.com/api
2. Sign up for an account or log in
3. Navigate to your API dashboard
4. Copy your API key

#### Spotify API
1. Go to https://developer.spotify.com/dashboard/
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the app details (name, description)
5. Copy the **Client ID** and **Client Secret**

#### SoundCloud API (Optional - Fallback)
1. Go to https://soundcloud.com/you/apps
2. Log in with your SoundCloud account
3. Click "Register a new application"
4. Fill in the app details
5. Copy the **Client ID**

### Step 4: Run the app

```bash
npm start
```

Then press:
- `i` for iOS Simulator (Mac only)
- `a` for Android Emulator
- Or scan the QR code with Expo Go on your phone

## Important Notes

- **Never commit your API keys to version control** - they are in `.gitignore`
- The app will not work without at least the EDM Train and Spotify API keys
- SoundCloud is optional and used as a fallback if Spotify fails
- Make sure to grant location permissions when the app first launches

## Testing Without Real Keys

If you want to test the UI without real API keys, you can:
1. Comment out the API calls in the services
2. Return mock data instead
3. This will let you see the UI/UX without actual data

## Troubleshooting

**App crashes on startup:**
- Make sure all dependencies are installed: `npm install`
- Make sure API keys are properly formatted (strings in quotes)

**No events showing:**
- Verify your EDM Train API key is correct
- Check the console for error messages
- Try manually entering a major city (e.g., "Los Angeles", "New York")

**No music playing:**
- Verify your Spotify credentials are correct
- Make sure the artist exists on Spotify
- Some tracks may not have preview URLs available

**Location not working:**
- Grant location permissions when prompted
- On iOS Simulator, you may need to set a custom location
- Use the manual city search as a fallback
