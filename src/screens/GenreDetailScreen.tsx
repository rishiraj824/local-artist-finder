import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Alert,
  Linking,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSpotifyApi } from '../hooks/useSpotifyApi';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export default function GenreDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { genreName } = route.params;
  const { artists, tracks, searchGenre } = useSpotifyApi();
  const { playSound, isPlaying, currentTrackId } = useAudioPlayer();

  useEffect(() => {
    if (genreName) {
      console.log('[GenreDetailScreen] Searching for genre:', genreName);
      searchGenre(genreName);
    }
  }, [genreName, searchGenre]);

  useEffect(() => {
    navigation.setOptions({
      title: genreName ? String(genreName).toUpperCase() : 'Genre',
    });
  }, [genreName, navigation]);

  const handleTrackPress = async (track: any) => {
    if (!track.preview_url) {
      Alert.alert('Preview Not Available', 'This track does not have a preview available.');
      return;
    }
    await playSound(track.preview_url, track.id);
  };

  const openInSpotify = async (track: any) => {
    const spotifyUri = `spotify:track:${track.id}`;
    const spotifyUrl = track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`;

    try {
      // Try to open in Spotify app first
      const canOpen = await Linking.canOpenURL(spotifyUri);
      if (canOpen) {
        await Linking.openURL(spotifyUri);
      } else {
        // Fallback to web browser
        await Linking.openURL(spotifyUrl);
      }
    } catch (error) {
      console.error('Error opening Spotify:', error);
      Alert.alert('Error', 'Could not open Spotify. Please make sure Spotify is installed.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.genreTitle}>Genre: {genreName}</Text>
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Top Artists</Text>
          <FlatList
            data={artists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Image source={{ uri: item.images[0]?.url }} style={styles.artistImage} />
                <Text style={styles.itemText}>{item.name}</Text>
              </View>
            )}
          />
        </View>
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Top Tracks</Text>
          <FlatList
            data={tracks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isCurrentTrack = currentTrackId === item.id;
              const trackIsPlaying = isCurrentTrack && isPlaying;

              return (
                <View style={styles.trackContainer}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.listItem,
                      pressed && styles.listItemPressed,
                      isCurrentTrack && styles.listItemActive,
                    ]}
                    onPress={() => handleTrackPress(item)}
                  >
                    <Image source={{ uri: item.album.images[0]?.url }} style={styles.albumArt} />
                    <View style={styles.trackInfo}>
                      <Text style={[
                        styles.trackName,
                        styles.itemText,
                        isCurrentTrack && styles.activeTrackText
                      ]}>
                        {trackIsPlaying ? '▶ ' : ''}{item.name}
                      </Text>
                      <Text style={styles.artistName}>
                        {item.artists.map((artist: any) => artist.name).join(', ')}
                      </Text>
                      {!item.preview_url && (
                        <Text style={styles.noPreviewText}>No Preview Available</Text>
                      )}
                    </View>
                  </Pressable>
                  <TouchableOpacity
                    style={styles.spotifyButton}
                    onPress={() => openInSpotify(item)}
                  >
                    <Text style={styles.spotifyButtonText}>🎵</Text>
                    <Text style={styles.spotifyButtonLabel}>Full Song</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  genreTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 10,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 10,
  },
  listContainer: {
    marginTop: 20,
    flex: 1,
  },
  trackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  listItemPressed: {
    backgroundColor: colors.surfaceLight,
  },
  listItemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  itemText: {
    ...typography.body,
    color: colors.text,
  },
  artistImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  albumArt: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 4,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    ...typography.bodyMedium,
    fontWeight: 'bold',
  },
  artistName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  activeTrackText: {
    color: colors.primary,
  },
  noPreviewText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  spotifyButton: {
    backgroundColor: '#1DB954', // Spotify green for brand recognition
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  spotifyButtonText: {
    fontSize: 18,
    marginBottom: 2,
  },
  spotifyButtonLabel: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 9,
  },
});
