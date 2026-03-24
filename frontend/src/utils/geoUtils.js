/**
 * UTILITY: geoUtils.js
 * Handles place-to-coordinate conversion using OpenStreetMap Nominatim.
 * Refactored for parallel performance and strict ID preservation.
 */

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
const CACHE_PREFIX = "geo_";

/**
 * Fetch coordinates for a single place name
 * Includes city-aware caching.
 */
export async function getCoordinates(placeName, destination) {
  if (!placeName) return null;

  const cityTag = destination ? destination.toLowerCase().replace(/\s+/g, "_") : "unknown";
  const placeTag = placeName.toLowerCase().replace(/\s+/g, "_");
  const cacheKey = `${CACHE_PREFIX}${placeTag}_${cityTag}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const query = destination ? `${placeName}, ${destination}` : placeName;
    const url = `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(query)}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Routewise-Production-App (contact@routewise.ai)"
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    if (data && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };

      localStorage.setItem(cacheKey, JSON.stringify(result));
      return result;
    }

    return null;
  } catch (error) {
    console.error(`[Geo] Error fetching ${placeName}:`, error);
    return null;
  }
}

/**
 * Batch fetch coordinates for an entire itinerary in parallel.
 * PRESERVE ID: Returns { ...coords, id: event.id } for Map sync.
 */
export async function batchGeocode(events, destination) {
  if (!events || !events.length) return [];

  // LIMIT: Only geocode top 10 places to avoid UI clutter and rate limits
  const topEvents = events.slice(0, 10);

  // Parallel fetch using Promise.all
  const geoPromises = topEvents.map(async (event) => {
    const coords = await getCoordinates(event.place, destination);
    if (coords) {
      // CRITICAL: Attach original ID for map <=> UI sync
      return { 
        ...coords, 
        id: event.id,
        place: event.place,
        day: event.day,
        time: event.time
      };
    }
    return null;
  });

  const results = await Promise.all(geoPromises);
  
  // Filter out nulls and return valid points only
  return results.filter(p => p !== null);
}
