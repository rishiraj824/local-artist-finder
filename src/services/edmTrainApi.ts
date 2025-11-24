import { config } from "../config";
import { EDMTrainEvent } from "../types";

const EDM_TRAIN_BASE_URL = "https://edmtrain.com/api";

interface EDMTrainResponse {
  success: boolean;
  data: any[];
}

// Helper to build URL with query params
const buildUrl = (base: string, params: Record<string, string>) => {
  const url = new URL(base);
  Object.keys(params).forEach((key) => {
    if (params[key]) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

// Fallback location IDs for major cities/states
const KNOWN_LOCATIONS: Record<string, string> = {
  // Major Cities
  "los angeles": "72",
  la: "72",
  "san francisco": "72",
  sf: "72",
  "san diego": "72",
  sacramento: "72",
  oakland: "72",
  "san jose": "72",
  miami: "94",
  "miami beach": "94",
  "new york": "38,46", // NYC metro
  nyc: "38,46",
  chicago: "44",
  "las vegas": "47",
  vegas: "47",
  denver: "54",
  austin: "62",
  seattle: "65",
  portland: "66",
  boston: "40",
  philadelphia: "41",
  atlanta: "52",
  nashville: "58",
  phoenix: "68",
  // States
  california: "72",
  ca: "72",
  florida: "73",
  fl: "73",
  "new york state": "74",
  ny: "74",
  texas: "75",
  tx: "75",
};

export class EDMTrainService {
  private apiKey: string;

  constructor() {
    this.apiKey = config.edmTrainApiKey;
  }

  /**
   * Get default events for major cities
   * Returns events for Los Angeles (36) and Miami (94) as fallback
   */
  async getDefaultEvents(): Promise<EDMTrainEvent[]> {
    try {
      console.log("=== EDM Train API: Fetching default events ===");
      // Use location IDs for Los Angeles (36) and Miami (94)
      return await this.getEventsByLocation("36,94");
    } catch (error: any) {
      console.error("=== EDM Train API Error ===");
      console.error("Error message:", error.message);
      throw new Error("Failed to fetch events");
    }
  }

  /**
   * Get events by location ID
   * @param locationId - EDM Train location ID (e.g., for city)
   */
  async getEventsByLocation(locationId: string): Promise<EDMTrainEvent[]> {
    try {
      console.log("=== EDM Train API: Fetching events ===");
      console.log("Location IDs:", locationId);
      console.log(
        "API Key:",
        this.apiKey ? `${this.apiKey.substring(0, 8)}...` : "NOT SET"
      );

      const url = buildUrl(`${EDM_TRAIN_BASE_URL}/events`, {
        locationIds: locationId,
        client: this.apiKey,
        livestreamInd: "false",
        includeElectronicGenreInd: "true",
      });

      console.log("Request URL:", url);

      const response = await fetch(url);
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: EDMTrainResponse = await response.json();

      console.log("Response success:", data.success);
      console.log("Number of events:", data.data?.length || 0);

      if (data.success) {
        const events = this.transformEvents(data.data);
        console.log("Transformed events:", events.length);
        if (events.length > 0) {
          console.log("First event:", events[0].name);
        }
        return events;
      }

      console.warn("API returned success=false");
      return [];
    } catch (error: any) {
      console.error("=== EDM Train API Error ===");
      console.error("Error message:", error.message);
      throw new Error("Failed to fetch events");
    }
  }

  /**
   * Get nearby events using coordinates
   * @param latitude - Latitude
   * @param longitude - Longitude
   * @param state - State name
   */
  async getNearbyEvents(
    latitude: number,
    longitude: number,
    state?: string
  ): Promise<EDMTrainEvent[]> {
    try {
      console.log("=== EDM Train API: Fetching nearby events ===");
      console.log("Coordinates:", latitude, longitude);
      console.log("State:", state || "Not provided");
      console.log(
        "API Key:",
        this.apiKey ? `${this.apiKey.substring(0, 8)}...` : "NOT SET"
      );

      const params: Record<string, string> = {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        client: this.apiKey,
        livestreamInd: "false",
        includeElectronicGenreInd: "true",
        includeOtherGenreInd: "true",
      };

      // State is required for nearby events
      if (state) {
        params.state = state;
      }

      const url = buildUrl(`${EDM_TRAIN_BASE_URL}/events`, params);
      console.log("Full Request URL:", url);
      console.log("Request params:", params);

      const response = await fetch(url);
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response body:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorText}`
        );
      }

      const data: EDMTrainResponse = await response.json();

      console.log("Response success:", data.success);
      console.log("Number of nearby events:", data.data?.length || 0);

      if (data.success) {
        const events = this.transformEvents(data.data);
        console.log("✅ Transformed nearby events:", events.length);
        if (events.length > 0) {
          console.log(
            "First event:",
            events[0].name,
            "at",
            events[0].venue.name
          );
        }
        return events;
      }

      console.warn("Nearby events API returned success=false");
      return [];
    } catch (error: any) {
      console.error("=== Nearby Events API Error ===");
      console.error("Error message:", error.message);
      throw new Error("Failed to fetch nearby events");
    }
  }

  /**
   * Get events by city name
   * @param city - City name to search for
   */
  async getEventsByCity(city: string): Promise<EDMTrainEvent[]> {
    try {
      console.log("=== Getting events for city:", city, "===");

      // First, get the location ID for the city
      const locationId = await this.getLocationIdByCity(city);

      if (!locationId) {
        console.warn("No location ID found for city:", city);
        return [];
      }

      console.log("Found location ID(s):", locationId);
      return await this.getEventsByLocation(locationId);
    } catch (error) {
      console.error("Error fetching events by city:", error);
      throw error;
    }
  }

  /**
   * Get location ID(s) by city name
   * @param city - City name
   */
  async getLocationIdByCity(city: string): Promise<string | null> {
    try {
      console.log("=== Searching for location:", city, "===");

      const cityLower = city.toLowerCase().trim();

      // First, check hardcoded known locations
      if (KNOWN_LOCATIONS[cityLower]) {
        const locationId = KNOWN_LOCATIONS[cityLower];
        console.log(`✅ Found in known locations: ${city} -> ${locationId}`);
        return locationId;
      }

      console.log("Not in known locations, fetching from API...");

      // Check if API key is set
      if (!this.apiKey || this.apiKey.trim() === "") {
        console.error("❌ API key not set in config.ts");
        return null;
      }

      const url = buildUrl(`${EDM_TRAIN_BASE_URL}/locations`, {
        client: this.apiKey,
      });

      const response = await fetch(url);
      console.log("Locations API status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Locations API error:", errorText.substring(0, 200));
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: EDMTrainResponse = await response.json();

      console.log("Locations API success:", data.success);
      console.log("Total locations available:", data.data?.length || 0);

      if (data.success) {
        console.log("Searching for:", cityLower);

        // First, try to find exact city match
        let matchedLocations = data.data.filter(
          (loc: any) => loc.city && loc.city.toLowerCase() === cityLower
        );
        console.log("Exact matches:", matchedLocations.length);

        // If no exact match, try partial match
        if (matchedLocations.length === 0) {
          matchedLocations = data.data.filter(
            (loc: any) => loc.city && loc.city.toLowerCase().includes(cityLower)
          );
          console.log("Partial matches:", matchedLocations.length);
        }

        // If still no match, try state match
        if (matchedLocations.length === 0) {
          matchedLocations = data.data.filter(
            (loc: any) =>
              (loc.state && loc.state.toLowerCase().includes(cityLower)) ||
              (loc.stateCode && loc.stateCode.toLowerCase() === cityLower)
          );
          console.log("State matches:", matchedLocations.length);
        }

        if (matchedLocations.length > 0) {
          console.log(
            "Matched locations:",
            matchedLocations.map(
              (l: any) => `${l.city || l.state} (ID: ${l.id})`
            )
          );

          // Return comma-separated list of location IDs
          const locationIds = matchedLocations
            .map((loc: any) => loc.id)
            .slice(0, 5) // Limit to 5 locations
            .join(",");

          console.log(
            `✅ Found ${matchedLocations.length} location(s) for "${city}": ${locationIds}`
          );
          return locationIds;
        }

        console.warn(`❌ No locations found for "${city}"`);
        return null;
      }

      console.error("Locations API returned success=false");
      return null;
    } catch (error: any) {
      console.error("=== Error fetching location ID ===");
      console.error("Error message:", error.message);
      return null;
    }
  }

  /**
   * Get all available locations
   */
  async getAllLocations(): Promise<
    Array<{ id: number; city: string | null; state: string }>
  > {
    try {
      const url = buildUrl(`${EDM_TRAIN_BASE_URL}/locations`, {
        client: this.apiKey,
      });

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: EDMTrainResponse = await response.json();

      if (data.success) {
        return data.data.map((loc: any) => ({
          id: loc.id,
          city: loc.city,
          state: loc.state,
          stateCode: loc.stateCode,
        }));
      }

      return [];
    } catch (error) {
      console.error("Error fetching locations:", error);
      return [];
    }
  }

  /**
   * Transform EDM Train API response to our Event type
   */
  private transformEvents(data: any[]): EDMTrainEvent[] {
    return data.map((event) => {
      // Try to construct a meaningful name if event.name is missing or empty
      let eventName = event.name?.trim();

      if (!eventName || eventName === "") {
        // Try to use artist names if available
        if (event.artistList && event.artistList.length > 0) {
          const firstArtist = event.artistList[0].name;
          if (event.artistList.length === 1) {
            eventName = firstArtist;
          } else if (event.artistList.length === 2) {
            eventName = `${firstArtist} + ${event.artistList[1].name}`;
          } else {
            eventName = `${firstArtist} + ${event.artistList.length - 1} more`;
          }
        } else {
          // Last resort: use venue name
          eventName = event.venue?.name
            ? `Event at ${event.venue.name}`
            : "Unnamed Event";
        }
      }

      return {
        id: event.id.toString(),
        name: eventName,
        date: event.date,
        startTime: event.startTime || event.start_time,
        endTime: event.endTime || event.end_time,
        venue: {
          name: event.venue?.name || "TBA",
          location: event.venue?.location || event.venue?.address || "",
        },
        artistList:
          event.artistList?.map((artist: any) => ({
            id: artist.id.toString(),
            name: artist.name,
          })) || [],
        ticketLink: event.ticketLink || event.link,
        ages: event.ages,
        festivalId: event.festivalId,
        genres: event.genres || [],
      };
    });
  }
}

export const edmTrainService = new EDMTrainService();
