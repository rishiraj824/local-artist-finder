import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSpotifyApi } from '../hooks/useSpotifyApi';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

export default function GenreDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { genreName } = route.params;
  const { artists, tracks, searchGenre, getAccessToken, accessToken } = useSpotifyApi();
  const { playSound, isPlaying, currentTrackId } = useAudioPlayer();
  const [expandedArtistId, setExpandedArtistId] = useState<string | null>(null);
  const [artistTracks, setArtistTracks] = useState<{ [key: string]: any[] }>({});
  const [loadingTracks, setLoadingTracks] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (genreName) {
      console.log('[GenreDetailScreen] Searching for genre:', genreName);
      searchGenre(genreName);
    }
  }, [genreName, searchGenre]);

  useEffect(() => {
    navigation.setOptions({
      title: '',
      headerTitle: '',
      headerBackTitle: '',
    });
  }, [genreName, navigation]);

  const handleTrackPress = async (track: any) => {
    if (!track.preview_url) {
      Alert.alert('Preview Not Available', 'This track does not have a preview available.');
      return;
    }
    await playSound(track.preview_url, track.id);
  };

  const toggleArtistExpansion = async (artistId: string) => {
    // If clicking on already expanded artist, collapse it
    if (expandedArtistId === artistId) {
      setExpandedArtistId(null);
      return;
    }

    // Expand the clicked artist
    setExpandedArtistId(artistId);

    // If we already have tracks for this artist, don't fetch again
    if (artistTracks[artistId]) {
      return;
    }

    // Fetch top tracks for this artist
    setLoadingTracks({ ...loadingTracks, [artistId]: true });
    try {
      let token = accessToken;
      if (!token) {
        token = await getAccessToken();
        if (!token) {
          Alert.alert('Error', 'Failed to fetch tracks');
          return;
        }
      }

      const response = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setArtistTracks({ ...artistTracks, [artistId]: data.tracks });
      } else {
        console.error('[GenreDetailScreen] Failed to fetch artist tracks');
      }
    } catch (error) {
      console.error('[GenreDetailScreen] Error fetching artist tracks:', error);
    } finally {
      setLoadingTracks({ ...loadingTracks, [artistId]: false });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-concrete-dark">
      <View className="flex-1 px-5">
        {/* Genre Title */}
        <View className="pt-4 pb-3">
          <Text className="text-4xl font-black text-white tracking-tighter uppercase leading-none" style={{ fontFamily: 'BlackOpsOne_400Regular' }}>
            {genreName}
          </Text>
          <View className="h-1 w-20 bg-neon-pink mt-3" style={{ shadowColor: '#ff006e', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10 }} />
        </View>

        {/* Artists List with Accordion */}
        <FlatList
          data={artists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 20 }}
          renderItem={({ item }) => {
            const isExpanded = expandedArtistId === item.id;
            const tracks = artistTracks[item.id] || [];
            const isLoadingTracks = loadingTracks[item.id] || false;

            return (
              <View className="mb-4">
                {/* Artist Card - Clickable */}
                <TouchableOpacity
                  className="flex-row items-center bg-black border-4 border-neon-green p-4"
                  style={{ shadowColor: '#39ff14', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 }}
                  onPress={() => toggleArtistExpansion(item.id)}
                >
                  <Image source={{ uri: item.images[0]?.url }} className="w-20 h-20 mr-4 border-4 border-white" />
                  <View className="flex-1">
                    <Text className="text-white text-lg font-black uppercase tracking-tight" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                      {item.name}
                    </Text>
                    {item.followers && (
                      <Text className="text-gray-400 text-xs mt-1" style={{ fontFamily: 'CourierPrime_400Regular' }}>
                        {item.followers.total.toLocaleString()} followers
                      </Text>
                    )}
                  </View>
                  {/* Expand/Collapse Indicator */}
                  <Text className="text-neon-green text-2xl font-black" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                    {isExpanded ? '−' : '+'}
                  </Text>
                </TouchableOpacity>

                {/* Expanded Tracks Section */}
                {isExpanded && (
                  <View className="bg-concrete-mid border-4 border-t-0 border-neon-green p-3">
                    {isLoadingTracks ? (
                      <View className="py-8 items-center">
                        <ActivityIndicator size="large" color="#39ff14" />
                        <Text className="text-gray-400 text-sm mt-3" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                          LOADING TRACKS...
                        </Text>
                      </View>
                    ) : tracks.length > 0 ? (
                      tracks.map((track: any) => {
                        const isCurrentTrack = currentTrackId === track.id;
                        return (
                          <Pressable
                            key={track.id}
                            className={`flex-row items-center bg-black border-2 p-3 mb-2 ${isCurrentTrack ? 'border-neon-green' : 'border-concrete-light'}`}
                            style={isCurrentTrack ? { shadowColor: '#39ff14', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.6, shadowRadius: 6 } : undefined}
                            onPress={() => handleTrackPress(track)}
                          >
                            <Image source={{ uri: track.album.images[0]?.url }} className="w-12 h-12 mr-3 border-2 border-white" />
                            <View className="flex-1">
                              <Text className={`text-sm font-black mb-0.5 uppercase tracking-tight ${isCurrentTrack ? 'text-neon-green' : 'text-white'}`} style={{ fontFamily: 'CourierPrime_700Bold' }} numberOfLines={1}>
                                {track.name}
                              </Text>
                              <Text className="text-gray-400 text-xs" style={{ fontFamily: 'CourierPrime_400Regular' }} numberOfLines={1}>
                                {track.album.name}
                              </Text>
                            </View>
                          </Pressable>
                        );
                      })
                    ) : (
                      <View className="py-4">
                        <Text className="text-gray-400 text-sm text-center" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                          No tracks available
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

