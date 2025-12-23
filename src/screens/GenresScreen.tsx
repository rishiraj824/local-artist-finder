import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, ChevronRight, User } from 'lucide-react-native';
import { useSpotifyApi } from '../hooks/useSpotifyApi';
import GenreGrid from '../components/GenreGrid';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { COMPREHENSIVE_GENRES, getGenreColor } from '../data/comprehensiveGenres';
import { spotifyService } from '../services/spotifyApi';
import { SpotifyArtist } from '../types';

interface Genre {
  name: string;
  color: string;
}

const GENRE_CATEGORIES = [
  { name: 'Techno', genres: ['techno', 'minimal-techno', 'detroit-techno', 'acid-techno', 'hard-techno'], color: '#39ff14', tag: 'TECHNO' },
  { name: 'House', genres: ['house', 'deep-house', 'tech-house', 'progressive-house', 'electro-house'], color: '#ff006e', tag: 'HOUSE' },
  { name: 'Drum & Bass', genres: ['drum-and-bass', 'dnb', 'liquid-funk', 'neurofunk', 'jump-up'], color: '#00f0ff', tag: 'D&B' },
  { name: 'Dubstep', genres: ['dubstep', 'brostep', 'riddim', 'uk-dubstep'], color: '#d4622f', tag: 'DUBSTEP' },
  { name: 'Trance', genres: ['trance', 'progressive-trance', 'psytrance', 'uplifting-trance'], color: '#e8d174', tag: 'TRANCE' },
  { name: 'Ambient', genres: ['ambient', 'dark-ambient', 'ambient-dub', 'downtempo', 'chillout'], color: '#bb86fc', tag: 'AMBIENT' },
];

// Intelligent semantic search - normalizes genre names for better matching
const normalizeGenreForSearch = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s&]+/g, '-') // Convert spaces and & to hyphens
    .replace(/[^\w-]/g, '') // Remove special chars except hyphens
    .replace(/-+/g, '-'); // Collapse multiple hyphens
};

// Check if a genre matches the search query using intelligent matching
const genreMatchesSearch = (genreName: string, searchQuery: string): boolean => {
  const normalizedGenre = normalizeGenreForSearch(genreName);
  const normalizedQuery = normalizeGenreForSearch(searchQuery);

  // Direct match
  if (normalizedGenre.includes(normalizedQuery)) {
    return true;
  }

  // Check if genre contains all words from query (in any order)
  const queryWords = normalizedQuery.split('-').filter(w => w.length > 0);
  const genreWords = normalizedGenre.split('-').filter(w => w.length > 0);

  // All query words must appear in genre
  const allWordsMatch = queryWords.every(queryWord =>
    genreWords.some(genreWord => genreWord.includes(queryWord) || queryWord.includes(genreWord))
  );

  return allWordsMatch;
};

export default function GenresScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
    console.log('[GenresScreen] Loading comprehensive genres');
    try {
      setLoading(true);

      // Use comprehensive genre list instead of Spotify API
      const formattedGenres = COMPREHENSIVE_GENRES.map((name) => ({
        name,
        color: getGenreColor(name),
      }));

      console.log('[GenresScreen] Loaded', formattedGenres.length, 'genres');
      setGenres(formattedGenres);
      setError(null);
    } catch (err) {
      console.error('[GenresScreen] Error loading genres:', err);
      setError('Failed to load genres');
    } finally {
      setLoading(false);
    }
  }, []);

  // Use intelligent semantic search instead of simple string matching
  const filteredGenres = genres.filter((genre) =>
    searchQuery.trim() === '' || genreMatchesSearch(genre.name, searchQuery)
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-concrete-dark justify-center items-center">
        <ActivityIndicator size="large" color="#39ff14" />
        <Text className="text-lg font-black text-neon-green mt-3 tracking-widest" style={{ fontFamily: 'BlackOpsOne_400Regular' }}>
          LOADING...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-concrete-dark justify-center items-center">
        <Text className="text-base font-bold text-neon-pink text-center p-5 tracking-wide" style={{ fontFamily: 'CourierPrime_700Bold' }}>
          {error}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-concrete-dark">
      {/* Header with neon title */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-black text-white tracking-wider uppercase" style={{ fontFamily: 'BlackOpsOne_400Regular' }}>
          GENRES.LIST
        </Text>
        <View className="h-1 w-20 bg-neon-green mt-2" style={{ shadowColor: '#39ff14', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8 }} />
      </View>

      {/* Search */}
      <View className="px-5 py-4">
        <TextInput
          className="h-12 bg-concrete-mid px-5 text-white text-base border-2 border-concrete-light"
          style={{ fontFamily: 'Lato_700Bold', letterSpacing: 1 }}
          placeholder="SEARCH GENRES..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View className="flex-1">
        {/* Show empty state if searching and no results */}
        {searchQuery.trim() && filteredGenres.length === 0 ? (
          <View className="flex-1 justify-center items-center px-8">
            <Text className="text-3xl font-black text-gray-600 mb-3" style={{ fontFamily: 'BlackOpsOne_400Regular' }}>
              NO RESULTS
            </Text>
            <Text className="text-base text-gray-500 text-center mb-2" style={{ fontFamily: 'CourierPrime_400Regular' }}>
              No genres found for "{searchQuery}"
            </Text>
          </View>
        ) : (
          <GenreGrid genres={filteredGenres} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 8,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    fontFamily: 'Lato_900Black',
    textTransform: 'uppercase',
  },
  neonUnderline: {
    height: 4,
    width: 80,
    backgroundColor: '#39ff14',
    marginTop: 8,
    shadowColor: '#39ff14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#3a3a3a',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#39ff14',
    borderColor: '#39ff14',
  },
  toggleText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1.5,
  },
  toggleTextActive: {
    color: '#000',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchInput: {
    height: 50,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Lato_700Bold',
    letterSpacing: 1,
    borderWidth: 2,
    borderColor: '#3a3a3a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  categoryCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 0,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 15,
  },
  genreTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0,
  },
  genreTagText: {
    fontFamily: 'Lato_900Black',
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
  categoryTitle: {
    fontFamily: 'Lato_900Black',
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1.5,
    flex: 1,
  },
  dottedLine: {
    height: 2,
    borderStyle: 'dotted',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 15,
  },
  genreList: {
    gap: 10,
  },
  genreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 0,
    borderLeftWidth: 4,
    borderLeftColor: '#000',
  },
  genreItemText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  arrow: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
  },
  viewAllButton: {
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: '#000',
    alignItems: 'center',
    borderRadius: 0,
  },
  viewAllText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  gridContainer: {
    flex: 1,
  },
  loadingText: {
    fontFamily: 'Lato_900Black',
    fontSize: 18,
    fontWeight: '900',
    color: '#39ff14',
    marginTop: 12,
    letterSpacing: 2,
  },
  errorText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 16,
    color: '#ff006e',
    textAlign: 'center',
    padding: 20,
    letterSpacing: 1,
  },
});
