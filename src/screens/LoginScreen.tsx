import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { Music, Calendar, Star, Circle } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const { signInWithGoogle, signInWithSpotify } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "spotify" | null
  >(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setLoadingProvider("google");
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert(
        "Sign In Error",
        error.message || "Failed to sign in with Google"
      );
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleSpotifySignIn = async () => {
    try {
      setLoading(true);
      setLoadingProvider("spotify");
      await signInWithSpotify();
    } catch (error: any) {
      Alert.alert(
        "Sign In Error",
        error.message || "Failed to sign in with Spotify"
      );
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-concrete-dark">
      {/* Grid Background */}
      <View style={StyleSheet.absoluteFill} className="opacity-5">
        <View style={styles.gridHorizontal} />
        <View style={styles.gridVertical} />
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient Text */}
        <View className="items-center">
          <MaskedView
            maskElement={
              <View style={{ backgroundColor: "transparent" }}>
                <Text
                  className="text-6xl font-black tracking-tighter lowercase"
                  style={{
                    fontFamily: "BlackOpsOne_400Regular",
                    transform: [{ scaleY: 1.3 }],
                  }}
                >
                  drops
                </Text>
              </View>
            }
          >
            <LinearGradient
              colors={["#ff006e", "#39ff14", "#00f0ff", "#ffff00"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            >
              <Text
                className="text-6xl font-black tracking-tighter lowercase opacity-0"
                style={{
                  fontFamily: "BlackOpsOne_400Regular",
                  transform: [{ scaleY: 1.3 }],
                }}
              >
                drops
              </Text>
            </LinearGradient>
          </MaskedView>

          {/* Dripping effect lines */}
          <View className="flex-row justify-center gap-2">
            <View
              className="w-1 h-6 bg-neon-green"
              style={{
                shadowColor: "#39ff14",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 8,
              }}
            />
            <View
              className="w-1 h-8 bg-neon-pink"
              style={{
                shadowColor: "#ff006e",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 8,
              }}
            />
            <View
              className="w-1 h-4 bg-neon-blue"
              style={{
                shadowColor: "#00f0ff",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 8,
              }}
            />
            <View
              className="w-1 h-7 bg-yellow-300"
              style={{
                shadowColor: "#ffff00",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 8,
              }}
            />
          </View>
        </View>

        {/* Benefits */}
        <View className="mb-3 gap-2">
          <View className="flex-row items-center px-4 py-2 bg-concrete-mid border-l-4 border-neon-green">
            <Music size={24} color="#39ff14" strokeWidth={2.5} />
            <Text
              className="ml-4 text-white text-sm font-bold tracking-wide"
              style={{ fontFamily: "CourierPrime_700Bold" }}
            >
              TRACK EXPLORED GENRES
            </Text>
          </View>

          <View className="flex-row items-center px-4 py-2 bg-concrete-mid border-l-4 border-neon-pink">
            <Calendar size={24} color="#ff006e" strokeWidth={2.5} />
            <Text
              className="ml-4 text-white text-sm font-bold tracking-wide"
              style={{ fontFamily: "CourierPrime_700Bold" }}
            >
              SAVE EVENTS TO ATTEND
            </Text>
          </View>

          <View className="flex-row items-center px-4 py-2 bg-concrete-mid border-l-4 border-neon-blue">
            <Star size={24} color="#00f0ff" strokeWidth={2.5} />
            <Text
              className="ml-4 text-white text-sm font-bold tracking-wide"
              style={{ fontFamily: "CourierPrime_700Bold" }}
            >
              BUILD ARTIST COLLECTION
            </Text>
          </View>
        </View>

        {/* Login Buttons */}
        <View className="gap-3 mb-2">
          <TouchableOpacity
            className="bg-white py-3 px-6 border-2 border-black flex-row items-center justify-center gap-3"
            style={{
              shadowColor: "#fff",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loadingProvider === "google" ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <View className="flex-row items-center justify-center">
                  <View style={{ position: 'relative', width: 24, height: 24 }}>
                    {/* Google "G" representation */}
                    <View style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2.5,
                      borderColor: '#4285f4',
                      backgroundColor: '#fff',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#4285f4' }}>G</Text>
                    </View>
                  </View>
                </View>
                <Text
                  className="text-black text-base font-black uppercase tracking-wide"
                  style={{ fontFamily: "CourierPrime_700Bold" }}
                >
                  CONTINUE WITH GOOGLE
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-neon-green py-3 px-6 border-2 border-black flex-row items-center justify-center gap-3"
            style={{
              shadowColor: "#39ff14",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.6,
              shadowRadius: 12,
            }}
            onPress={handleSpotifySignIn}
            disabled={loading}
          >
            {loadingProvider === "spotify" ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <View className="flex-row items-center justify-center">
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#1DB954',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Music size={14} color="#000" strokeWidth={3} />
                  </View>
                </View>
                <Text
                  className="text-black text-base font-black uppercase tracking-wide"
                  style={{ fontFamily: "CourierPrime_700Bold" }}
                >
                  CONTINUE WITH SPOTIFY
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <Text
          className="text-gray-500 text-xs text-center tracking-wide px-8"
          style={{ fontFamily: "CourierPrime_400Regular" }}
        >
          By continuing, you agree to track your music exploration journey
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gridHorizontal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    borderTopWidth: 2,
    borderTopColor: "#fff",
    borderStyle: "solid",
  },
  gridVertical: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    borderLeftWidth: 2,
    borderLeftColor: "#fff",
    borderStyle: "solid",
  },
});
