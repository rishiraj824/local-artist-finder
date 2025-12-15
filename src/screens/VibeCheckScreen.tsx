import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { LinearGradient } from 'expo-linear-gradient';
import { UserPlus, Users, Share2, Music, Heart, X } from 'lucide-react-native';

interface ScannedUser {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  genresDiscovered: string[];
  genresDiscoveredCount: number;
}

export default function VibeCheckScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { scannedUserId } = route.params || {};

  const [scannedUser, setScannedUser] = useState<ScannedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [compatibility, setCompatibility] = useState(0);
  const [sharedGenres, setSharedGenres] = useState<string[]>([]);
  const [animationComplete, setAnimationComplete] = useState(false);

  const compatibilityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchScannedUser();
  }, [scannedUserId]);

  useEffect(() => {
    if (scannedUser && user) {
      calculateCompatibility();
    }
  }, [scannedUser, user]);

  useEffect(() => {
    if (compatibility > 0) {
      // Animate compatibility percentage
      Animated.parallel([
        Animated.timing(compatibilityAnim, {
          toValue: compatibility,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start(() => {
        setAnimationComplete(true);
      });
    }
  }, [compatibility]);

  const fetchScannedUser = async () => {
    try {
      setLoading(true);
      console.log('[VibeCheckScreen] Fetching user:', scannedUserId);

      const userData = await userService.getUserById(scannedUserId);

      if (!userData) {
        Alert.alert('User Not Found', 'Could not find this user. They may not have synced their data yet.');
        navigation.goBack();
        return;
      }

      setScannedUser(userData as ScannedUser);
    } catch (error) {
      console.error('[VibeCheckScreen] Error fetching user:', error);
      Alert.alert('Error', 'Failed to load user data. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const calculateCompatibility = () => {
    if (!user?.genresDiscovered || !scannedUser?.genresDiscovered) {
      setCompatibility(0);
      setSharedGenres([]);
      return;
    }

    const userGenres = new Set(user.genresDiscovered.map(g => g.toLowerCase()));
    const scannedGenres = scannedUser.genresDiscovered.map(g => g.toLowerCase());

    // Find shared genres
    const shared = scannedGenres.filter(genre => userGenres.has(genre));
    setSharedGenres(shared);

    // Calculate compatibility percentage
    const totalUniqueGenres = new Set([...user.genresDiscovered, ...scannedUser.genresDiscovered]).size;
    const compatibilityScore = totalUniqueGenres > 0
      ? Math.round((shared.length / totalUniqueGenres) * 100 * 2.5) // Amplify the score a bit
      : 0;

    setCompatibility(Math.min(compatibilityScore, 100)); // Cap at 100%

    console.log('[VibeCheckScreen] Compatibility:', compatibilityScore, '% | Shared genres:', shared.length);
  };

  const getCompatibilityColor = () => {
    if (compatibility >= 70) return '#39ff14'; // Neon green
    if (compatibility >= 40) return '#e8d174'; // Yellow
    return '#ff006e'; // Neon pink
  };

  const getCompatibilityMessage = () => {
    if (compatibility >= 80) return '🔥 PERFECT MATCH!';
    if (compatibility >= 60) return '✨ GREAT VIBES!';
    if (compatibility >= 40) return '💫 GOOD CONNECTION!';
    if (compatibility >= 20) return '🎵 SOME OVERLAP!';
    return '🌟 DISCOVER NEW VIBES!';
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-concrete-dark justify-center items-center">
        <ActivityIndicator size="large" color="#39ff14" />
        <Text
          className="text-white text-base font-bold mt-4"
          style={{ fontFamily: 'CourierPrime_700Bold' }}
        >
          CALCULATING VIBE...
        </Text>
      </SafeAreaView>
    );
  }

  if (!scannedUser) {
    return null;
  }

  const userInitials = (scannedUser.displayName || scannedUser.email).charAt(0).toUpperCase();
  const compatibilityColor = getCompatibilityColor();

  return (
    <View className="flex-1 bg-concrete-dark">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <SafeAreaView>
          {/* Header */}
          <View className="flex-row justify-between items-center px-5 py-4">
            <View>
              <Text
                className="text-white text-2xl font-black tracking-wide"
                style={{ fontFamily: 'BlackOpsOne_400Regular' }}
              >
                VIBE CHECK
              </Text>
              <Text
                className="text-neon-green text-xs font-bold mt-1"
                style={{ fontFamily: 'CourierPrime_700Bold' }}
              >
                COMPATIBILITY SCAN
              </Text>
            </View>
            <TouchableOpacity
              className="w-12 h-12 bg-concrete-mid border-2 border-white items-center justify-center"
              onPress={() => navigation.goBack()}
            >
              <X size={24} color="#fff" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          {/* Compatibility Circle - Animated */}
          <View className="items-center py-8">
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }],
              }}
            >
              <View
                className="relative items-center justify-center"
                style={{
                  width: 200,
                  height: 200,
                }}
              >
                {/* Glow effect */}
                <Animated.View
                  style={{
                    position: 'absolute',
                    width: 220,
                    height: 220,
                    borderRadius: 110,
                    backgroundColor: compatibilityColor,
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.1, 0.3],
                    }),
                  }}
                />

                {/* Main circle */}
                <View
                  className="items-center justify-center border-8"
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 100,
                    borderColor: compatibilityColor,
                    backgroundColor: '#1a1a1a',
                  }}
                >
                  <Text
                    className="text-6xl font-black"
                    style={{
                      fontFamily: 'BlackOpsOne_400Regular',
                      color: compatibilityColor,
                    }}
                  >
                    {Math.round(compatibility)}%
                  </Text>
                  <Text
                    className="text-white text-xs font-bold mt-1"
                    style={{ fontFamily: 'CourierPrime_700Bold' }}
                  >
                    COMPATIBLE
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Compatibility Message */}
            <View
              className="mt-6 px-6 py-3 border-4"
              style={{
                borderColor: compatibilityColor,
                backgroundColor: 'rgba(0,0,0,0.8)',
              }}
            >
              <Text
                className="text-center text-lg font-black"
                style={{
                  fontFamily: 'BlackOpsOne_400Regular',
                  color: compatibilityColor,
                }}
              >
                {getCompatibilityMessage()}
              </Text>
            </View>
          </View>

          {/* User Info Card */}
          <View className="mx-5 mb-6 bg-gray-200 border-4 border-black p-5">
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 bg-gray-800 border-2 border-black mr-4">
                {scannedUser.photoURL ? (
                  <Image
                    source={{ uri: scannedUser.photoURL }}
                    className="w-full h-full"
                  />
                ) : (
                  <View className="w-full h-full bg-concrete-mid justify-center items-center">
                    <Text className="text-2xl font-bold text-white">
                      {userInitials}
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-1">
                <Text
                  className="text-xl font-black"
                  style={{ fontFamily: 'PermanentMarker_400Regular' }}
                >
                  {scannedUser.displayName || 'USER'}
                </Text>
                <View className="flex-row items-center mt-1" style={{ gap: 8 }}>
                  <Music size={14} color="#000" />
                  <Text
                    className="text-xs font-bold"
                    style={{ fontFamily: 'CourierPrime_700Bold' }}
                  >
                    {scannedUser.genresDiscoveredCount || 0} GENRES
                  </Text>
                </View>
              </View>
            </View>

            {/* Shared Genres */}
            {sharedGenres.length > 0 && (
              <View className="border-t-2 border-black pt-4">
                <Text
                  className="text-xs font-black mb-2"
                  style={{ fontFamily: 'CourierPrime_700Bold' }}
                >
                  🎵 SHARED VIBES ({sharedGenres.length})
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                  {sharedGenres.slice(0, 12).map((genre, index) => (
                    <View
                      key={index}
                      className="bg-black px-2 py-1 border-2"
                      style={{ borderColor: compatibilityColor }}
                    >
                      <Text
                        className="text-[10px] font-bold"
                        style={{
                          fontFamily: 'CourierPrime_700Bold',
                          color: compatibilityColor,
                        }}
                      >
                        {genre.toUpperCase()}
                      </Text>
                    </View>
                  ))}
                  {sharedGenres.length > 12 && (
                    <View className="bg-gray-600 px-2 py-1">
                      <Text
                        className="text-[10px] text-white font-bold"
                        style={{ fontFamily: 'CourierPrime_700Bold' }}
                      >
                        +{sharedGenres.length - 12} MORE
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Suggestions */}
            {sharedGenres.length > 0 && (
              <View className="border-t-2 border-dotted border-black pt-4 mt-4">
                <Text
                  className="text-xs font-black mb-2"
                  style={{ fontFamily: 'CourierPrime_700Bold' }}
                >
                  💡 YOU'D BOTH VIBE TO...
                </Text>
                <Text
                  className="text-xs"
                  style={{ fontFamily: 'CourierPrime_400Regular' }}
                >
                  Events featuring {sharedGenres.slice(0, 3).join(', ')}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View className="mx-5 mb-6" style={{ gap: 12 }}>
            <TouchableOpacity
              className="bg-neon-green border-4 border-black py-4 flex-row justify-center items-center"
              style={{
                shadowColor: '#39ff14',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.6,
                shadowRadius: 8,
                gap: 10,
              }}
              onPress={() => Alert.alert('Follow', `Following ${scannedUser.displayName || 'user'}...`)}
            >
              <UserPlus size={20} color="#000" strokeWidth={2.5} />
              <Text
                className="text-black text-base font-black"
                style={{ fontFamily: 'CourierPrime_700Bold' }}
              >
                FOLLOW
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-neon-pink border-4 border-black py-4 flex-row justify-center items-center"
              style={{
                shadowColor: '#ff006e',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.6,
                shadowRadius: 8,
                gap: 10,
              }}
              onPress={() => Alert.alert('Rave Crew', `Adding ${scannedUser.displayName || 'user'} to your crew...`)}
            >
              <Users size={20} color="#000" strokeWidth={2.5} />
              <Text
                className="text-black text-base font-black"
                style={{ fontFamily: 'CourierPrime_700Bold' }}
              >
                ADD TO CREW
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white border-4 border-black py-4 flex-row justify-center items-center"
              style={{ gap: 10 }}
              onPress={() => Alert.alert('Share', 'Sharing vibe check results...')}
            >
              <Share2 size={20} color="#000" strokeWidth={2.5} />
              <Text
                className="text-black text-base font-black"
                style={{ fontFamily: 'CourierPrime_700Bold' }}
              >
                SHARE RESULTS
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Box */}
          <View className="mx-5 mb-6 bg-black border-2 border-neon-green p-4">
            <Text
              className="text-neon-green text-xs font-black mb-2"
              style={{ fontFamily: 'CourierPrime_700Bold' }}
            >
              ℹ️ ABOUT COMPATIBILITY
            </Text>
            <Text
              className="text-white text-xs leading-5"
              style={{ fontFamily: 'CourierPrime_400Regular' }}
            >
              Compatibility is calculated based on shared music genres discovered through Spotify listening history. Higher scores mean you have more genres in common!
            </Text>
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}
