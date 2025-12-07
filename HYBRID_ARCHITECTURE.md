# Hybrid Architecture Implementation

This document describes the hybrid architecture implemented for the Local Artist Finder app, where social features use direct Firestore access while third-party API calls go through a backend service.

## Architecture Overview

### Client → Firestore (Direct Access)
The following features interact directly with Firestore from the client:
- **Endorsements** - Users can endorse events and artists
- **Votes** - Users can vote on events (interested/going)
- **Contacts & Friends** - Contact syncing and friend discovery
- **User Profiles** - User authentication and profile management

### Client → Backend → Third-party APIs
The following features go through the backend API:
- **Spotify API** - Artist search, top tracks, artist details
- **EDM Train API** - Event listings, locations, city-based events

## File Structure

### Client Services
- `src/services/endorsementsService.ts` - Direct Firestore operations for endorsements
- `src/services/votesService.ts` - Direct Firestore operations for votes
- `src/services/contactsService.ts` - Direct Firestore operations for contacts
- `src/services/authService.ts` - Firebase Auth and user profile management
- `src/services/spotifyApi.ts` - Calls backend API for Spotify data
- `src/services/edmTrainApi.ts` - Calls backend API for EDM Train data
- `src/services/musicService.ts` - Wrapper around spotifyApi

### Backend Services (../local-artist-finder-backend)
- `src/routes/musicRoutes.ts` - Spotify API endpoints
- `src/routes/eventsRoutes.ts` - EDM Train API endpoints
- `src/controllers/musicController.ts` - Spotify API logic
- `src/controllers/eventsController.ts` - EDM Train API logic
- `src/middleware/auth.ts` - Firebase Auth verification

## API Endpoints

### Backend Music API (Spotify)
- `GET /api/music/search?query={artistName}` - Search for artists
- `GET /api/music/artist/:id` - Get artist details
- `GET /api/music/artist/:id/top-tracks` - Get artist's top tracks
- `POST /api/music/artists-details` - Get multiple artists with details

### Backend Events API (EDM Train)
- `GET /api/events/default` - Get default events (LA & Miami)
- `GET /api/events/location/:locationId` - Get events by location ID
- `GET /api/events/city/:city` - Get events by city name
- `GET /api/events/locations` - Get all available locations

## Security

### Firestore Security Rules
Security rules are defined in `firestore.rules`:
- All operations require authentication
- Users can only create/update/delete their own endorsements and votes
- All authenticated users can read endorsements and votes
- User profiles are protected (users can only modify their own)

### Backend API Security
- All endpoints require Firebase Auth token in Authorization header
- Token verification is handled by `authenticateUser` middleware
- API keys for Spotify and EDM Train are stored securely on the backend

## Configuration

### Client Configuration
In `src/config.ts`, ensure `backendApiUrl` points to your backend:
```typescript
export const config = {
  backendApiUrl: 'http://localhost:3000/api', // or production URL
  // ...
};
```

### Backend Configuration
In `../local-artist-finder-backend/.env`:
```env
PORT=3000
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
EDM_TRAIN_API_KEY=your_api_key
ALLOWED_ORIGINS=http://localhost:8081,exp://localhost:8081
```

## Deployment Steps

### 1. Deploy Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```

### 2. Start Backend Service
```bash
cd ../local-artist-finder-backend
npm install
npm run dev  # Development
# or
npm start    # Production
```

### 3. Update Client Configuration
Ensure the client app's `backendApiUrl` points to your deployed backend URL.

### 4. Start Client App
```bash
cd local-artist-finder
npm start
```

## Benefits of This Architecture

1. **Security** - API keys are hidden on the backend, not exposed in the client
2. **Performance** - Direct Firestore access for real-time social features
3. **Scalability** - Backend can cache third-party API responses
4. **Cost** - Reduces Firestore read/write operations for social features
5. **Flexibility** - Easy to add backend logic (rate limiting, caching, etc.)

## Migration Notes

### Deprecated Backend Endpoints
The following endpoints are no longer used (social features moved to Firestore):
- `/api/endorsements/*` (deprecated)
- `/api/votes/*` (deprecated)

These routes have been removed from the backend routing.

### Components Updated
- `src/components/EndorseButton.tsx` - Now uses `endorsementsService`
- `src/components/VoteButton.tsx` - Now uses `votesService`
