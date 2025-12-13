import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { userService } from '../services/userService';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export default function ProfileScreen() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { exploredGenres, savedEvents, favoriteArtists } = useUserPreferences();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveName = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      await userService.createOrUpdateUser(user.id, {
        email: user.email,
        displayName: displayName.trim(),
        photoURL: user.photoURL,
        provider: user.provider,
        spotifyAccessToken: user.spotifyAccessToken,
        spotifyRefreshToken: user.spotifyRefreshToken,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Display name updated successfully!');
    } catch (error) {
      console.error('Error updating name:', error);
      Alert.alert('Error', 'Failed to update display name');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Header */}
      <View style={styles.header}>
        {user.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {(user.displayName || user.email).charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.nameInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your name"
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setDisplayName(user.displayName || '');
                  setIsEditing(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveName}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.name}>{user.displayName || 'No name set'}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <TouchableOpacity
              style={styles.editNameButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editNameButtonText}>Edit Name</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.providerBadge}>
          <Text style={styles.providerText}>
            Signed in with {user.provider === 'google' ? 'Google' : 'Spotify'}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{exploredGenres.length}</Text>
          <Text style={styles.statLabel}>Genres Explored</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{savedEvents.length}</Text>
          <Text style={styles.statLabel}>Saved Events</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{favoriteArtists.length}</Text>
          <Text style={styles.statLabel}>Favorite Artists</Text>
        </View>
      </View>

      {/* Explored Genres */}
      {exploredGenres.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explored Genres</Text>
          <View style={styles.genreContainer}>
            {exploredGenres.map((genre, index) => (
              <View key={index} style={styles.genreChip}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Notifications</Text>
          <Text style={styles.settingValue}>Coming Soon</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Privacy</Text>
          <Text style={styles.settingValue}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
          <Text style={[styles.settingText, styles.signOutText]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Local Artist Finder v1.0.0</Text>
        <Text style={styles.footerText}>Made with ♥ for music lovers</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  editNameButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: 8,
  },
  editNameButtonText: {
    ...typography.button,
    color: colors.primary,
    fontSize: 14,
  },
  editContainer: {
    width: '100%',
    alignItems: 'center',
  },
  nameInput: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 12,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.text,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    ...typography.button,
    color: '#fff',
    fontSize: 14,
  },
  providerBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  providerText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: 24,
    paddingHorizontal: 24,
    backgroundColor: colors.surface,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 16,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genreText: {
    ...typography.caption,
    color: colors.text,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingText: {
    ...typography.body,
    color: colors.text,
  },
  settingValue: {
    ...typography.body,
    color: colors.textSecondary,
  },
  signOutText: {
    color: '#FF6B6B',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});
