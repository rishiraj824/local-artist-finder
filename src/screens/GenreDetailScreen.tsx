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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSpotifyApi } from '../hooks/useSpotifyApi';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

export default function GenreDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { genreName } = route.params;
  const { artists, tracks, searchGenre } = useSpotifyApi();
  const { playSound, isPlaying, currentTrackId } = useAudioPlayer();
  const [activeTab, setActiveTab] = useState<'artists' | 'tracks'>('artists');

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

        {/* Tabs */}
        <View className="flex-row gap-3 my-5">
          <TouchableOpacity
            className={`flex-1 py-4 items-center border-4 ${activeTab === 'artists' ? 'bg-neon-green border-black' : 'bg-black border-neon-green'}`}
            style={activeTab === 'artists' ? { shadowColor: '#39ff14', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 8 } : undefined}
            onPress={() => setActiveTab('artists')}
          >
            <Text className={`text-base font-black tracking-widest ${activeTab === 'artists' ? 'text-black' : 'text-neon-green'}`} style={{ fontFamily: 'CourierPrime_700Bold' }}>
              ARTISTS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-4 items-center border-4 ${activeTab === 'tracks' ? 'bg-neon-green border-black' : 'bg-black border-neon-green'}`}
            style={activeTab === 'tracks' ? { shadowColor: '#39ff14', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 8 } : undefined}
            onPress={() => setActiveTab('tracks')}
          >
            <Text className={`text-base font-black tracking-widest ${activeTab === 'tracks' ? 'text-black' : 'text-neon-green'}`} style={{ fontFamily: 'CourierPrime_700Bold' }}>
              TRACKS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Artists Tab */}
        {activeTab === 'artists' && (
          <FlatList
            data={artists}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View
                className="flex-row items-center bg-black border-4 border-neon-green p-4 mb-4"
                style={{ shadowColor: '#39ff14', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 }}
              >
                <Image source={{ uri: item.images[0]?.url }} className="w-20 h-20 mr-4 border-4 border-white" />
                <Text className="flex-1 text-white text-lg font-black uppercase tracking-tight" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                  {item.name}
                </Text>
              </View>
            )}
          />
        )}

        {/* Tracks Tab */}
        {activeTab === 'tracks' && (
          <FlatList
            data={tracks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => {
              const isCurrentTrack = currentTrackId === item.id;

              return (
                <Pressable
                  className={`flex-row items-center bg-black border-4 p-4 mb-4 ${isCurrentTrack ? 'border-neon-green' : 'border-concrete-light'}`}
                  style={isCurrentTrack ? { shadowColor: '#39ff14', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 10 } : undefined}
                  onPress={() => handleTrackPress(item)}
                >
                  <Image source={{ uri: item.album.images[0]?.url }} className="w-16 h-16 mr-4 border-3 border-white" />
                  <View className="flex-1">
                    <Text className={`text-base font-black mb-1 uppercase tracking-tight ${isCurrentTrack ? 'text-neon-green' : 'text-white'}`} style={{ fontFamily: 'CourierPrime_700Bold' }} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text className="text-gray-400 text-xs mb-1 font-bold" style={{ fontFamily: 'CourierPrime_700Bold' }} numberOfLines={1}>
                      {item.artists?.map((artist: any) => artist.name).join(', ') || 'Unknown Artist'}
                    </Text>
                    <Text className="text-gray-600 text-xs" style={{ fontFamily: 'CourierPrime_400Regular' }} numberOfLines={1}>
                      {item.album.name}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

