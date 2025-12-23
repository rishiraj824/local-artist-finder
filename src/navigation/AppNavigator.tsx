import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Calendar, Music, User } from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen, { hasCompletedOnboarding } from '../screens/OnboardingScreen';
import EventsScreen from '../screens/EventsScreen';
import GenresScreen from '../screens/GenresScreen';
import ArtistDetailsScreen from '../screens/ArtistDetailsScreen';
import GenreDetailScreen from '../screens/GenreDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
// import ScanScreen from '../screens/ScanScreen'; // Temporarily disabled - barcode scanner removed
import VibeCheckScreen from '../screens/VibeCheckScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#3a3a3a',
          borderTopWidth: 2,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#39ff14',
        tabBarInactiveTintColor: '#666',
        tabBarShowLabel: false,
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: 'Lato_700Bold',
          fontWeight: 'bold',
          fontSize: 20,
        },
      }}
    >
      <Tab.Screen
        name="Genres"
        component={GenresScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Music size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      if (isAuthenticated) {
        const completed = await hasCompletedOnboarding();
        console.log('[AppNavigator] Onboarding check - completed:', completed);
        setShowOnboarding(!completed);
      } else {
        // Reset onboarding state when user logs out
        setShowOnboarding(false);
      }
      setCheckingOnboarding(false);
    };

    checkOnboarding();
  }, [isAuthenticated]);

  // Show loading spinner while checking auth state or onboarding state
  if (loading || checkingOnboarding) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Show splash screen on first load (only for non-authenticated users)
  if (showSplash && !isAuthenticated) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Show onboarding for authenticated users who haven't completed it
  if (isAuthenticated && showOnboarding) {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontFamily: 'Lato_700Bold',
            fontWeight: 'bold',
            fontSize: 20,
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false, headerTitle: '' }}
            />
            <Stack.Screen
              name="ArtistDetails"
              component={ArtistDetailsScreen}
              options={{
                title: '',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="GenreDetail"
              component={GenreDetailScreen}
              options={{
                title: '',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                title: '',
                headerBackTitleVisible: false,
                headerStyle: {
                  backgroundColor: colors.surface,
                },
                headerTintColor: colors.text,
              }}
            />
            {/* Scan screen temporarily disabled - barcode scanner removed */}
            <Stack.Screen
              name="VibeCheck"
              component={VibeCheckScreen}
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
