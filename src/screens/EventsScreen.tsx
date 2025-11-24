import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { EventWithTracks } from "../types";
import { edmTrainService } from "../services/edmTrainApi";
import { locationService } from "../services/locationService";
import { colors } from "../theme/colors";
import { commonStyles } from "../theme/styles";
import EventsHeader from "../components/EventsHeader";
import EventsList from "../components/EventsList";

export default function EventsScreen() {
  const [events, setEvents] = useState<EventWithTracks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCity, setCurrentCity] = useState<string>("");
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);
  const [isUsingUserLocation, setIsUsingUserLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  // Load events once on mount and fetch available locations
  useEffect(() => {
    loadEvents();
    loadAvailableLocations();
  }, []); // Empty dependency array = runs only once on mount

  const loadAvailableLocations = async () => {
    try {
      console.log("Loading available locations...");
      const locations = await edmTrainService.getAllLocations();
      console.log("Loaded locations:", locations.length);

      if (locations.length > 0) {
        console.log("First 5 locations:", locations.slice(0, 5).map(l => l.city || l.state));
      }

      setAvailableLocations(locations);
    } catch (err) {
      console.error("Error loading locations:", err);

      // Fallback to popular cities if API fails
      // Using state-level IDs from EDM Train API
      const fallbackCities = [
        { id: 36, city: "California", state: "California", stateCode: "CA" },
        { id: 73, city: "Florida", state: "Florida", stateCode: "FL" },
        { id: 74, city: "New York", state: "New York", stateCode: "NY" },
        { id: 44, city: "Illinois", state: "Illinois", stateCode: "IL" },
        { id: 47, city: "Nevada", state: "Nevada", stateCode: "NV" },
        { id: 54, city: "Colorado", state: "Colorado", stateCode: "CO" },
        { id: 75, city: "Texas", state: "Texas", stateCode: "TX" },
        { id: 65, city: "Washington", state: "Washington", stateCode: "WA" },
        { id: 66, city: "Oregon", state: "Oregon", stateCode: "OR" },
      ];
      console.log("Using fallback cities:", fallbackCities.length);
      setAvailableLocations(fallbackCities);
    }
  };

  const filterAndSortEvents = (
    eventsList: EventWithTracks[]
  ): EventWithTracks[] => {
    // Sort by date (earliest first) - no date filtering
    return eventsList.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });
  };

  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("=== Loading events based on user location ===");

      // Clear dropdown selection when using user location
      setSelectedLocation("");

      // Get user's actual location
      const userLocation = await locationService.getCurrentCity();

      if (userLocation && userLocation.city) {
        console.log("User location:", userLocation.city);
        setCurrentCity(userLocation.city);
        setIsUsingUserLocation(true);

        // Find matching location in availableLocations and set as selected
        const matchingLocation = availableLocations.find(
          loc => loc.city?.toLowerCase() === userLocation.city.toLowerCase() ||
                 loc.state?.toLowerCase() === userLocation.city.toLowerCase()
        );
        if (matchingLocation) {
          setSelectedLocation(matchingLocation.id.toString());
        }

        // Fetch events for user's city
        const fetchedEvents = await edmTrainService.getEventsByCity(
          userLocation.city
        );
        const sortedEvents = filterAndSortEvents(fetchedEvents);

        if (sortedEvents.length === 0) {
          setError(
            "No upcoming events found in your area. Try searching for a different city."
          );
        }

        setEvents(sortedEvents);
      } else {
        // Fallback to default cities if location unavailable
        console.log("Could not get user location, using default");
        setCurrentCity("Los Angeles & Miami");
        setIsUsingUserLocation(false);
        const fetchedEvents = await edmTrainService.getDefaultEvents();
        const sortedEvents = filterAndSortEvents(fetchedEvents);
        setEvents(sortedEvents);
      }
    } catch (err) {
      console.error("Error loading events:", err);
      setError("Failed to load events. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventsByLocationId = async (
    locationId: string,
    cityName: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      setIsUsingUserLocation(false);
      console.log("Fetching events for location ID:", locationId);
      const fetchedEvents = await edmTrainService.getEventsByLocation(
        locationId
      );
      const sortedEvents = filterAndSortEvents(fetchedEvents);

      if (sortedEvents.length === 0) {
        setError(`No upcoming events found in "${cityName}".`);
      }

      setEvents(sortedEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(
        "Failed to fetch events. Please check your EDM Train API key in src/config.ts"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = useCallback((locationId: string) => {
    console.log("Location changed:", locationId);

    if (!locationId) return;

    setSelectedLocation(locationId);
    setIsUsingUserLocation(false);

    // Find the location to get the name
    const location = availableLocations.find(loc => loc.id.toString() === locationId);
    if (location) {
      const cityName = location.city || location.state;
      setCurrentCity(cityName);
      console.log("Fetching events for location:", cityName, "ID:", locationId);
      fetchEventsByLocationId(locationId, cityName);
    }
  }, [availableLocations]);


  if (isLoading && events.length === 0) {
    return (
      <SafeAreaView style={commonStyles.safeArea}>
        <View style={commonStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {currentCity
              ? `Finding events in ${currentCity}...`
              : "Getting your location..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <EventsHeader
        availableLocations={availableLocations}
        selectedLocation={selectedLocation}
        isUsingUserLocation={isUsingUserLocation}
        onLocationChange={handleLocationChange}
        onUseMyLocation={loadEvents}
      />
      <EventsList
        events={events}
        isLoading={isLoading}
        error={error}
        onRefresh={loadEvents}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
