# Apple Developer Setup - Quick Reference

Use these exact values when configuring Apple Sign-In.

---

## Your Firebase Project Details

```
Project ID:        local-artist-discovery
Auth Domain:       local-artist-discovery.firebaseapp.com
Web Domain:        local-artist-discovery.web.app
```

---

## Apple Developer Portal Configuration

### Step 1: Register App ID

1. Go to https://developer.apple.com/account
2. **Certificates, Identifiers & Profiles** → **Identifiers** → **+**
3. Select **App IDs** → **Continue**

**Configuration**:
```
Description:       Local Artist Finder
Bundle ID:         com.discovery.localartist (Explicit)
Capabilities:      ✅ Sign In with Apple
```

Click **Continue** → **Register**

---

### Step 2: Create Services ID

1. **Identifiers** → **+**
2. Select **Services IDs** → **Continue**

**Configuration**:
```
Description:       Local Artist Finder Auth Service
Identifier:        com.discovery.localartist.signin
```

Click **Continue** → **Register**

---

### Step 3: Configure Services ID

1. Click on `com.discovery.localartist.signin`
2. Check ✅ **Sign In with Apple**
3. Click **Configure**

**Domain Configuration**:
```
Primary App ID:    com.discovery.localartist

Domains and Subdomains:
  local-artist-discovery.firebaseapp.com
  local-artist-discovery.web.app

Return URLs:
  https://local-artist-discovery.firebaseapp.com/__/auth/handler
```

Click **Save** → **Continue** → **Save**

---

### Step 4: Get Team ID

1. Click **Membership** (left sidebar)
2. Copy your **Team ID** (looks like: `ABCD123456`)

---

## Firebase Console Configuration

### Update Apple Sign-In Provider

1. Go to https://console.firebase.google.com/project/local-artist-discovery
2. **Authentication** → **Sign-in method** → **Apple**
3. Toggle **Enable** to ON

**Configuration**:
```
Services ID:       com.discovery.localartist.signin
Apple Team ID:     [Your Team ID from Step 4]
```

Click **Save**

---

## Copy-Paste Ready Values

**For Apple Developer Portal (Services ID configuration)**:
```
local-artist-discovery.firebaseapp.com
local-artist-discovery.web.app
https://local-artist-discovery.firebaseapp.com/__/auth/handler
```

**For Firebase Console (Apple Sign-In)**:
```
com.localartistfinder.app.signin
```

---

## Verification

After setup, verify:
- ✅ App ID `com.discovery.localartist` has Sign In with Apple enabled
- ✅ Services ID `com.discovery.localartist.signin` created
- ✅ Services ID configured with Firebase domains
- ✅ Apple provider enabled in Firebase with Services ID
- ✅ Team ID added to Firebase

---

## Next: Get Web Client ID for Google Sign-In

After Apple setup, get the Google Web Client ID:

1. Firebase Console → **Project Settings** → **General**
2. Scroll to **Your apps** → Find **Web app**
3. Copy the **Web Client ID** (format: `123456789-abc123.apps.googleusercontent.com`)
4. Update `.env` file:
   ```bash
   GOOGLE_WEB_CLIENT_ID=your-web-client-id-here.apps.googleusercontent.com
   ```

---

## Quick Links

- Firebase Console: https://console.firebase.google.com/project/local-artist-discovery
- Apple Developer: https://developer.apple.com/account
- Setup Checklist: See `SETUP_CHECKLIST.md`
