import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Auth screens
import PhoneAuthScreen from '../screens/auth/PhoneAuthScreen';
import VerificationCodeScreen from '../screens/auth/VerificationCodeScreen';
import ContactsSyncScreen from '../screens/auth/ContactsSyncScreen';

// App screens
import EventsScreen from '../screens/EventsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ArtistDetailsScreen from '../screens/ArtistDetailsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Helper function to get user initials
const getUserInitials = (displayName?: string): string => {
  if (!displayName) return '';

  const names = displayName.trim().split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }

  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

// Profile Icon Component
const ProfileIcon = ({ onPress, displayName }: { onPress: () => void; displayName?: string }) => {
  const initials = getUserInitials(displayName);

  return (
    <TouchableOpacity onPress={onPress} style={headerStyles.profileButton}>
      {initials ? (
        <View style={headerStyles.profileAvatar}>
          <Text style={headerStyles.profileAvatarText}>{initials}</Text>
        </View>
      ) : (
        <View style={headerStyles.profileIconContainer}>
          <Ionicons name="person-circle-outline" size={32} color={colors.text} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [authStep, setAuthStep] = useState<'phone' | 'code' | 'contacts'>('phone');
  const [showContactsSync, setShowContactsSync] = useState(true);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
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
            fontWeight: 'bold',
            fontSize: 20,
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {!user ? (
          // Auth flow
          <>
            {authStep === 'phone' && (
              <Stack.Screen
                name="PhoneAuth"
                options={{ headerShown: false }}
              >
                {() => (
                  <PhoneAuthScreen
                    onCodeSent={(phone) => {
                      setPhoneNumber(phone);
                      setAuthStep('code');
                    }}
                    onAuthenticated={() => {
                      // Skip to contacts sync after social login
                      setAuthStep('contacts');
                    }}
                  />
                )}
              </Stack.Screen>
            )}
            {authStep === 'code' && (
              <Stack.Screen
                name="VerificationCode"
                options={{ headerShown: false }}
              >
                {() => (
                  <VerificationCodeScreen
                    phoneNumber={phoneNumber}
                    onVerified={() => setAuthStep('contacts')}
                    onGoBack={() => setAuthStep('phone')}
                  />
                )}
              </Stack.Screen>
            )}
            {authStep === 'contacts' && showContactsSync && (
              <Stack.Screen
                name="ContactsSync"
                options={{ headerShown: false }}
              >
                {() => (
                  <ContactsSyncScreen
                    onComplete={() => setShowContactsSync(false)}
                    onSkip={() => setShowContactsSync(false)}
                  />
                )}
              </Stack.Screen>
            )}
          </>
        ) : (
          // Main app flow
          <>
            <Stack.Screen
              name="Events"
              component={EventsScreen}
              options={({ navigation }) => ({
                title: 'Where are we going?',
                headerRight: () => (
                  <ProfileIcon
                    onPress={() => navigation.navigate('Profile')}
                    displayName={user?.displayName}
                  />
                ),
              })}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                title: 'Profile',
              }}
            />
            <Stack.Screen
              name="ArtistDetails"
              component={ArtistDetailsScreen}
              options={({ navigation }) => ({
                title: 'Artist Details',
                headerRight: () => (
                  <ProfileIcon
                    onPress={() => navigation.navigate('Profile')}
                    displayName={user?.displayName}
                  />
                ),
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

const headerStyles = StyleSheet.create({
  profileButton: {
    marginRight: 8,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  profileIconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
