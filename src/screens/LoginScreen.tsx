import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export default function LoginScreen() {
  const { signInWithGoogle, signInWithSpotify } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'spotify' | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setLoadingProvider('google');
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Sign In Error', error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleSpotifySignIn = async () => {
    try {
      setLoading(true);
      setLoadingProvider('spotify');
      await signInWithSpotify();
    } catch (error: any) {
      Alert.alert('Sign In Error', error.message || 'Failed to sign in with Spotify');
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Local Artist Finder</Text>
          <Text style={styles.subtitle}>
            Discover local music events and explore new genres
          </Text>
        </View>

        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🎵</Text>
            <Text style={styles.benefitText}>Track explored genres</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>📅</Text>
            <Text style={styles.benefitText}>Save events you want to attend</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>⭐</Text>
            <Text style={styles.benefitText}>Build your favorite artists collection</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loadingProvider === 'google' ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <View style={styles.iconContainer}>
                  <Text style={styles.googleIcon}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.spotifyButton]}
            onPress={handleSpotifySignIn}
            disabled={loading}
          >
            {loadingProvider === 'spotify' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <View style={styles.iconContainer}>
                  <Text style={styles.spotifyIcon}>♪</Text>
                </View>
                <Text style={styles.spotifyButtonText}>Continue with Spotify</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          By continuing, you agree to track your music exploration journey
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
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  benefitsContainer: {
    marginBottom: 48,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  benefitText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  googleButton: {
    backgroundColor: '#fff',
  },
  googleButtonText: {
    ...typography.button,
    color: '#000',
  },
  spotifyButton: {
    backgroundColor: '#1DB954',
  },
  spotifyButtonText: {
    ...typography.button,
    color: '#fff',
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  spotifyIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 24,
  },
});
