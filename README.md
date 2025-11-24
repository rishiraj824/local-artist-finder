# Local Artist Finder

A React Native app that helps you discover local EDM events and explore the music of performing artists using the EDM Train API, with Spotify and SoundCloud integration.

## Features

- 🌍 **Location-based event discovery** - Automatically finds events in your city
- 🎵 **Music discovery** - Browse top tracks from performing artists
- 🔊 **In-app playback** - Listen to track previews directly in the app
- 🎟️ **Ticket purchasing** - Direct links to buy tickets for events
- 🌙 **Dark theme** - Beautiful dark UI with bright, readable text
- 🎨 **Multiple artists per event** - View all performing artists and their tracks
- 📊 **Sorted by popularity** - Tracks sorted by streams/views

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator, or Expo Go app on your phone

## API Keys Required

You'll need API keys from:
1. **EDM Train API** - https://edmtrain.com/api
2. **Spotify API** - https://developer.spotify.com/dashboard/
3. **SoundCloud API** - https://soundcloud.com/you/apps (optional, used as fallback)

## Setup

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd local-artist-finder
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API keys**:
   - Copy `.env.example` to create your own environment configuration
   - Open `src/config.ts` and replace the placeholder values with your actual API keys:

   ```typescript
   export const config = {
     edmTrainApiKey: 'YOUR_EDM_TRAIN_API_KEY',
     spotify: {
       clientId: 'YOUR_SPOTIFY_CLIENT_ID',
       clientSecret: 'YOUR_SPOTIFY_CLIENT_SECRET',
     },
     soundcloud: {
       clientId: 'YOUR_SOUNDCLOUD_CLIENT_ID',
     },
   };
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

5. **Run on your device**:
   - Press `i` for iOS Simulator (Mac only)
   - Press `a` for Android Emulator
   - Scan the QR code with Expo Go app on your phone

## Project Structure

```
local-artist-finder/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── EventCard.tsx   # Event display with tracks
│   │   └── TrackItem.tsx   # Individual track with playback
│   ├── navigation/         # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── screens/           # Main app screens
│   │   ├── EventsScreen.tsx
│   │   └── ArtistDetailsScreen.tsx
│   ├── services/          # API integrations
│   │   ├── edmTrainApi.ts
│   │   ├── spotifyApi.ts
│   │   ├── soundcloudApi.ts
│   │   ├── musicService.ts
│   │   └── locationService.ts
│   ├── theme/            # Styling and colors
│   │   ├── colors.ts
│   │   └── styles.ts
│   ├── types/            # TypeScript definitions
│   │   └── index.ts
│   └── config.ts         # API configuration
├── App.tsx              # Root component
└── package.json

```

## Usage

1. **Grant location permissions** when prompted - this allows the app to find events in your city
2. **Browse events** - See all upcoming EDM events in your area
3. **Explore artists** - Tap "Show Top Tracks" on any event to see music from performing artists
4. **Play tracks** - Tap the play button to listen to 30-second previews
5. **Buy tickets** - Tap the "Tickets" button to purchase tickets for events
6. **Search other cities** - Use the search bar to find events in different locations

## Technologies Used

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Native navigation
- **Expo Location** - Geolocation services
- **Expo AV** - Audio playback
- **Axios** - HTTP client for API requests
- **EDM Train API** - Event data
- **Spotify API** - Music streaming (primary)
- **SoundCloud API** - Music streaming (fallback)

## Notes

- Track previews are typically 30 seconds long
- Spotify is used as the primary music source, with SoundCloud as a fallback
- Some tracks may not have preview URLs available
- Location permissions are required for automatic city detection
- The app uses dark mode by default with bright, readable text colors

## Troubleshooting

- **No events showing**: Make sure your API keys are correctly configured
- **Location not working**: Ensure location permissions are granted in your device settings
- **Tracks not playing**: Some tracks don't have preview URLs - try other tracks
- **API errors**: Check that your API keys are valid and have the correct permissions

## License

ISC
