import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';

export const useAudioPlayer = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);

  const playSound = async (uri: string, trackId: string) => {
    try {
      // If clicking the same track that's playing, pause it
      if (currentTrackId === trackId && isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
        return;
      }

      // If clicking the same track that's paused, resume it
      if (currentTrackId === trackId && !isPlaying && sound) {
        await sound.playAsync();
        setIsPlaying(true);
        return;
      }

      // Otherwise, load and play new track
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setCurrentTrackId(trackId);
      setIsPlaying(true);

      // Monitor playback status
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('[useAudioPlayer] Error playing sound:', error);
      setIsPlaying(false);
      setCurrentTrackId(null);
    }
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
      setCurrentTrackId(null);
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return { playSound, stopSound, isPlaying, currentTrackId };
};
