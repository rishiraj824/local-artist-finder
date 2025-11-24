import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Modal } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { endorsementService } from '../services/endorsementService';
import { EventEndorsement, ArtistEndorsement } from '../types/social';
import { useAuth } from '../context/AuthContext';

interface EventEndorseButtonProps {
  type: 'event';
  eventId: string;
  eventName: string;
  eventDate: string;
  venueName: string;
}

interface ArtistEndorseButtonProps {
  type: 'artist';
  artistId: string;
  artistName: string;
  genres?: string[];
  spotifyUrl?: string;
}

type EndorseButtonProps = EventEndorseButtonProps | ArtistEndorseButtonProps;

export default function EndorseButton(props: EndorseButtonProps) {
  const { user } = useAuth();
  const [hasEndorsed, setHasEndorsed] = useState(false);
  const [endorsements, setEndorsements] = useState<(EventEndorsement | ArtistEndorsement)[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState('');
  const [expanded, setExpanded] = useState(false);

  const targetId = props.type === 'event' ? props.eventId : props.artistId;
  const targetName = props.type === 'event' ? props.eventName : props.artistName;

  useEffect(() => {
    if (user) {
      loadEndorsements();
    }
  }, [user, targetId]);

  const loadEndorsements = async () => {
    try {
      const [endorsed, allEndorsements] = await Promise.all([
        endorsementService.hasEndorsed(targetId, props.type),
        props.type === 'event'
          ? endorsementService.getEventEndorsements(targetId)
          : endorsementService.getArtistEndorsements(targetId),
      ]);

      setHasEndorsed(endorsed);
      setEndorsements(allEndorsements);
    } catch (error) {
      console.error('Error loading endorsements:', error);
    }
  };

  const handleEndorse = async () => {
    if (!user) return;

    if (hasEndorsed) {
      // Find and remove endorsement
      const myEndorsement = endorsements.find((e) => e.userId === user.id);
      if (myEndorsement) {
        setLoading(true);
        try {
          await endorsementService.removeEndorsement(myEndorsement.id);
          setHasEndorsed(false);
          await loadEndorsements();
        } catch (error) {
          console.error('Error removing endorsement:', error);
        } finally {
          setLoading(false);
        }
      }
    } else {
      // Show modal to add comment
      setShowModal(true);
    }
  };

  const submitEndorsement = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (props.type === 'event') {
        await endorsementService.endorseEvent(
          props.eventId,
          props.eventName,
          props.eventDate,
          props.venueName,
          comment || undefined
        );
      } else {
        await endorsementService.endorseArtist(
          props.artistId,
          props.artistName,
          props.genres,
          props.spotifyUrl,
          comment || undefined
        );
      }

      setHasEndorsed(true);
      setShowModal(false);
      setComment('');
      await loadEndorsements();
    } catch (error) {
      console.error('Error endorsing:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const endorsementCount = endorsements.length;
  const friendEndorsements = endorsements.filter((e) => e.userId !== user.id);

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={[
            styles.endorseButton,
            hasEndorsed && styles.endorseButtonActive,
          ]}
          onPress={handleEndorse}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <>
              <Text style={styles.endorseIcon}>{hasEndorsed ? '❤️' : '🤍'}</Text>
              <Text
                style={[
                  styles.endorseText,
                  hasEndorsed && styles.endorseTextActive,
                ]}
              >
                {hasEndorsed ? 'Endorsed' : 'Endorse'}{' '}
                {endorsementCount > 0 && `(${endorsementCount})`}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {friendEndorsements.length > 0 && (
          <TouchableOpacity
            style={styles.endorsementsList}
            onPress={() => setExpanded(!expanded)}
          >
            <Text style={styles.endorsementsHeader}>
              💬 {friendEndorsements.length} friend
              {friendEndorsements.length !== 1 ? 's' : ''} endorsed this
            </Text>

            {expanded && (
              <View style={styles.endorsementsContent}>
                {friendEndorsements.map((endorsement) => (
                  <View key={endorsement.id} style={styles.endorsementItem}>
                    <Text style={styles.endorsementUser}>
                      {endorsement.userName}
                    </Text>
                    {endorsement.comment && (
                      <Text style={styles.endorsementComment}>
                        "{endorsement.comment}"
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Endorse {targetName}
            </Text>

            <Text style={styles.modalLabel}>
              Add a comment (optional):
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Why do you recommend this?"
              placeholderTextColor={colors.textTertiary}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => {
                  setShowModal(false);
                  setComment('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButtonSubmit}
                onPress={submitEndorsement}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <Text style={styles.modalButtonTextSubmit}>Endorse</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  endorseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  endorseButtonActive: {
    backgroundColor: colors.error + '20',
    borderColor: colors.error,
  },
  endorseIcon: {
    fontSize: 18,
  },
  endorseText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  endorseTextActive: {
    color: colors.error,
  },
  endorsementsList: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
  },
  endorsementsHeader: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  endorsementsContent: {
    marginTop: 8,
    gap: 8,
  },
  endorsementItem: {
    paddingVertical: 6,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
    paddingLeft: 8,
  },
  endorsementUser: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  endorsementComment: {
    ...typography.caption,
    color: colors.text,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 16,
  },
  modalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalButtonTextCancel: {
    ...typography.button,
    color: colors.textSecondary,
  },
  modalButtonSubmit: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalButtonTextSubmit: {
    ...typography.button,
    color: colors.text,
  },
});
