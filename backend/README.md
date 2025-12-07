# Local Artist Finder Backend

Backend API server for the Local Artist Finder app, handling phone authentication and user management.

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Firebase Admin SDK Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`local-artist-discovery`)
3. Go to **Project Settings** (gear icon) → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the downloaded JSON file as `serviceAccountKey.json` in the `backend/` directory

### 3. Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your configuration:
   ```env
   FIREBASE_PROJECT_ID=local-artist-discovery
   FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
   PORT=3000
   NODE_ENV=development
   ```

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
- **GET** `/api/health` - Check if server is running

### Authentication
- **POST** `/api/auth/send-code` - Send verification code to phone number
  ```json
  {
    "phoneNumber": "+1234567890"
  }
  ```

- **POST** `/api/auth/verify-code` - Verify code and get custom token
  ```json
  {
    "verificationId": "mock_123_abc",
    "code": "123456"
  }
  ```

### User Profile (Requires Authentication)
- **GET** `/api/users/profile` - Get current user profile
- **PUT** `/api/users/profile` - Update user profile
  ```json
  {
    "displayName": "John Doe",
    "photoURL": "https://example.com/photo.jpg"
  }
  ```

## Development Notes

### Phone Authentication Flow

1. Client calls `POST /api/auth/send-code` with phone number
2. Server generates a 6-digit code and stores it in Firestore
3. In development, the code is returned in the response (for testing)
4. In production, the code would be sent via SMS (Twilio, AWS SNS, etc.)
5. Client calls `POST /api/auth/verify-code` with verification ID and code
6. Server verifies the code and returns a custom Firebase token
7. Client uses the custom token to sign in with Firebase

### Adding SMS Service (Production)

To send real SMS in production, add one of these services:

**Twilio:**
```bash
npm install twilio
```

**AWS SNS:**
```bash
npm install @aws-sdk/client-sns
```

Update the `send-code` endpoint to send SMS instead of just logging the code.

## Security Notes

- Never commit `serviceAccountKey.json` to version control
- In production, use environment variables for all secrets
- Implement rate limiting for SMS endpoints
- Add CAPTCHA verification to prevent abuse
- Use HTTPS in production
