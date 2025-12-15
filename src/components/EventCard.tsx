import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Ticket, Music } from 'lucide-react-native';
import { EventWithTracks, ArtistWithTracks } from '../types';
import { musicService } from '../services/musicService';
import TrackItem from './TrackItem';
import { Audio } from 'expo-audio';

interface EventCardProps {
  event: EventWithTracks;
}

// Random color and rotation for poster aesthetic
const getEventColor = (eventId: string) => {
  const colors = ['#00f0ff', '#39ff14', '#ff006e', '#e8d174', '#d4622f'];
  const hash = eventId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const getEventRotation = (eventId: string) => {
  const rotations = [-3, -2, 2, 3, 4, -4];
  const hash = eventId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return rotations[hash % rotations.length];
};

export default function EventCard({ event }: EventCardProps) {
  const navigation = useNavigation<any>();
  const [artistsWithDetails, setArtistsWithDetails] = useState<ArtistWithTracks[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [showTracks, setShowTracks] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const posterColor = getEventColor(event.id);
  const rotation = getEventRotation(event.id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }).toUpperCase();
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return null;

    // Handle different time formats from API
    try {
      // If it's a full datetime string
      if (timeString.includes('T') || timeString.includes(' ')) {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      }

      // If it's just a time string like "20:00:00" or "20:00"
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const minute = minutes || '00';
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minute} ${period}`;
    } catch (error) {
      return timeString;
    }
  };

  const loadTracks = async () => {
    if (artistsWithDetails.length > 0) {
      setShowTracks(!showTracks);
      return;
    }

    setShowTracks(true);
    setIsLoadingTracks(true);

    try {
      const artistNames = event.artistList.map((artist) => artist.name);
      const fetchedArtists = await musicService.getArtistsWithDetails(artistNames);
      setArtistsWithDetails(fetchedArtists);
    } catch (error) {
      console.error('Error loading artist details:', error);
    } finally {
      setIsLoadingTracks(false);
    }
  };

  const shuffleAndPlayTracks = async () => {
    // If tracks aren't loaded yet, load them first
    if (artistsWithDetails.length === 0) {
      setShowTracks(true);
      setIsLoadingTracks(true);

      try {
        const artistNames = event.artistList.map((artist) => artist.name);
        const fetchedArtists = await musicService.getArtistsWithDetails(artistNames);
        setArtistsWithDetails(fetchedArtists);

        // After loading, shuffle and play
        const allTracks = fetchedArtists.flatMap((artist) => artist.tracks);
        if (allTracks.length > 0) {
          const shuffledTracks = [...allTracks].sort(() => Math.random() - 0.5);
          const randomTrack = shuffledTracks[0];
          if (randomTrack.previewUrl) {
            await handlePlayTrack(randomTrack);
          }
        }
      } catch (error) {
        console.error('Error loading artist details:', error);
      } finally {
        setIsLoadingTracks(false);
      }
    } else {
      // Tracks already loaded, just shuffle and play
      setShowTracks(true);
      const allTracks = artistsWithDetails.flatMap((artist) => artist.tracks);
      if (allTracks.length > 0) {
        const shuffledTracks = [...allTracks].sort(() => Math.random() - 0.5);
        const randomTrack = shuffledTracks[0];
        if (randomTrack.previewUrl) {
          await handlePlayTrack(randomTrack);
        }
      }
    }
  };

  const handlePlayTrack = async (track: any) => {
    try {
      // Stop current sound if playing
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setPlayingTrackId(null);
      }

      if (!track.previewUrl) {
        console.log('No preview URL available for this track');
        return;
      }

      // Load and play new track
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.previewUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setPlayingTrackId(track.id);

      // Handle playback status
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingTrackId(null);
        }
      });
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const formatFollowers = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
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
    if (event.ticketLink) {
      Linking.openURL(event.ticketLink);
    }
  };

  const handleOpenMaps = () => {
    const destination = encodeURIComponent(`${event.venue.name}, ${event.venue.location}`);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    Linking.openURL(mapsUrl);
  };

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <TouchableOpacity
      className="mx-4 my-3"
      style={{ transform: [{ rotate: `${showTracks ? 0 : rotation}deg` }] }}
      onPress={() => setShowTracks(!showTracks)}
      activeOpacity={0.9}
    >
      {/* Ripped Poster Fragment */}
      <View
        className="p-6 border-4"
        style={{
          backgroundColor: posterColor,
          borderColor: showTracks ? '#ffffff' : posterColor,
          shadowColor: posterColor,
          shadowOffset: { width: 0, height: showTracks ? 10 : 6 },
          shadowOpacity: showTracks ? 0.8 : 0.5,
          shadowRadius: showTracks ? 20 : 12,
          elevation: showTracks ? 15 : 8,
        }}
      >
        {/* Distressed Overlay */}
        <View className="absolute inset-0 bg-black/20" />

        <View className="relative">
          {/* Event Name - Huge & Bold */}
          <Text
            className="text-4xl font-black uppercase tracking-tighter leading-none mb-4 text-black"
            style={{
              fontFamily: 'BlackOpsOne_400Regular',
              textShadowColor: 'rgba(255,255,255,0.4)',
              textShadowOffset: { width: 3, height: 3 },
              textShadowRadius: 0,
              transform: [{ scaleY: 1.3 }],
            }}
            numberOfLines={2}
          >
            {event.name.toUpperCase()}
          </Text>

          {/* Timing & Location Badges */}
          <View className="flex-row flex-wrap gap-3 mb-4">
            {event.startTime && (
              <View className="bg-black px-3 py-2 border-2 border-white flex-row items-center gap-2">
                <Text className="text-neon-green text-xs font-black tracking-wide" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                  🕐 DOORS
                </Text>
                <Text className="text-white text-base font-black tracking-wide" style={{ fontFamily: 'BlackOpsOne_400Regular' }}>
                  {formatTime(event.startTime)}
                </Text>
              </View>
            )}
            {event.endTime && (
              <View className="bg-black px-3 py-2 border-2 border-white flex-row items-center gap-2">
                <Text className="text-neon-pink text-xs font-black tracking-wide" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                  🕐 ENDS
                </Text>
                <Text className="text-white text-base font-black tracking-wide" style={{ fontFamily: 'BlackOpsOne_400Regular' }}>
                  {formatTime(event.endTime)}
                </Text>
              </View>
            )}
            <TouchableOpacity
              className="bg-black px-3 py-2 border-2 border-white flex-row items-center gap-2"
              onPress={(e) => {
                e.stopPropagation();
                handleOpenMaps();
              }}
            >
              <MapPin size={16} color="#fff" strokeWidth={3} />
              <Text className="text-white text-sm font-black uppercase tracking-tight" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                {event.venue.name.substring(0, 20)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Genres - Always Visible */}
          {event.genres && event.genres.length > 0 && (
            <View className="mb-4">
              <View className="flex-row flex-wrap gap-2">
                {event.genres.slice(0, 3).map((genre, index) => (
                  <TouchableOpacity
                    key={index}
                    className="bg-white px-3 py-1.5 border-2 border-black"
                    onPress={(e) => {
                      e.stopPropagation();
                      navigation.navigate('GenreDetail', { genreName: genre });
                    }}
                  >
                    <Text className="text-black text-xs font-black uppercase" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                      {genre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Artists Lineup */}
          {event.artistList.length > 0 && (
            <View className="mb-4">
              <Text className="text-black text-lg font-black uppercase tracking-wide mb-2" style={{ fontFamily: 'PermanentMarker_400Regular' }}>
                LINEUP
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {event.artistList.slice(0, 3).map((artist) => (
                  <View key={artist.id} className="bg-white px-3 py-1.5 border-2 border-black">
                    <Text className="text-black text-sm font-black uppercase" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                      {artist.name}
                    </Text>
                  </View>
                ))}
                {event.artistList.length > 3 && (
                  <View className="bg-black px-3 py-1.5 border-2 border-white">
                    <Text className="text-white text-sm font-black" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                      +{event.artistList.length - 3} MORE
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity
              className="flex-1 bg-white py-3 px-4 border-2 border-black flex-row justify-center items-center gap-2"
              style={{
                shadowColor: '#fff',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
              onPress={(e) => {
                e.stopPropagation();
                shuffleAndPlayTracks();
              }}
            >
              <Music size={16} color="#000" strokeWidth={3} />
              <Text className="text-black text-sm font-black uppercase" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                VIBES
              </Text>
            </TouchableOpacity>
            {event.ticketLink && (
              <TouchableOpacity
                className="flex-1 bg-white py-3 px-4 border-2 border-black flex-row justify-center items-center gap-2"
                onPress={(e) => {
                  e.stopPropagation();
                  handleBuyTickets();
                }}
              >
                <Ticket size={16} color="#000" strokeWidth={3} />
                <Text className="text-black text-sm font-black uppercase" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                  TICKETS
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tape Effect in corner */}
        <View
          className="absolute top-4 right-4 w-20 h-8 bg-black/20 border-2 border-white/40"
          style={{ transform: [{ rotate: '15deg' }] }}
        />
      </View>

      {showTracks && (
        <View className="mt-4 pt-4 border-t-2 border-concrete-light">
          {isLoadingTracks ? (
            <View className="flex-row items-center justify-center p-5 bg-concrete-mid border-2 border-concrete-light">
              <ActivityIndicator size="small" color="#39ff14" />
              <Text className="ml-3 text-gray-300 text-sm" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                LOADING VIBES...
              </Text>
            </View>
          ) : artistsWithDetails.length > 0 ? (
            <>
              {artistsWithDetails.map((artistData) => (
                <View key={artistData.artist.id} className="mb-6 p-4 border-2 border-concrete-light bg-concrete-mid">
                  {/* Artist Header */}
                  <View className="flex-row mb-4 pb-4 border-b-2 border-concrete-light">
                    {artistData.artist.images.length > 0 && (
                      <Image
                        source={{ uri: artistData.artist.images[0].url }}
                        className="w-20 h-20 mr-4 border-2 border-neon-green"
                        style={{
                          shadowColor: '#39ff14',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                        }}
                      />
                    )}
                    <View className="flex-1 justify-center">
                      <Text className="text-lg font-black text-white mb-2" style={{ fontFamily: 'BlackOpsOne_400Regular' }}>
                        {artistData.artist.name.toUpperCase()}
                      </Text>
                      <Text className="text-xs text-gray-400 mb-2" style={{ fontFamily: 'CourierPrime_400Regular' }}>
                        👥 {formatFollowers(artistData.artist.followers.total)} followers
                      </Text>
                      {artistData.artist.genres.length > 0 && (
                        <View className="flex-row flex-wrap gap-1.5">
                          {artistData.artist.genres.slice(0, 3).map((genre, index) => (
                            <View key={index} className="bg-black px-2 py-1 border border-neon-green">
                              <Text className="text-[10px] text-neon-green font-black" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                                {genre.toUpperCase()}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Artist Tracks */}
                  <View className="pt-2">
                    <Text className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                      ⚡ TOP TRACKS
                    </Text>
                    {artistData.tracks.map((track) => (
                      <TrackItem
                        key={track.id}
                        track={track}
                        isPlaying={playingTrackId === track.id}
                        onPlay={() => handlePlayTrack(track)}
                        onStop={handleStopTrack}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </>
          ) : (
            <Text className="text-gray-400 text-sm text-center p-5 bg-concrete-mid border-2 border-concrete-light" style={{ fontFamily: 'CourierPrime_700Bold' }}>
              NO VIBES AVAILABLE
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}
