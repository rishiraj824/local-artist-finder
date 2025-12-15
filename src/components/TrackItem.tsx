import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { ExternalLink } from 'lucide-react-native';
import { MusicTrack } from '../types';

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
    <View className="flex-row items-center bg-concrete-mid border-2 border-concrete-light p-3 mb-3">
      {/* Album Art */}
      {track.imageUrl && (
        <Image
          source={{ uri: track.imageUrl }}
          className="w-12 h-12 mr-3 border-2 border-gray-600"
        />
      )}

      {/* Track Info */}
      <View className="flex-1">
        <Text
          className="text-white text-sm font-black mb-1"
          style={{ fontFamily: 'CourierPrime_700Bold' }}
          numberOfLines={1}
        >
          {track.title.toUpperCase()}
        </Text>
        <Text
          className="text-gray-400 text-xs mb-1"
          style={{ fontFamily: 'CourierPrime_400Regular' }}
          numberOfLines={1}
        >
          {track.artist}
        </Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-gray-500 text-[10px]" style={{ fontFamily: 'CourierPrime_400Regular' }}>
            {formatDuration(track.duration)}
          </Text>
          {track.popularity !== undefined && track.popularity > 0 && (
            <View className="flex-row items-center gap-1">
              <Text className="text-neon-pink text-[10px]">🔥</Text>
              <Text className="text-neon-pink text-[10px] font-bold" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                {track.popularity > 1000 ? `${Math.floor(track.popularity / 1000)}k` : track.popularity}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* External Link */}
      <TouchableOpacity
        className="w-10 h-10 justify-center items-center bg-black border-2 border-gray-600"
        onPress={handleOpenExternal}
      >
        <ExternalLink size={16} color="#39ff14" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}
