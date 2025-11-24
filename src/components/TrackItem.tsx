import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { MusicTrack } from '../types';
import { colors } from '../theme/colors';

interface TrackItemProps {
  track: MusicTrack;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
}

export default function TrackItem({
  track,
  isPlaying,
  onPlay,
  onStop,
}: TrackItemProps) {
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleOpenExternal = () => {
    Linking.openURL(track.externalUrl);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.playButton}
        onPress={isPlaying ? onStop : onPlay}
        disabled={!track.previewUrl}
      >
        <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶️'}</Text>
      </TouchableOpacity>

      {track.imageUrl && (
        <Image source={{ uri: track.imageUrl }} style={styles.artwork} />
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist}
        </Text>
        <View style={styles.metadata}>
          <Text style={styles.source}>{track.source.toUpperCase()}</Text>
          <Text style={styles.duration}>{formatDuration(track.duration)}</Text>
          {track.popularity !== undefined && track.popularity > 0 && (
            <Text style={styles.popularity}>
              {track.source === 'spotify' ? '🔥' : '👂'} {track.popularity > 1000 ? `${Math.floor(track.popularity / 1000)}k` : track.popularity}
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.linkButton} onPress={handleOpenExternal}>
        <Text style={styles.linkIcon}>🔗</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playIcon: {
    fontSize: 16,
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: colors.surface,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  artist: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  source: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  duration: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  popularity: {
    fontSize: 10,
    color: colors.secondary,
    fontWeight: '600',
  },
  linkButton: {
    padding: 8,
    marginLeft: 8,
  },
  linkIcon: {
    fontSize: 20,
  },
});
