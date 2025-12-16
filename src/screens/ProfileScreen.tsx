import React, { useState, useCallback, useEffect, useRef } from "react";
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
  SafeAreaView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { userService } from "../services/userService";
import QRCode from "react-native-qrcode-svg";
import { Camera, Wifi } from "lucide-react-native";
import { useNFC } from "../hooks/useNFC";

export default function ProfileScreen() {
  const { user, signOut, loading: authLoading, refreshUser } = useAuth();
  const { exploredGenres, savedEvents, favoriteArtists } = useUserPreferences();
  const navigation = useNavigation<any>();
  const [showGenreList, setShowGenreList] = useState(false);
  const { isSupported, isEnabled, readNFC, isReading } = useNFC();

  // Animation for QR code glow effect
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Refresh user data every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('[ProfileScreen] Screen focused, refreshing user data...');
      refreshUser();
    }, [refreshUser])
  );

  // Start glow animation on mount
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  const handleNFCTap = async () => {
    if (!isSupported) {
      Alert.alert(
        'NFC Not Supported',
        'Your device does not support NFC. Use the QR code scan instead.',
        [
          { text: 'OK' },
          { text: 'Scan QR', onPress: () => navigation.navigate('Scan') },
        ]
      );
      return;
    }

    if (!isEnabled) {
      Alert.alert(
        'NFC Disabled',
        'Please enable NFC in your device settings to use tap to connect.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Tap to Connect',
      'Hold your phone near another device to share your profile and check vibe compatibility.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            const scannedUserId = await readNFC();
            if (scannedUserId) {
              navigation.navigate('VibeCheck', { scannedUserId });
            }
          },
        },
      ]
    );
  };

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-concrete-dark justify-center items-center">
        <ActivityIndicator size="large" color="#39ff14" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-concrete-dark justify-center items-center">
        <Text
          className="text-base font-bold text-neon-pink"
          style={{ fontFamily: "Lato_700Bold" }}
        >
          No user data available
        </Text>
      </SafeAreaView>
    );
  }

  const userInitials = (user.displayName || user.email).charAt(0).toUpperCase();
  const userId = user.id.substring(0, 10).toUpperCase();

  return (
    <ScrollView
      className="flex-1 bg-concrete-dark pb-24"
      contentContainerStyle={{
        paddingTop: 48,
        paddingHorizontal: 16,
        maxWidth: 448,
        alignSelf: "center",
        width: "100%",
      }}
    >
      {/* Backstage Pass Container */}
      <View
        className="bg-white p-1 rounded-2xl shadow-2xl"
        style={{
          transform: [{ rotate: "1deg" }],
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        {/* Lanyard Hole */}
        <View
          className="absolute w-4 h-12 bg-black/80 rounded-full"
          style={{ top: -24, left: "50%", marginLeft: -8, zIndex: 0 }}
        />
        <View
          className="absolute w-12 h-3 bg-gray-300 rounded-full border border-gray-400"
          style={{
            top: 16,
            left: "50%",
            marginLeft: -24,
            zIndex: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
          }}
        />

        {/* Pass Content */}
        <View className="bg-gray-200 rounded-xl p-6 border-2 border-dashed border-gray-400 relative overflow-hidden">
          {/* Hologram Effect */}
          <LinearGradient
            colors={["transparent", "rgba(0, 240, 255, 0.2)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="absolute w-24 h-24"
            style={{ top: 0, right: 0, transform: [{ rotate: "45deg" }] }}
          />

          {/* Header */}
          <View className="text-center mb-6 border-b-4 border-black pb-4">
            <Text
              className="text-4xl font-black text-black tracking-tighter"
              style={{ fontFamily: "BlackOpsOne_400Regular" }}
            >
              ACCESS PASS
            </Text>
            <Text
              className="text-xs tracking-widest mt-1 font-bold"
              style={{ fontFamily: "CourierPrime_700Bold" }}
            >
              ALL AREAS // VIP // 2025
            </Text>
          </View>

          {/* User Info */}
          <View className="flex-row gap-4 mb-6">
            <View
              className="w-24 h-24 bg-gray-800 overflow-hidden border-2 border-black"
              style={{ transform: [{ rotate: "-2deg" }] }}
            >
              {user.photoURL ? (
                <Image
                  source={{ uri: user.photoURL }}
                  className="w-full h-full"
                />
              ) : (
                <View className="w-full h-full bg-concrete-mid justify-center items-center">
                  <Text className="text-4xl font-bold text-white">
                    {userInitials}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-1 justify-center">
              <Text
                className="text-2xl leading-none mb-1 font-black"
                style={{ fontFamily: "PermanentMarker_400Regular" }}
              >
                {user.displayName || "USER"}
              </Text>
              <Text
                className="text-xs text-gray-600 mb-2"
                style={{ fontFamily: "CourierPrime_400Regular" }}
              >
                ID: {userId}
              </Text>
              <View
                className="bg-black px-2 py-1"
                style={{
                  transform: [{ rotate: "-1deg" }],
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  className="text-neon-green text-xs font-bold"
                  style={{ fontFamily: "CourierPrime_700Bold" }}
                >
                  VERIFIED MEMBER
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="mb-6" style={{ gap: 12 }}>
            <View className="flex-row" style={{ gap: 12 }}>
              <View className="flex-1 border-2 border-black p-2 relative">
                <View
                  className="absolute bg-gray-200 px-1"
                  style={{ top: -12, left: 8 }}
                >
                  <Text
                    className="text-[10px] font-bold"
                    style={{ fontFamily: "CourierPrime_700Bold" }}
                  >
                    GENRES
                  </Text>
                </View>
                <Text
                  className="text-3xl font-black"
                  style={{ fontFamily: "BlackOpsOne_400Regular" }}
                >
                  {user?.genresDiscoveredCount || exploredGenres.length || 0}
                </Text>
              </View>
              <View className="flex-1 border-2 border-black p-2 relative">
                <View
                  className="absolute bg-gray-200 px-1"
                  style={{ top: -12, left: 8 }}
                >
                  <Text
                    className="text-[10px] font-bold"
                    style={{ fontFamily: "CourierPrime_700Bold" }}
                  >
                    EVENTS
                  </Text>
                </View>
                <Text
                  className="text-3xl font-black"
                  style={{ fontFamily: "BlackOpsOne_400Regular" }}
                >
                  {savedEvents.length || 28}
                </Text>
              </View>
            </View>
            <View className="border-2 border-black p-2 bg-black relative">
              <View
                className="absolute bg-black px-1 border border-white"
                style={{ top: -12, left: 8 }}
              >
                <Text
                  className="text-[10px] font-bold text-white"
                  style={{ fontFamily: "CourierPrime_700Bold" }}
                >
                  RAVE HOURS
                </Text>
              </View>
              <Text
                className="text-3xl font-black text-neon-pink"
                style={{ fontFamily: "BlackOpsOne_400Regular" }}
              >
                {savedEvents.length > 0
                  ? (savedEvents.length * 5.5).toFixed(1)
                  : "154.0"}
              </Text>
            </View>
          </View>

          {/* Discovered Genres List */}
          {user?.genresDiscovered && user.genresDiscovered.length > 0 && (
            <View className="mb-6">
              <TouchableOpacity
                onPress={() => setShowGenreList(!showGenreList)}
                className="border-2 border-black p-3 bg-neon-green relative"
              >
                <View
                  className="absolute bg-neon-green px-1 border border-black"
                  style={{ top: -12, left: 8 }}
                >
                  <Text
                    className="text-[10px] font-bold"
                    style={{ fontFamily: "CourierPrime_700Bold" }}
                  >
                    MY GENRES
                  </Text>
                </View>
                <Text
                  className="text-sm font-bold text-center"
                  style={{ fontFamily: "CourierPrime_700Bold" }}
                >
                  {showGenreList ? "HIDE LIST" : "VIEW LIST"} ({user.genresDiscovered.length})
                </Text>
              </TouchableOpacity>

              {showGenreList && (
                <View className="border-2 border-black border-t-0 p-3 bg-gray-100">
                  <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                    {user.genresDiscovered.sort().map((genre, index) => (
                      <View
                        key={index}
                        className="bg-black px-2 py-1 rounded"
                      >
                        <Text
                          className="text-[10px] text-neon-green font-bold"
                          style={{ fontFamily: "CourierPrime_700Bold" }}
                        >
                          {genre.toUpperCase()}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row justify-between items-center pt-2 border-t border-gray-400">
            <TouchableOpacity
              className="flex-row items-center gap-2"
              onPress={() => navigation.navigate('Settings')}
            >
              <Text
                className="text-xs font-bold"
                style={{ fontFamily: "CourierPrime_700Bold" }}
              >
                ⚙️ SETTINGS
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center gap-2"
              onPress={handleSignOut}
            >
              <Text
                className="text-xs font-bold text-red-600"
                style={{ fontFamily: "CourierPrime_700Bold" }}
              >
                LOGOUT 🚪
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Animated QR Code with Neon Glow */}
      <View className="mt-6 mb-6 items-center px-4">
        <Text
          className="text-xs font-bold text-center mb-3 text-white"
          style={{ fontFamily: "CourierPrime_700Bold" }}
        >
          SCAN TO CONNECT
        </Text>
        <Animated.View
          style={{
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.6, 1],
            }),
            transform: [
              {
                scale: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.02],
                }),
              },
            ],
          }}
        >
          <View
            className="bg-white p-3 border-4 border-black"
            style={{
              shadowColor: "#39ff14",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 15,
            }}
          >
            <QRCode value={user.id} size={120} backgroundColor="white" color="black" />
          </View>
        </Animated.View>
        <Text
          className="text-[10px] text-gray-400 text-center mt-2"
          style={{ fontFamily: "CourierPrime_400Regular" }}
        >
          ID: {userId}
        </Text>
      </View>

      {/* Vibe Check Buttons */}
      <View className="px-4 mb-6" style={{ gap: 12 }}>
        {/* Scan Mode temporarily disabled - will be re-enabled after fixing barcode scanner */}

        <TouchableOpacity
          className="bg-black border-4 border-neon-pink py-4 flex-row justify-center items-center gap-2"
          style={{
            shadowColor: "#ff006e",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.6,
            shadowRadius: 8,
          }}
          onPress={handleNFCTap}
          disabled={isReading}
        >
          {isReading ? (
            <ActivityIndicator color="#ff006e" />
          ) : (
            <Wifi size={22} color="#ff006e" strokeWidth={2.5} />
          )}
          <Text
            className="text-neon-pink text-base font-black tracking-wide"
            style={{ fontFamily: "CourierPrime_700Bold" }}
          >
            {isReading ? 'READING...' : 'TAP TO VIBE CHECK'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Decorative Stamp */}
      <View
        className="absolute w-24 h-24 border-4 border-neon-pink rounded-full opacity-60 items-center justify-center"
        style={{ top: 80, right: 8, transform: [{ rotate: "12deg" }] }}
      >
        <Text
          className="text-neon-pink text-xs font-black text-center"
          style={{ fontFamily: "BlackOpsOne_400Regular", maxWidth: 70 }}
        >
          APPROVED
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({});
