import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import EventsScreen from '../screens/EventsScreen';
import ArtistDetailsScreen from '../screens/ArtistDetailsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
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
        <Stack.Screen
          name="Events"
          component={EventsScreen}
          options={{
            title: 'Where are we going?',
          }}
        />
        <Stack.Screen
          name="ArtistDetails"
          component={ArtistDetailsScreen}
          options={{
            title: 'Artist Details',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
