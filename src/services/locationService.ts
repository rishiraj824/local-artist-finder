import * as Location from 'expo-location';
import { LocationData } from '../types';

export class LocationService {
  /**
   * Request location permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Get the user's current location
   */
  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const hasPermission = await this.requestPermissions();

      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to get city information
   */
  async getCityFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<LocationData | null> {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result.length > 0) {
        const location = result[0];
        return {
          city: location.city || location.subregion || 'Unknown',
          state: location.region || undefined,
          country: location.country || 'Unknown',
          latitude,
          longitude,
        };
      }

      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  /**
   * Get the user's current city
   */
  async getCurrentCity(): Promise<LocationData | null> {
    try {
      const location = await this.getCurrentLocation();

      if (!location) {
        return null;
      }

      return await this.getCityFromCoordinates(
        location.coords.latitude,
        location.coords.longitude
      );
    } catch (error) {
      console.error('Error getting current city:', error);
      return null;
    }
  }
}

export const locationService = new LocationService();
