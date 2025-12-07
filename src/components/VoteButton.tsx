import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { typography, fontSize } from '../theme/typography';
import { votesService } from '../services/votesService';
import { useAuth } from '../context/AuthContext';

interface VoteButtonProps {
  eventId: string;
  eventName: string;
  eventDate: string;
  venueName: string;
}

export default function VoteButton({ eventId, eventName, eventDate, venueName }: VoteButtonProps) {
  const { user } = useAuth();
  const [myVote, setMyVote] = useState<'interested' | 'going' | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (user) {
      loadVoteData();
    }
  }, [user, eventId]);

  const loadVoteData = async () => {
    try {
      const [vote, voteSummary] = await Promise.all([
        votesService.getMyVote(eventId),
        votesService.getEventVoteSummary(eventId),
      ]);

      setMyVote(vote?.status === 'not_going' ? null : (vote?.status || null));
      setSummary(voteSummary);
    } catch (error) {
      console.error('Error loading vote data:', error);
    }
  };

  const handleVote = async (status: 'interested' | 'going') => {
    if (!user) return;

    setLoading(true);
    try {
      if (myVote === status) {
        // Remove vote if clicking same button
        await votesService.deleteVote(eventId);
        setMyVote(null);
      } else {
        // Update vote
        await votesService.voteOnEvent(eventId, eventName, eventDate, venueName, status);
        setMyVote(status);
      }

      // Reload summary
      await loadVoteData();
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const totalGoing = summary?.going || 0;
  const totalInterested = summary?.interested || 0;
  const friendsGoing = summary?.friendsGoing || [];
  const friendsInterested = summary?.friendsInterested || [];

  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[
            styles.voteButton,
            myVote === 'interested' && styles.voteButtonActive,
          ]}
          onPress={() => handleVote('interested')}
          disabled={loading}
        >
          {loading && myVote === 'interested' ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <>
              <Text style={styles.voteIcon}>⭐</Text>
              <Text
                style={[
                  styles.voteText,
                  myVote === 'interested' && styles.voteTextActive,
                ]}
              >
                Interested {totalInterested > 0 && `(${totalInterested})`}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.voteButton,
            myVote === 'going' && styles.voteButtonActiveGoing,
          ]}
          onPress={() => handleVote('going')}
          disabled={loading}
        >
          {loading && myVote === 'going' ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <>
              <Text style={styles.voteIcon}>✓</Text>
              <Text
                style={[
                  styles.voteText,
                  myVote === 'going' && styles.voteTextActive,
                ]}
              >
                Going {totalGoing > 0 && `(${totalGoing})`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {(friendsGoing.length > 0 || friendsInterested.length > 0) && (
        <TouchableOpacity
          style={styles.friendsSection}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.friendsHeader}>
            👥 {friendsGoing.length + friendsInterested.length} friend
            {friendsGoing.length + friendsInterested.length !== 1 ? 's' : ''} interested
          </Text>

          {expanded && (
            <View style={styles.friendsList}>
              {friendsGoing.length > 0 && (
                <View>
                  <Text style={styles.friendsLabel}>Going:</Text>
                  {friendsGoing.map((friend: any) => (
                    <Text key={friend.userId} style={styles.friendName}>
                      • {friend.displayName || 'Friend'}
                    </Text>
                  ))}
                </View>
              )}
              {friendsInterested.length > 0 && (
                <View style={{ marginTop: friendsGoing.length > 0 ? 8 : 0 }}>
                  <Text style={styles.friendsLabel}>Interested:</Text>
                  {friendsInterested.map((friend: any) => (
                    <Text key={friend.userId} style={styles.friendName}>
                      • {friend.displayName || 'Friend'}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  voteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  voteButtonActive: {
    backgroundColor: colors.accent + '30',
    borderColor: colors.accent,
  },
  voteButtonActiveGoing: {
    backgroundColor: colors.success + '30',
    borderColor: colors.success,
  },
  voteIcon: {
    fontSize: 16,
  },
  voteText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  voteTextActive: {
    color: colors.text,
  },
  friendsSection: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
  },
  friendsHeader: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  friendsList: {
    marginTop: 8,
  },
  friendsLabel: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  friendName: {
    ...typography.caption,
    color: colors.text,
    marginLeft: 8,
    marginTop: 2,
  },
});
