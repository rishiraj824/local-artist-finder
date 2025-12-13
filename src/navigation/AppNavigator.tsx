import React from 'react';
import { Text, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import EventsScreen from '../screens/EventsScreen';
import GenresScreen from '../screens/GenresScreen';
import ArtistDetailsScreen from '../screens/ArtistDetailsScreen';
import GenreDetailScreen from '../screens/GenreDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontFamily: 'Lato_700Bold',
          fontSize: 12,
          fontWeight: '700',
        },
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
        name="Events"
        component={EventsScreen}
        options={{
          title: 'Where are we going?',
          tabBarLabel: 'Events',
          tabBarIcon: ({ size }) => (
            <Text style={{ fontSize: size }}>🎉</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Genres"
        component={GenresScreen}
        options={{
          title: 'Explore Genres',
          tabBarLabel: 'Explore',
          tabBarIcon: ({ size }) => (
            <Text style={{ fontSize: size }}>🎵</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ size }) => (
            <Text style={{ fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
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
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ArtistDetails"
              component={ArtistDetailsScreen}
              options={{
                title: 'Artist Details',
              }}
            />
            <Stack.Screen
              name="GenreDetail"
              component={GenreDetailScreen}
              options={{
                title: 'Genre',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
