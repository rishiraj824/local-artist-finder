import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
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
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

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

  // Calculate top 3 genres from events
  const topGenres = useMemo(() => {
    const genreCounts: { [key: string]: number } = {};

    events.forEach(event => {
      if (event.genres && event.genres.length > 0) {
        event.genres.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });

    return Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);
  }, [events]);

  // Filter events by selected genre
  const filteredEvents = useMemo(() => {
    if (!selectedGenre) return events;

    return events.filter(event =>
      event.genres && event.genres.includes(selectedGenre)
    );
  }, [events, selectedGenre]);


  if (isLoading && events.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-concrete-dark justify-center items-center">
        <ActivityIndicator size="large" color="#ff006e" />
        <Text className="text-lg font-black text-neon-pink mt-3 tracking-widest" style={{ fontFamily: 'BlackOpsOne_400Regular' }}>
          {currentCity
            ? `FINDING EVENTS IN ${currentCity.toUpperCase()}...`
            : "GETTING YOUR LOCATION..."}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-concrete-dark">
      <EventsHeader
        availableLocations={availableLocations}
        selectedLocation={selectedLocation}
        isUsingUserLocation={isUsingUserLocation}
        onLocationChange={handleLocationChange}
        onUseMyLocation={loadEvents}
      />

      {/* Genre Filter */}
      {topGenres.length > 0 && (
        <View className="px-4 py-3 bg-concrete-dark border-b-2 border-concrete-mid">
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2" style={{ fontFamily: 'CourierPrime_700Bold' }}>
            FILTER BY GENRE
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className={`px-4 py-2 border-2 ${!selectedGenre ? 'bg-neon-green border-neon-green' : 'bg-concrete-mid border-concrete-light'}`}
                onPress={() => setSelectedGenre(null)}
              >
                <Text
                  className={`text-sm font-black uppercase tracking-wide ${!selectedGenre ? 'text-black' : 'text-gray-400'}`}
                  style={{ fontFamily: 'CourierPrime_700Bold' }}
                >
                  ALL
                </Text>
              </TouchableOpacity>
              {topGenres.map((genre) => (
                <TouchableOpacity
                  key={genre}
                  className={`px-4 py-2 border-2 ${selectedGenre === genre ? 'bg-neon-pink border-neon-pink' : 'bg-concrete-mid border-concrete-light'}`}
                  onPress={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
                >
                  <Text
                    className={`text-sm font-black uppercase tracking-wide ${selectedGenre === genre ? 'text-black' : 'text-gray-400'}`}
                    style={{ fontFamily: 'CourierPrime_700Bold' }}
                  >
                    {genre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <EventsList
        events={filteredEvents}
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
