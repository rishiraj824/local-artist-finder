import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Image,
} from 'react-native';
import { EventWithTracks, ArtistWithTracks } from '../types';
import { colors } from '../theme/colors';
import { typography, fontSize, fontWeight } from '../theme/typography';
import { musicService } from '../services/musicService';
import TrackItem from './TrackItem';
import { Audio } from 'expo-av';
import VoteButton from './VoteButton';
import EndorseButton from './EndorseButton';

interface EventCardProps {
  event: EventWithTracks;
}

export default function EventCard({ event }: EventCardProps) {
  const [artistsWithDetails, setArtistsWithDetails] = useState<ArtistWithTracks[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [showTracks, setShowTracks] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eventName}>{event.name}</Text>
        <Text style={styles.date}>{formatDate(event.date)}</Text>
        {(event.startTime || event.endTime) && (
          <View style={styles.timeContainer}>
            <Text style={styles.timeIcon}>🕐</Text>
            <Text style={styles.timeText}>
              {formatTime(event.startTime)}
              {event.startTime && event.endTime && ' - '}
              {formatTime(event.endTime)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.venueContainer}>
        <Text style={styles.venueLabel}>📍</Text>
        <View style={styles.venueInfo}>
          <Text style={styles.venueName}>{event.venue.name}</Text>
          {event.venue.location && (
            <Text style={styles.venueLocation}>{event.venue.location}</Text>
          )}
        </View>
      </View>

      {event.artistList.length > 0 && (
        <View style={styles.artistsContainer}>
          <Text style={styles.artistsLabel}>Artists:</Text>
          <View style={styles.artistsList}>
            {event.artistList.map((artist, index) => (
              <Text key={artist.id} style={styles.artistName}>
                {artist.name}
                {index < event.artistList.length - 1 && ', '}
              </Text>
            ))}
          </View>
        </View>
      )}

      {event.genres && event.genres.length > 0 && (
        <View style={styles.genresSection}>
          <Text style={styles.genresLabel}>Genres:</Text>
          <View style={styles.eventGenresContainer}>
            {event.genres.map((genre, index) => (
              <View key={index} style={styles.eventGenreTag}>
                <Text style={styles.eventGenreText}>{genre}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.tracksButton} onPress={loadTracks}>
          <Text style={styles.tracksButtonText}>
            {showTracks ? '🎵 Hide Tracks' : '🎵 Show Top Tracks'}
          </Text>
        </TouchableOpacity>

        {event.ticketLink && (
          <TouchableOpacity style={styles.ticketsButton} onPress={handleBuyTickets}>
            <Text style={styles.ticketsButtonText}>🎟️ Tickets</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Social features: Vote and Endorse */}
      <VoteButton
        eventId={event.id}
        eventName={event.name}
        eventDate={event.date}
        venueName={event.venue.name}
      />

      <EndorseButton
        type="event"
        eventId={event.id}
        eventName={event.name}
        eventDate={event.date}
        venueName={event.venue.name}
      />

      {showTracks && (
        <View style={styles.tracksContainer}>
          {isLoadingTracks ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading artist details...</Text>
            </View>
          ) : artistsWithDetails.length > 0 ? (
            <>
              {artistsWithDetails.map((artistData) => (
                <View key={artistData.artist.id} style={styles.artistCard}>
                  {/* Artist Header */}
                  <View style={styles.artistHeader}>
                    {artistData.artist.images.length > 0 && (
                      <Image
                        source={{ uri: artistData.artist.images[0].url }}
                        style={styles.artistImage}
                      />
                    )}
                    <View style={styles.artistInfo}>
                      <Text style={styles.artistName}>{artistData.artist.name}</Text>
                      <Text style={styles.artistFollowers}>
                        👥 {formatFollowers(artistData.artist.followers.total)} followers
                      </Text>
                      {artistData.artist.genres.length > 0 && (
                        <View style={styles.genresContainer}>
                          {artistData.artist.genres.slice(0, 3).map((genre, index) => (
                            <View key={index} style={styles.genreTag}>
                              <Text style={styles.genreText}>{genre}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                      <TouchableOpacity
                        onPress={() => Linking.openURL(artistData.artist.external_urls.spotify)}
                        style={styles.spotifyButton}
                      >
                        <Text style={styles.spotifyButtonText}>🎵 Open in Spotify</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Artist Tracks */}
                  <View style={styles.tracksSection}>
                    <Text style={styles.tracksSectionHeader}>Top Tracks</Text>
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
            <Text style={styles.noTracksText}>
              No artist details available
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    marginBottom: 12,
  },
  eventName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    ...typography.label,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  timeText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  eventGenresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  eventGenreTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  eventGenreText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: fontWeight.semiBold,
    textTransform: 'uppercase',
  },
  venueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  venueLabel: {
    fontSize: 12,
    marginRight: 4,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  venueLocation: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  artistsContainer: {
    marginBottom: 12,
  },
  artistsLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  artistsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  artistName: {
    ...typography.body,
    color: colors.text,
  },
  genresSection: {
    marginBottom: 12,
  },
  genresLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  tracksButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tracksButtonText: {
    ...typography.button,
    color: colors.text,
    textAlign: 'center',
  },
  ticketsButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  ticketsButtonText: {
    ...typography.button,
    color: colors.text,
    textAlign: 'center',
  },
  tracksContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  artistCard: {
    marginBottom: 24,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  artistHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  artistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
  },
  artistInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  artistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  artistFollowers: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  genreTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
  },
  spotifyButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  spotifyButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  tracksSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  tracksSectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  tracksHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 12,
    color: colors.textSecondary,
    fontSize: 14,
  },
  noTracksText: {
    color: colors.textTertiary,
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
});
