import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { contactsService } from '../../services/contactsService';

interface ContactsSyncScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function ContactsSyncScreen({
  onComplete,
  onSkip,
}: ContactsSyncScreenProps) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [friendsFound, setFriendsFound] = useState<number | null>(null);

  const handleSyncContacts = async () => {
    setLoading(true);
    setSyncing(true);

    try {
      // Request permission
      const hasPermission = await contactsService.requestPermission();

      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'We need access to your contacts to find friends who are also using the app.'
        );
        setLoading(false);
        setSyncing(false);
        return;
      }

      // Sync contacts and find friends
      const friends = await contactsService.syncContactsAndFindFriends();
      setFriendsFound(friends.length);

      // Show success message
      setTimeout(() => {
        if (friends.length > 0) {
          Alert.alert(
            'Friends Found!',
            `We found ${friends.length} friend${friends.length !== 1 ? 's' : ''} who are using the app!`,
            [{ text: 'Great!', onPress: onComplete }]
          );
        } else {
          Alert.alert(
            'Contacts Synced',
            "We'll notify you when your friends join the app!",
            [{ text: 'OK', onPress: onComplete }]
          );
        }
      }, 1000);
    } catch (error: any) {
      console.error('Error syncing contacts:', error);
      Alert.alert(
        'Sync Failed',
        error.message || 'Failed to sync contacts. Please try again.'
      );
      setSyncing(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>👥</Text>
          <Text style={styles.title}>Find Your Friends</Text>
          <Text style={styles.subtitle}>
            See which of your friends are going to events and discover new shows together
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎉</Text>
            <Text style={styles.featureText}>
              See which friends are going to events
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>⭐</Text>
            <Text style={styles.featureText}>
              Get notified when friends endorse artists
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureText}>
              Your contacts are private and secure
            </Text>
          </View>
        </View>

        {syncing ? (
          <View style={styles.syncingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.syncingText}>
              {friendsFound !== null
                ? `Found ${friendsFound} friend${friendsFound !== 1 ? 's' : ''}!`
                : 'Syncing contacts...'}
            </Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSyncContacts}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.buttonText}>Sync Contacts</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
              disabled={loading}
            >
              <Text style={styles.skipButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.privacy}>
          We only use your contacts to find friends on the app. We never store or share your contacts.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    marginBottom: 48,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  featureText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  syncingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  syncingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 16,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.button,
    color: colors.text,
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  skipButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  privacy: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
