# How to Get Google Web Client ID

## Method 1: Firebase Console (Easiest)

1. Go to https://console.firebase.google.com/project/local-artist-discovery
2. Click **Project Settings** (gear icon)
3. Go to **General** tab
4. Scroll down to **Your apps**
5. If you don't see a Web app:
   - Click **Add app** → Select **</>** (Web)
   - App nickname: `Local Artist Finder Web`
   - Click **Register app**
6. Look under the Web app config for **Web client ID**
7. It looks like: `165015050592-abcd1234efgh5678.apps.googleusercontent.com`

---

## Method 2: Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Make sure you're signed in with the same Google account used for Firebase

2. **Select Your Project**
   - At the top, click the project dropdown
   - Select: `local-artist-discovery`
   - Or use direct link: https://console.cloud.google.com/apis/credentials?project=local-artist-discovery

3. **Navigate to Credentials**
   - In the left sidebar: **APIs & Services** → **Credentials**

4. **Find OAuth 2.0 Client IDs**
   - Look for the section: **OAuth 2.0 Client IDs**
   - You should see one or more client IDs
   - Find the one that says **Web client (auto created by Google Service)**
   - The Client ID will be in format: `165015050592-xxxxx.apps.googleusercontent.com`

5. **Copy the Client ID**
   - Click on the Web client
   - Copy the **Client ID** at the top

---

## Method 3: Enable Google Sign-In in Firebase First

Sometimes the Web Client ID is created when you enable Google Sign-In:

1. **Go to Firebase Console**
   - https://console.firebase.google.com/project/local-artist-discovery

2. **Enable Google Authentication**
   - Navigate to **Authentication** → **Sign-in method**
   - Find **Google** provider
   - Click to edit
   - Toggle **Enable** to ON
   - Set **Support email**: Your email
   - Click **Save**

3. **This should auto-create the Web Client ID**
   - After enabling, go back to **Project Settings** → **General**
   - The Web Client ID should now appear

4. **If still not visible, check Google Cloud Console** (Method 2)

---

## What It Looks Like

The Web Client ID format:
```
165015050592-ab12cd34ef56gh78ij90kl12mn34op56.apps.googleusercontent.com
     ↑                        ↑
  Your App ID          Random string
```

**Don't confuse with**:
- API Key: `AIzaSyB15AqZwqEWZfG21AGOzTsP41zzk6Z0wRI` ❌
- App ID: `1:165015050592:web:0d4e39acc980e27d5ae605` ❌
- Project ID: `local-artist-discovery` ❌

---

## After You Get It

Update your `.env` file:

```bash
GOOGLE_WEB_CLIENT_ID=165015050592-your-actual-client-id.apps.googleusercontent.com
```

Then restart your development server:
```bash
npm start -- --reset-cache
```

---

## Screenshot Guide

### In Firebase Console:
```
Project Settings → General → Your apps

┌─────────────────────────────────────┐
│ Your apps                           │
├─────────────────────────────────────┤
│ 🌐 Local Artist Finder Web          │
│                                     │
│ App ID: 1:165015050592:web:...      │
│                                     │
│ SDK setup and configuration         │
│ ┌─────────────────────────────────┐ │
│ │ Web client ID                   │ │
│ │ 165015050592-abc123.apps.go...  │ │← COPY THIS!
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### In Google Cloud Console:
```
APIs & Services → Credentials

┌─────────────────────────────────────┐
│ OAuth 2.0 Client IDs                │
├─────────────────────────────────────┤
│ Name: Web client (auto created)     │
│ Client ID: 165015050592-abc123...   │← COPY THIS!
│ Creation time: ...                  │
└─────────────────────────────────────┘
```

---

## Troubleshooting

### "I don't see OAuth 2.0 Client IDs"

**Solution**: Enable Google Sign-In in Firebase first
- Firebase Console → Authentication → Sign-in method → Google → Enable

### "I see Android/iOS client IDs but no Web client"

**Solution**: Add a Web app in Firebase
- Project Settings → General → Your apps → Add app → Web

### "Client ID is in wrong format"

**Make sure you're copying the OAuth 2.0 Client ID, not**:
- ❌ API Key (starts with `AIza`)
- ❌ App ID (has `:web:` in it)
- ❌ Project number (just numbers)

### "Still can't find it"

1. Make sure Google Cloud Console project matches Firebase
2. Try searching in Google Cloud: APIs & Services → Credentials → Search "web"
3. You may need to manually create one:
   - In Google Cloud Console
   - APIs & Services → Credentials
   - Create Credentials → OAuth client ID
   - Application type: Web application
   - Authorized redirect URIs: `https://local-artist-discovery.firebaseapp.com/__/auth/handler`

---

## Quick Links

- Firebase Console: https://console.firebase.google.com/project/local-artist-discovery/settings/general
- Google Cloud Credentials: https://console.cloud.google.com/apis/credentials?project=local-artist-discovery
- Firebase Authentication: https://console.firebase.google.com/project/local-artist-discovery/authentication/providers
