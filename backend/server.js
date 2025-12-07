require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
try {
  const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || 'local-artist-discovery',
  });

  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  console.error('Make sure you have downloaded the service account key from Firebase Console');
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

// ==================== AUTH MIDDLEWARE ====================

/**
 * Middleware to verify Firebase ID token
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

// ==================== PHONE AUTH ENDPOINTS ====================

/**
 * Send verification code to phone number
 * POST /api/auth/send-code
 * Body: { phoneNumber: string }
 */
app.post('/api/auth/send-code', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    // Validate phone number format (should be E.164 format: +1234567890)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)',
      });
    }

    // Firebase Admin SDK doesn't directly send SMS
    // For development, we'll generate a mock verification code and store it
    // In production, you would use Twilio, AWS SNS, or another SMS service
    const verificationId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // In production, you would:
    // 1. Generate a 6-digit code
    // 2. Store it in Firestore with expiry time
    // 3. Send SMS using Twilio/AWS SNS/etc.
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store verification code in Firestore (expires in 10 minutes)
    await db.collection('verificationCodes').doc(verificationId).set({
      phoneNumber,
      code: verificationCode,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)),
      verified: false,
    });

    console.log(`[DEV] Verification code for ${phoneNumber}: ${verificationCode}`);

    res.json({
      success: true,
      data: {
        verificationId,
        // In production, don't send the code in the response
        // This is only for development/testing
        devCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined,
      },
      message: 'Verification code sent successfully',
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send verification code',
    });
  }
});

/**
 * Verify code and create custom token
 * POST /api/auth/verify-code
 * Body: { verificationId: string, code: string }
 */
app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { verificationId, code } = req.body;

    if (!verificationId || !code) {
      return res.status(400).json({
        success: false,
        error: 'Verification ID and code are required',
      });
    }

    // Get verification code from Firestore
    const verificationDoc = await db.collection('verificationCodes').doc(verificationId).get();

    if (!verificationDoc.exists) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification ID',
      });
    }

    const verificationData = verificationDoc.data();

    // Check if already verified
    if (verificationData.verified) {
      return res.status(400).json({
        success: false,
        error: 'Verification code already used',
      });
    }

    // Check if expired
    if (verificationData.expiresAt.toDate() < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Verification code expired',
      });
    }

    // Verify code
    if (verificationData.code !== code) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code',
      });
    }

    // Mark as verified
    await db.collection('verificationCodes').doc(verificationId).update({
      verified: true,
    });

    const phoneNumber = verificationData.phoneNumber;

    // Check if user exists
    let uid;
    try {
      const userRecord = await auth.getUserByPhoneNumber(phoneNumber);
      uid = userRecord.uid;
    } catch (error) {
      // User doesn't exist, create new user
      const newUser = await auth.createUser({
        phoneNumber,
      });
      uid = newUser.uid;

      // Create user profile in Firestore
      await db.collection('users').doc(uid).set({
        phoneNumber,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        contacts: [],
      });
    }

    // Create custom token for the user
    const customToken = await auth.createCustomToken(uid);

    res.json({
      success: true,
      data: {
        customToken,
        uid,
      },
      message: 'Phone number verified successfully',
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify code',
    });
  }
});

// ==================== USER ENDPOINTS ====================

/**
 * Get user profile
 * GET /api/users/profile
 */
app.get('/api/users/profile', authenticateUser, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: userDoc.id,
        ...userDoc.data(),
      },
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get profile',
    });
  }
});

/**
 * Update user profile
 * PUT /api/users/profile
 * Body: { displayName?: string, photoURL?: string }
 */
app.put('/api/users/profile', authenticateUser, async (req, res) => {
  try {
    const { displayName, photoURL } = req.body;
    const updates = {};

    if (displayName !== undefined) updates.displayName = displayName;
    if (photoURL !== undefined) updates.photoURL = photoURL;

    await db.collection('users').doc(req.user.uid).update(updates);

    res.json({
      success: true,
      data: updates,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update profile',
    });
  }
});

// ==================== SPOTIFY INTEGRATION ====================

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// In-memory cache for Spotify access token
let spotifyAccessToken = null;
let spotifyTokenExpiry = 0;

// In-memory cache for artist/track data (simple LRU with max 100 items)
const musicCache = new Map();
const MAX_CACHE_SIZE = 100;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Get Spotify access token using client credentials flow
 */
async function getSpotifyAccessToken() {
  // Return cached token if still valid
  if (spotifyAccessToken && Date.now() < spotifyTokenExpiry) {
    return spotifyAccessToken;
  }

  try {
    const credentials = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    spotifyAccessToken = data.access_token;
    // Set expiry to 50 minutes (tokens last 1 hour)
    spotifyTokenExpiry = Date.now() + 50 * 60 * 1000;

    console.log('Spotify access token obtained successfully');
    return spotifyAccessToken;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    throw new Error('Failed to authenticate with Spotify');
  }
}

/**
 * Helper to manage cache
 */
function getCached(key) {
  const cached = musicCache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  musicCache.delete(key);
  return null;
}

function setCached(key, data) {
  // Simple LRU: if cache is full, delete oldest entry
  if (musicCache.size >= MAX_CACHE_SIZE) {
    const firstKey = musicCache.keys().next().value;
    musicCache.delete(firstKey);
  }
  musicCache.set(key, {
    data,
    expiry: Date.now() + CACHE_TTL,
  });
}

/**
 * Search for an artist
 * GET /api/music/search?query=<artistName>
 */
app.get('/api/music/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required',
      });
    }

    // Check cache first
    const cacheKey = `search:${query.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const token = await getSpotifyAccessToken();

    const url = new URL(`${SPOTIFY_API_BASE_URL}/search`);
    url.searchParams.append('q', query);
    url.searchParams.append('type', 'artist');
    url.searchParams.append('limit', '1');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const artist = data.artists.items.length > 0 ? data.artists.items[0] : null;

    // Cache the result
    setCached(cacheKey, artist);

    res.json({
      success: true,
      data: artist,
      cached: false,
    });
  } catch (error) {
    console.error('Error searching for artist:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to search for artist',
    });
  }
});

/**
 * Get artist's top tracks
 * GET /api/music/artist/:id/top-tracks?market=<market>
 */
app.get('/api/music/artist/:id/top-tracks', async (req, res) => {
  try {
    const { id } = req.params;
    const { market = 'US' } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Artist ID is required',
      });
    }

    // Check cache first
    const cacheKey = `tracks:${id}:${market}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const token = await getSpotifyAccessToken();

    const url = new URL(`${SPOTIFY_API_BASE_URL}/artists/${id}/top-tracks`);
    url.searchParams.append('market', market);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Cache the result
    setCached(cacheKey, data.tracks);

    res.json({
      success: true,
      data: data.tracks,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching artist top tracks:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch artist tracks',
    });
  }
});

/**
 * Get multiple artists' details with top tracks (batch operation)
 * POST /api/music/artists-details
 * Body: { artistNames: string[] }
 */
app.post('/api/music/artists-details', async (req, res) => {
  try {
    const { artistNames } = req.body;

    if (!artistNames || !Array.isArray(artistNames)) {
      return res.status(400).json({
        success: false,
        error: 'artistNames array is required',
      });
    }

    if (artistNames.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const token = await getSpotifyAccessToken();

    // Fetch all artists in parallel
    const results = await Promise.all(
      artistNames.map(async (artistName) => {
        try {
          // Check cache for artist
          const artistCacheKey = `search:${artistName.toLowerCase()}`;
          let artist = getCached(artistCacheKey);

          if (!artist) {
            // Search for artist
            const searchUrl = new URL(`${SPOTIFY_API_BASE_URL}/search`);
            searchUrl.searchParams.append('q', artistName);
            searchUrl.searchParams.append('type', 'artist');
            searchUrl.searchParams.append('limit', '1');

            const searchResponse = await fetch(searchUrl.toString(), {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (searchResponse.ok) {
              const searchData = await searchResponse.json();
              artist = searchData.artists.items.length > 0 ? searchData.artists.items[0] : null;
              if (artist) {
                setCached(artistCacheKey, artist);
              }
            }
          }

          if (!artist) {
            return null;
          }

          // Check cache for tracks
          const tracksCacheKey = `tracks:${artist.id}:US`;
          let topTracks = getCached(tracksCacheKey);

          if (!topTracks) {
            // Fetch top tracks
            const tracksUrl = new URL(`${SPOTIFY_API_BASE_URL}/artists/${artist.id}/top-tracks`);
            tracksUrl.searchParams.append('market', 'US');

            const tracksResponse = await fetch(tracksUrl.toString(), {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (tracksResponse.ok) {
              const tracksData = await tracksResponse.json();
              topTracks = tracksData.tracks;
              setCached(tracksCacheKey, topTracks);
            } else {
              topTracks = [];
            }
          }

          return {
            artist,
            topTracks,
          };
        } catch (error) {
          console.error(`Error fetching details for ${artistName}:`, error);
          return null;
        }
      })
    );

    // Filter out null results
    const validResults = results.filter((result) => result !== null);

    res.json({
      success: true,
      data: validResults,
    });
  } catch (error) {
    console.error('Error fetching artists details:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch artists details',
    });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ==================== ERROR HANDLING ====================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
