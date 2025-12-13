import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useSpotifyApi } from '../hooks/useSpotifyApi';
import GenreGrid from '../components/GenreGrid';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface Genre {
  name: string;
  color: string;
}

const getRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
    '#FF8FAB', '#00BBF9', '#FEE440', '#F15BB5', '#9B59B6',
    '#3498DB', '#E74C3C', '#2ECC71', '#F39C12', '#1ABC9C',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default function GenresScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getGenreSeeds } = useSpotifyApi();

  useEffect(() => {
    console.log('[GenresScreen] Fetching genres');
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const genreSeeds = await getGenreSeeds();
        console.log('[GenresScreen] Received', genreSeeds?.length, 'genres');

        const formattedGenres = genreSeeds.map((name) => ({
          name,
          color: getRandomColor(),
        }));

        setGenres(formattedGenres);
        setError(null);
      } catch (err) {
        console.error('[GenresScreen] Error fetching genres:', err);
        setError('Failed to load genres');
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, [getGenreSeeds]);

  const filteredGenres = genres.filter((genre) =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Genres...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a genre..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View style={styles.gridContainer}>
        <GenreGrid genres={filteredGenres} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  searchInput: {
    height: 45,
    backgroundColor: colors.surface,
    borderRadius: 25,
    paddingHorizontal: 20,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridContainer: {
    flex: 1,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 12,
  },
  errorText: {
    ...typography.body,
    color: colors.error || '#ff6b6b',
    textAlign: 'center',
    padding: 20,
  },
});
