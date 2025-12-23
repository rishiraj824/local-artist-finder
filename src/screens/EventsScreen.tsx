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
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('date'); // 'date' or 'distance'
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null); // 'festival', 'rave', 'afters', 'show'
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Helper function to calculate date range for API
  const getDateRangeForAPI = (rangeType: string): { startDate: string; endDate?: string } | null => {
    if (rangeType === 'all') return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    switch (rangeType) {
      case 'today': {
        return { startDate: formatDate(today), endDate: formatDate(today) };
      }
      case 'tomorrow': {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return { startDate: formatDate(tomorrow), endDate: formatDate(tomorrow) };
      }
      case 'week': {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return { startDate: formatDate(today), endDate: formatDate(weekEnd) };
      }
      case 'month': {
        const monthEnd = new Date(today);
        monthEnd.setDate(monthEnd.getDate() + 30);
        return { startDate: formatDate(today), endDate: formatDate(monthEnd) };
      }
      default:
        return null;
    }
  };

  // Load events once on mount and fetch available locations
  useEffect(() => {
    loadEvents();
    loadAvailableLocations();
  }, []); // Empty dependency array = runs only once on mount

  // Refetch events when date range changes
  useEffect(() => {
    if (selectedLocation) {
      const location = availableLocations.find(loc => loc.id.toString() === selectedLocation);
      if (location) {
        const cityName = location.city || location.state;
        fetchEventsByLocationId(selectedLocation, cityName);
      }
    } else if (isUsingUserLocation) {
      loadEvents();
    }
  }, [selectedDateRange]);

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

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filterAndSortEvents = (
    eventsList: EventWithTracks[],
    sortBy: string = 'date'
  ): EventWithTracks[] => {
    const sorted = [...eventsList];

    if (sortBy === 'distance' && userLocation) {
      // Sort by distance (nearest first)
      return sorted.sort((a, b) => {
        const distA = (a.venue.latitude && a.venue.longitude)
          ? calculateDistance(userLocation.latitude, userLocation.longitude, a.venue.latitude, a.venue.longitude)
          : Infinity;
        const distB = (b.venue.latitude && b.venue.longitude)
          ? calculateDistance(userLocation.latitude, userLocation.longitude, b.venue.latitude, b.venue.longitude)
          : Infinity;
        return distA - distB;
      });
    } else {
      // Sort by date (earliest first)
      return sorted.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
      });
    }
  };

  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("=== Loading events based on user location ===");

      // Clear dropdown selection when using user location
      setSelectedLocation("");

      // Get date range for API
      const dateRange = getDateRangeForAPI(selectedDateRange);

      // Get user's actual location (including coordinates for distance sorting)
      const userLocationCoords = await locationService.getUserLocation();
      if (userLocationCoords) {
        setUserLocation(userLocationCoords);
      }

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

        // Fetch events for user's city with date parameters
        const fetchedEvents = await edmTrainService.getEventsByCity(
          userLocation.city,
          dateRange?.startDate,
          dateRange?.endDate
        );
        const sortedEvents = filterAndSortEvents(fetchedEvents, selectedSort);

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
        const sortedEvents = filterAndSortEvents(fetchedEvents, selectedSort);
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

      // Get date range for API
      const dateRange = getDateRangeForAPI(selectedDateRange);

      console.log("Fetching events for location ID:", locationId);
      const fetchedEvents = await edmTrainService.getEventsByLocation(
        locationId,
        dateRange?.startDate,
        dateRange?.endDate
      );
      const sortedEvents = filterAndSortEvents(fetchedEvents, selectedSort);

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

  // Filter events by selected genre, event type, and sort
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by genre
    if (selectedGenre) {
      filtered = filtered.filter(event =>
        event.genres && event.genres.includes(selectedGenre)
      );
    }

    // Filter by event type
    if (selectedEventType) {
      filtered = filtered.filter(event =>
        event.eventType === selectedEventType
      );
    }

    // Apply sorting
    return filterAndSortEvents(filtered, selectedSort);
  }, [events, selectedGenre, selectedEventType, selectedSort, userLocation]);


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

      {/* Date Filter */}
      <View className="px-4 py-3 bg-concrete-dark border-b-2 border-concrete-mid">
        <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2" style={{ fontFamily: 'CourierPrime_700Bold' }}>
          FILTER BY DATE
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {[
              { value: 'all', label: 'ALL' },
              { value: 'today', label: 'TODAY' },
              { value: 'tomorrow', label: 'TOMORROW' },
              { value: 'week', label: 'THIS WEEK' },
              { value: 'month', label: 'THIS MONTH' },
            ].map((range) => (
              <TouchableOpacity
                key={range.value}
                className={`px-4 py-2 border-2 ${selectedDateRange === range.value ? 'bg-neon-green border-neon-green' : 'bg-concrete-mid border-concrete-light'}`}
                onPress={() => setSelectedDateRange(range.value)}
              >
                <Text
                  className={`text-sm font-black uppercase tracking-wide ${selectedDateRange === range.value ? 'text-black' : 'text-gray-400'}`}
                  style={{ fontFamily: 'CourierPrime_700Bold' }}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Sort By */}
      <View className="px-4 py-3 bg-concrete-dark border-b-2 border-concrete-mid">
        <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2" style={{ fontFamily: 'CourierPrime_700Bold' }}>
          SORT BY
        </Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            className={`px-4 py-2 border-2 ${selectedSort === 'date' ? 'bg-electric-blue border-electric-blue' : 'bg-concrete-mid border-concrete-light'}`}
            onPress={() => setSelectedSort('date')}
          >
            <Text
              className={`text-sm font-black uppercase tracking-wide ${selectedSort === 'date' ? 'text-black' : 'text-gray-400'}`}
              style={{ fontFamily: 'CourierPrime_700Bold' }}
            >
              📅 DATE
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 border-2 ${selectedSort === 'distance' ? 'bg-electric-blue border-electric-blue' : 'bg-concrete-mid border-concrete-light'}`}
            onPress={() => setSelectedSort('distance')}
            disabled={!userLocation}
          >
            <Text
              className={`text-sm font-black uppercase tracking-wide ${selectedSort === 'distance' ? 'text-black' : userLocation ? 'text-gray-400' : 'text-gray-600'}`}
              style={{ fontFamily: 'CourierPrime_700Bold' }}
            >
              📍 DISTANCE
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Event Type Filter */}
      <View className="px-4 py-3 bg-concrete-dark border-b-2 border-concrete-mid">
        <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2" style={{ fontFamily: 'CourierPrime_700Bold' }}>
          FILTER BY TYPE
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className={`px-4 py-2 border-2 ${!selectedEventType ? 'bg-electric-blue border-electric-blue' : 'bg-concrete-mid border-concrete-light'}`}
              onPress={() => setSelectedEventType(null)}
            >
              <Text
                className={`text-sm font-black uppercase tracking-wide ${!selectedEventType ? 'text-black' : 'text-gray-400'}`}
                style={{ fontFamily: 'CourierPrime_700Bold' }}
              >
                ALL
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-4 py-2 border-2 ${selectedEventType === 'rave' ? 'bg-neon-green border-neon-green' : 'bg-concrete-mid border-concrete-light'}`}
              onPress={() => setSelectedEventType(selectedEventType === 'rave' ? null : 'rave')}
            >
              <Text
                className={`text-sm font-black uppercase tracking-wide ${selectedEventType === 'rave' ? 'text-black' : 'text-gray-400'}`}
                style={{ fontFamily: 'CourierPrime_700Bold' }}
              >
                ⚡ RAVE
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-4 py-2 border-2 ${selectedEventType === 'festival' ? 'bg-neon-pink border-neon-pink' : 'bg-concrete-mid border-concrete-light'}`}
              onPress={() => setSelectedEventType(selectedEventType === 'festival' ? null : 'festival')}
            >
              <Text
                className={`text-sm font-black uppercase tracking-wide ${selectedEventType === 'festival' ? 'text-black' : 'text-gray-400'}`}
                style={{ fontFamily: 'CourierPrime_700Bold' }}
              >
                🎪 FESTIVAL
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-4 py-2 border-2 ${selectedEventType === 'afters' ? 'bg-electric-blue border-electric-blue' : 'bg-concrete-mid border-concrete-light'}`}
              onPress={() => setSelectedEventType(selectedEventType === 'afters' ? null : 'afters')}
            >
              <Text
                className={`text-sm font-black uppercase tracking-wide ${selectedEventType === 'afters' ? 'text-black' : 'text-gray-400'}`}
                style={{ fontFamily: 'CourierPrime_700Bold' }}
              >
                🌙 AFTERS
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-4 py-2 border-2 ${selectedEventType === 'show' ? 'bg-gray-500 border-gray-500' : 'bg-concrete-mid border-concrete-light'}`}
              onPress={() => setSelectedEventType(selectedEventType === 'show' ? null : 'show')}
            >
              <Text
                className={`text-sm font-black uppercase tracking-wide ${selectedEventType === 'show' ? 'text-black' : 'text-gray-400'}`}
                style={{ fontFamily: 'CourierPrime_700Bold' }}
              >
                🎵 SHOW
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Genre Filter */}
      {topGenres.length > 0 && (
        <View className="px-4 py-3 bg-concrete-dark border-b-2 border-concrete-mid">
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2" style={{ fontFamily: 'CourierPrime_700Bold' }}>
            FILTER BY GENRE
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className={`px-4 py-2 border-2 ${!selectedGenre ? 'bg-neon-pink border-neon-pink' : 'bg-concrete-mid border-concrete-light'}`}
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
