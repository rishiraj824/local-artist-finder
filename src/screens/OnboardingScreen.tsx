import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Music, MapPin, Sparkles, Check } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const ONBOARDING_KEY = '@onboarding_completed';

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { connectSpotify, loading: spotifyLoading } = useSpotifyAuth();

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding state:', error);
      onComplete(); // Still complete even if save fails
    }
  };

  const nextStep = async () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      // On the final step (Spotify connection), trigger Spotify auth
      try {
        await connectSpotify();
        // Complete onboarding after Spotify connection attempt
        completeOnboarding();
      } catch (error) {
        console.error('Error connecting Spotify:', error);
        // Still complete onboarding even if connection fails
        completeOnboarding();
      }
    }
  };

  const skip = () => {
    completeOnboarding();
  };

  const steps = [
    {
      title: 'DISCOVER LOCAL DROPS',
      description: 'Find EDM events in your city and explore new music from local artists.',
      icon: <MapPin size={80} color="#39ff14" strokeWidth={2.5} />,
      highlight: 'Never miss a show',
    },
    {
      title: 'TRACK YOUR JOURNEY',
      description: 'See which genres you\'ve explored and which ones are waiting to be discovered.',
      icon: <Music size={80} color="#ff006e" strokeWidth={2.5} />,
      highlight: 'Explore new sounds',
      visual: (
        <View className="w-full px-6 my-6">
          {/* Genre Exploration Example */}
          <View className="mb-4">
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3" style={{ fontFamily: 'CourierPrime_700Bold' }}>
              EXPLORED GENRES
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <View className="bg-neon-green px-4 py-2 border-2 border-black flex-row items-center gap-2">
                <Check size={14} color="#000" strokeWidth={3} />
                <Text className="text-black text-sm font-black" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                  TECHNO
                </Text>
              </View>
              <View className="bg-neon-green px-4 py-2 border-2 border-black flex-row items-center gap-2">
                <Check size={14} color="#000" strokeWidth={3} />
                <Text className="text-black text-sm font-black" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                  HOUSE
                </Text>
              </View>
              <View className="bg-neon-green px-4 py-2 border-2 border-black flex-row items-center gap-2">
                <Check size={14} color="#000" strokeWidth={3} />
                <Text className="text-black text-sm font-black" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                  D&B
                </Text>
              </View>
            </View>
          </View>

          <View>
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3" style={{ fontFamily: 'CourierPrime_700Bold' }}>
              UNEXPLORED GENRES
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <View className="bg-concrete-mid px-4 py-2 border-2 border-concrete-light">
                <Text className="text-gray-500 text-sm font-black" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                  DUBSTEP
                </Text>
              </View>
              <View className="bg-concrete-mid px-4 py-2 border-2 border-concrete-light">
                <Text className="text-gray-500 text-sm font-black" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                  TRANCE
                </Text>
              </View>
              <View className="bg-concrete-mid px-4 py-2 border-2 border-concrete-light">
                <Text className="text-gray-500 text-sm font-black" style={{ fontFamily: 'CourierPrime_700Bold' }}>
                  AMBIENT
                </Text>
              </View>
            </View>
          </View>
        </View>
      ),
    },
    {
      title: 'CONNECT SPOTIFY',
      description: 'Link your Spotify to get personalized recommendations and track your music journey.',
      icon: <Sparkles size={80} color="#00f0ff" strokeWidth={2.5} />,
      highlight: 'Enhanced experience',
      features: [
        'See artists you already follow',
        'Get personalized event recommendations',
        'Track genres you\'ve discovered',
        'Preview music instantly',
      ],
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <SafeAreaView className="flex-1 bg-concrete-dark">
      {/* Progress Indicator */}
      <View className="px-6 pt-4 flex-row justify-between items-center">
        <View className="flex-row gap-2">
          {steps.map((_, index) => (
            <View
              key={index}
              className={`h-1 ${index === currentStep ? 'w-12 bg-neon-green' : 'w-6 bg-concrete-light'}`}
              style={{
                shadowColor: index === currentStep ? '#39ff14' : 'transparent',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 6,
              }}
            />
          ))}
        </View>
        <TouchableOpacity onPress={skip}>
          <Text className="text-gray-400 text-sm font-bold uppercase tracking-wide" style={{ fontFamily: 'CourierPrime_700Bold' }}>
            SKIP
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <View className="items-center mb-8">
          <View
            className="p-6 border-4 border-white bg-black"
            style={{
              shadowColor: currentStep === 0 ? '#39ff14' : currentStep === 1 ? '#ff006e' : '#00f0ff',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.6,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            {currentStepData.icon}
          </View>
        </View>

        {/* Title */}
        <Text
          className="text-4xl font-black uppercase tracking-tighter leading-tight mb-4 text-white text-center"
          style={{
            fontFamily: 'BlackOpsOne_400Regular',
            textShadowColor: currentStep === 0 ? '#39ff14' : currentStep === 1 ? '#ff006e' : '#00f0ff',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 20,
          }}
        >
          {currentStepData.title}
        </Text>

        {/* Highlight Badge */}
        <View className="items-center mb-6">
          <View className={`px-4 py-2 border-2 ${currentStep === 0 ? 'bg-neon-green border-neon-green' : currentStep === 1 ? 'bg-neon-pink border-neon-pink' : 'bg-electric-blue border-electric-blue'}`}>
            <Text className="text-black text-xs font-black uppercase tracking-wide" style={{ fontFamily: 'CourierPrime_700Bold' }}>
              {currentStepData.highlight}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text
          className="text-lg text-gray-300 text-center leading-relaxed mb-8"
          style={{ fontFamily: 'CourierPrime_400Regular' }}
        >
          {currentStepData.description}
        </Text>

        {/* Visual Example (Step 2) */}
        {currentStepData.visual && currentStepData.visual}

        {/* Features List (Step 3) */}
        {currentStepData.features && (
          <View className="px-4">
            {currentStepData.features.map((feature, index) => (
              <View key={index} className="flex-row items-center gap-3 mb-4">
                <View className="w-8 h-8 bg-neon-green border-2 border-black items-center justify-center">
                  <Check size={16} color="#000" strokeWidth={3} />
                </View>
                <Text
                  className="flex-1 text-white text-base"
                  style={{ fontFamily: 'CourierPrime_400Regular' }}
                >
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Button */}
      <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-concrete-dark border-t-2 border-concrete-mid">
        <TouchableOpacity
          className={`py-4 px-6 border-4 ${currentStep === 2 ? 'bg-neon-pink border-neon-pink' : 'bg-neon-green border-neon-green'}`}
          style={{
            shadowColor: currentStep === 2 ? '#ff006e' : '#39ff14',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.6,
            shadowRadius: 12,
            elevation: 10,
          }}
          onPress={nextStep}
          activeOpacity={0.8}
          disabled={spotifyLoading}
        >
          {spotifyLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text
              className="text-black text-xl font-black uppercase tracking-wide text-center"
              style={{ fontFamily: 'BlackOpsOne_400Regular' }}
            >
              {currentStep === 2 ? "CONNECT SPOTIFY" : 'NEXT'}
            </Text>
          )}
        </TouchableOpacity>

        {currentStep === 2 && (
          <TouchableOpacity
            className="mt-3 py-3"
            onPress={skip}
          >
            <Text
              className="text-gray-400 text-sm font-bold uppercase tracking-wide text-center"
              style={{ fontFamily: 'CourierPrime_700Bold' }}
            >
              I'll connect later
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// Export function to check if onboarding has been completed
export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding state:', error);
    return false;
  }
};

// Export function to reset onboarding (useful for testing)
export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
  }
};
