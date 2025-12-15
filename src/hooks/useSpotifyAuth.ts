import { useState, useEffect, useCallback } from 'react';
import { makeRedirectUri } from 'expo-auth-session';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '@env';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import base64 from 'base-64';

// Allows the redirect to work properly on web
WebBrowser.maybeCompleteAuthSession();

const SPOTIFY_SCOPES = [
  'user-follow-read',
  'user-top-read',
  'user-library-read',
];

// Spotify endpoints
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export const useSpotifyAuth = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spotifyAccessToken, setSpotifyAccessToken] = useState<string | null>(null);

  // Configure the redirect URI
  const redirectUri = makeRedirectUri({
    scheme: 'drops',
    path: 'spotify-auth',
  });

  // Log redirect URI for debugging
  useEffect(() => {
    console.log('[useSpotifyAuth] ========================================');
    console.log('[useSpotifyAuth] Redirect URI:', redirectUri);
    console.log('[useSpotifyAuth] Add this EXACT URI to Spotify Dashboard');
    console.log('[useSpotifyAuth] ========================================');
  }, [redirectUri]);

  // Create auth request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: SPOTIFY_CLIENT_ID,
      scopes: SPOTIFY_SCOPES,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  // Check if user already has Spotify connected
  useEffect(() => {
    if (user?.spotifyAccessToken) {
      setIsConnected(true);
      setSpotifyAccessToken(user.spotifyAccessToken);
    } else {
      setIsConnected(false);
      setSpotifyAccessToken(null);
    }
  }, [user]);

  // Handle OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      exchangeCodeForToken(code);
    } else if (response?.type === 'error') {
      console.error('[useSpotifyAuth] Auth error:', response.error);
      setLoading(false);
    }
  }, [response]);

  const exchangeCodeForToken = async (code: string) => {
    try {
      console.log('[useSpotifyAuth] Exchanging code for token...');

      const codeVerifier = request?.codeVerifier;
      if (!codeVerifier) {
        throw new Error('Code verifier not available');
      }

      const tokenResponse = await fetch(discovery.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${base64.encode(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }).toString(),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Token exchange failed: ${errorText}`);
      }

      const tokens = await tokenResponse.json();
      console.log('[useSpotifyAuth] Tokens received successfully');

      // Store tokens in user profile
      if (user) {
        await userService.updateSpotifyTokens(
          user.id,
          tokens.access_token,
          tokens.refresh_token
        );
        setSpotifyAccessToken(tokens.access_token);
        setIsConnected(true);
      }

      setLoading(false);
    } catch (error) {
      console.error('[useSpotifyAuth] Error exchanging code for token:', error);
      setLoading(false);
      throw error;
    }
  };

  const connectSpotify = useCallback(async () => {
    if (!request) {
      console.error('[useSpotifyAuth] Auth request not ready');
      return;
    }

    setLoading(true);
    try {
      console.log('[useSpotifyAuth] Starting Spotify OAuth flow...');
      console.log('[useSpotifyAuth] Redirect URI:', redirectUri);
      await promptAsync();
    } catch (error) {
      console.error('[useSpotifyAuth] Error connecting Spotify:', error);
      setLoading(false);
      throw error;
    }
  }, [request, promptAsync]);

  const disconnectSpotify = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Clear Spotify tokens from user profile
      await userService.updateSpotifyTokens(user.id, '', '');
      setIsConnected(false);
      setSpotifyAccessToken(null);
      setLoading(false);
    } catch (error) {
      console.error('[useSpotifyAuth] Error disconnecting Spotify:', error);
      setLoading(false);
      throw error;
    }
  }, [user]);

  const refreshAccessToken = useCallback(async () => {
    if (!user?.spotifyRefreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      console.log('[useSpotifyAuth] Refreshing access token...');

      const response = await fetch(discovery.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${base64.encode(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: user.spotifyRefreshToken,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const tokens = await response.json();
      await userService.updateSpotifyTokens(user.id, tokens.access_token);
      setSpotifyAccessToken(tokens.access_token);

      return tokens.access_token;
    } catch (error) {
      console.error('[useSpotifyAuth] Error refreshing token:', error);
      throw error;
    }
  }, [user]);

  return {
    isConnected,
    loading,
    spotifyAccessToken,
    connectSpotify,
    disconnectSpotify,
    refreshAccessToken,
  };
};
