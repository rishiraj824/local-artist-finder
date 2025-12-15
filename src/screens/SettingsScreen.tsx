import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';
import { useSpotifyApi } from '../hooks/useSpotifyApi';
import { userService } from '../services/userService';
import { Music, RefreshCw } from 'lucide-react-native';

export default function SettingsScreen() {
  const { user } = useAuth();
  const { isConnected, connectSpotify, disconnectSpotify, loading, spotifyAccessToken } = useSpotifyAuth();
  const { getFollowedArtists, calculateGenresDiscovered, getSavedTracks, calculateGenresFromTracks } = useSpotifyApi();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null);

  useEffect(() => {
    if (user?.lastSpotifySync) {
      setLastSyncDate(user.lastSpotifySync);
    }
  }, [user]);

  const syncSpotifyData = async () => {
    if (!user || !spotifyAccessToken) {
      Alert.alert('Error', 'Spotify not connected or token unavailable');
      return;
    }

    try {
      setSyncing(true);
      console.log('[SettingsScreen] Starting Spotify data sync...');

      // Fetch followed artists
      const followedArtists = await getFollowedArtists(spotifyAccessToken);
      console.log('[SettingsScreen] Fetched', followedArtists.length, 'followed artists');

      // Calculate genres from followed artists
      const { genres: artistGenres } = calculateGenresDiscovered(followedArtists);
      console.log('[SettingsScreen] Discovered', artistGenres.length, 'unique genres from followed artists');

      // Fetch saved/liked tracks
      const savedTracks = await getSavedTracks(spotifyAccessToken, 50);
      console.log('[SettingsScreen] Fetched', savedTracks.length, 'saved tracks');

      // Calculate genres from liked tracks
      const { genres: trackGenres } = await calculateGenresFromTracks(savedTracks, spotifyAccessToken);
      console.log('[SettingsScreen] Discovered', trackGenres.length, 'unique genres from liked tracks');

      // Merge both genre lists
      const allGenres = Array.from(new Set([...artistGenres, ...trackGenres]));
      console.log('[SettingsScreen] Total unique genres:', allGenres.length);

      // Store in Firebase
      await userService.syncSpotifyData(user.id, followedArtists, allGenres);

      setLastSyncDate(new Date());
      Alert.alert(
        'Sync Complete!',
        `Successfully synced:\n• ${followedArtists.length} followed artists\n• ${savedTracks.length} liked songs\n• ${allGenres.length} total genres discovered`
      );
    } catch (error: any) {
      console.error('[SettingsScreen] Error syncing Spotify data:', error);

      if (error.message === 'Unauthorized - token may be expired') {
        Alert.alert(
          'Session Expired',
          'Your Spotify session has expired. Please reconnect your account.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reconnect', onPress: handleConnectSpotify },
          ]
        );
      } else {
        Alert.alert('Sync Error', 'Failed to sync your Spotify data. Please try again.');
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectSpotify = async () => {
    try {
      await connectSpotify();
      Alert.alert(
        'Success!',
        'Spotify account connected. Sync your data to discover your genres.',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Sync Now', onPress: syncSpotifyData },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to connect Spotify account. Please try again.');
    }
  };

  const handleDisconnectSpotify = () => {
    Alert.alert(
      'Disconnect Spotify',
      'Are you sure you want to disconnect your Spotify account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await disconnectSpotify();
              Alert.alert('Success', 'Spotify account disconnected');
            } catch (error) {
              Alert.alert('Error', 'Failed to disconnect Spotify account');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-concrete-dark">
      <ScrollView className="flex-1 px-5 pt-6">
        {/* Header */}
        <View className="mb-8">
          <Text
            className="text-3xl font-black text-white tracking-wider uppercase"
            style={{ fontFamily: 'BlackOpsOne_400Regular' }}
          >
            SETTINGS
          </Text>
          <View
            className="h-1 w-20 bg-neon-green mt-2"
            style={{
              shadowColor: '#39ff14',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 8,
            }}
          />
        </View>

        {/* Spotify Connection Section */}
        <View className="mb-6">
          <Text
            className="text-lg font-black text-white mb-4 tracking-wide"
            style={{ fontFamily: 'CourierPrime_700Bold' }}
          >
            SPOTIFY CONNECTION
          </Text>

          <View className="bg-concrete-mid border-2 border-concrete-light p-5">
            <View className="flex-row items-center mb-4">
              <View
                className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                  isConnected ? 'bg-neon-green' : 'bg-gray-600'
                }`}
              >
                <Music size={24} color={isConnected ? '#000' : '#fff'} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-white text-base font-black mb-1"
                  style={{ fontFamily: 'CourierPrime_700Bold' }}
                >
                  {isConnected ? 'CONNECTED' : 'NOT CONNECTED'}
                </Text>
                <Text
                  className="text-gray-400 text-xs"
                  style={{ fontFamily: 'CourierPrime_400Regular' }}
                >
                  {isConnected
                    ? 'Track your followed artists'
                    : 'Connect to discover genres'}
                </Text>
              </View>
            </View>

            {isConnected ? (
              <>
                <Text
                  className="text-gray-300 text-sm mb-4"
                  style={{ fontFamily: 'CourierPrime_400Regular' }}
                >
                  Your Spotify account is connected. Sync your data to update your
                  followed artists and genres discovered count.
                </Text>

                {lastSyncDate && (
                  <Text
                    className="text-gray-400 text-xs mb-4"
                    style={{ fontFamily: 'CourierPrime_400Regular' }}
                  >
                    Last synced: {lastSyncDate.toLocaleDateString()} at{' '}
                    {lastSyncDate.toLocaleTimeString()}
                  </Text>
                )}

                <TouchableOpacity
                  className="bg-neon-green border-4 border-black py-4 items-center mb-3 flex-row justify-center gap-2"
                  style={{
                    shadowColor: '#39ff14',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.6,
                    shadowRadius: 8,
                  }}
                  onPress={syncSpotifyData}
                  disabled={syncing || loading}
                >
                  {syncing ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <>
                      <RefreshCw size={18} color="#000" />
                      <Text
                        className="text-black text-base font-black tracking-wide"
                        style={{ fontFamily: 'CourierPrime_700Bold' }}
                      >
                        SYNC NOW
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-red-600 border-2 border-red-700 py-4 items-center"
                  onPress={handleDisconnectSpotify}
                  disabled={loading || syncing}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text
                      className="text-white text-base font-black tracking-wide"
                      style={{ fontFamily: 'CourierPrime_700Bold' }}
                    >
                      DISCONNECT
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text
                  className="text-gray-300 text-sm mb-4"
                  style={{ fontFamily: 'CourierPrime_400Regular' }}
                >
                  Connect your Spotify account to track artists you follow and build your
                  "genres discovered" number in your profile.
                </Text>
                <TouchableOpacity
                  className="bg-neon-green border-4 border-black py-4 items-center"
                  style={{
                    shadowColor: '#39ff14',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.6,
                    shadowRadius: 8,
                  }}
                  onPress={handleConnectSpotify}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text
                      className="text-black text-base font-black tracking-wide"
                      style={{ fontFamily: 'CourierPrime_700Bold' }}
                    >
                      CONNECT SPOTIFY
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Info Section */}
        <View className="bg-black border-2 border-neon-pink p-4 mb-6">
          <Text
            className="text-neon-pink text-sm font-black mb-2"
            style={{ fontFamily: 'CourierPrime_700Bold' }}
          >
            ℹ️ WHY CONNECT?
          </Text>
          <Text
            className="text-gray-300 text-xs leading-5"
            style={{ fontFamily: 'CourierPrime_400Regular' }}
          >
            • Track artists you follow on Spotify{'\n'}
            • Calculate unique genres discovered{'\n'}
            • Get personalized genre recommendations{'\n'}
            • Your data is private and secure
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
