import './global.css';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { setIsAudioActiveAsync } from 'expo-audio';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Lato_400Regular, Lato_700Bold, Lato_900Black } from '@expo-google-fonts/lato';
import { BlackOpsOne_400Regular } from '@expo-google-fonts/black-ops-one';
import { PermanentMarker_400Regular } from '@expo-google-fonts/permanent-marker';
import { CourierPrime_400Regular, CourierPrime_700Bold } from '@expo-google-fonts/courier-prime';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Lato_400Regular,
    Lato_700Bold,
    Lato_900Black,
    BlackOpsOne_400Regular,
    PermanentMarker_400Regular,
    CourierPrime_400Regular,
    CourierPrime_700Bold,
  });

  useEffect(() => {
    // Configure audio mode for playback
    const configureAudio = async () => {
      try {
        await setIsAudioActiveAsync(true);
      } catch (error) {
        console.error('Error configuring audio:', error);
      }
    };

    configureAudio();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <AppNavigator />
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
