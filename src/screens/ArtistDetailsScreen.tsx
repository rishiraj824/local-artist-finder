import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, MusicTrack } from "../types";
import { musicService } from "../services/musicService";
import { colors } from "../theme/colors";
import { commonStyles } from "../theme/styles";
import TrackItem from "../components/TrackItem";
import { Audio } from "expo-audio";

type Props = NativeStackScreenProps<RootStackParamList, "ArtistDetails">;

export default function ArtistDetailsScreen({ route }: Props) {
  const { artistName, eventName, ticketLink } = route.params;
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  useEffect(() => {
    loadArtistTracks();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [artistName]);

  const loadArtistTracks = async () => {
    try {
      setIsLoading(true);
      const fetchedTracks = await musicService.getArtistTopTracks(artistName);
      setTracks(fetchedTracks);
    } catch (error) {
      console.error("Error loading artist tracks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayTrack = async (track: MusicTrack) => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setPlayingTrackId(null);
      }

      if (!track.previewUrl) {
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.previewUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setPlayingTrackId(track.id);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingTrackId(null);
        }
      });
    } catch (error) {
      console.error("Error playing track:", error);
    }
  };

  const handleStopTrack = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setPlayingTrackId(null);
    }
  };

  const handleBuyTickets = () => {
    if (ticketLink) {
      Linking.openURL(ticketLink);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.artistName}>{artistName}</Text>
      <Text style={styles.eventName}>Performing at: {eventName}</Text>

      {ticketLink && (
        <TouchableOpacity
          style={styles.ticketsButton}
          onPress={handleBuyTickets}
        >
          <Text style={styles.ticketsButtonText}>🎟️ Buy Tickets</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>Top Tracks</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={commonStyles.safeArea}>
        <View style={commonStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading artist tracks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TrackItem
            track={item}
            isPlaying={playingTrackId === item.id}
            onPlay={() => handlePlayTrack(item)}
            onStop={handleStopTrack}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No tracks available for this artist
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  artistName: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  eventName: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  ticketsButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  ticketsButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
