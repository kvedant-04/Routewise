/**
 * UTILITY: geoUtils.js
 * Handles place-to-coordinate conversion using OpenStreetMap Nominatim.
 * Implementation includes:
 * - 1s Rate-limiting (Nominatim Requirement)
 * - User-Agent identification
 * - localStorage caching
 * - Fallback coordination
 */

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
const CACHE_PREFIX = "geo_";
const SLEEP_MS = 1050; // Slightly over 1s for safety

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch coordinates for a single place name
 */
export async function getCoordinates(placeName, destination) {
  if (!placeName) return null;

  const cacheKey = `${CACHE_PREFIX}${placeName.toLowerCase().replace(/\s+/g, "_")}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    console.log(`[Geo] Cache Hit: ${placeName}`);
    return JSON.parse(cached);
  }

  try {
    console.log(`[Geo] Fetching: ${placeName}...`);
    
    // OPTIMIZATION: Append destination to increase accuracy (e.g., "Louvre, Paris")
    const query = destination ? `${placeName}, ${destination}` : placeName;
    const url = `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(query)}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Routewise-Travel-App (contact@routewise.ai)"
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

    console.warn(`[Geo] No results for: ${placeName}`);
    return null;

  } catch (error) {
    console.error(`[Geo] Error fetching ${placeName}:`, error);
    return null;
  }
}

/**
 * Batch fetch coordinates for an entire itinerary with mandatory delays
 */
export async function batchGeocode(places, destination) {
  const results = [];
  
  for (const place of places) {
    // NOMINATIM RATE LIMIT (PHASE 7 FIX 1)
    const cacheKey = `${CACHE_PREFIX}${place.toLowerCase().replace(/\s+/g, "_")}`;
    if (!localStorage.getItem(cacheKey)) {
      await sleep(SLEEP_MS); 
    }
    
    const coords = await getCoordinates(place, destination);
    if (coords) {
      results.push({ name: place, ...coords });
    }
  }

  return results;
}

/**
 * ENGINE: Extract place names from our specific Itinerary structure
 * Looks for patterns like "Location: Eiffel Tower" or "Visit Louvre"
 */
export function extractLocationsFromMarkdown(markdown) {
  if (!markdown) return [];

  // Match common patterns in our itinerary format
  const patterns = [
    /Location:\s*\*\*?(.*?)\*\*?/gi, // Location: **Eiffel Tower**
    /Visit:\s*\*\*?(.*?)\*\*?/gi,    // Visit: **Louvre**
    /-\s\*\*?(.*?)\*\*?:\s/gi,       // - **Eiffel Tower**: Description
  ];

  const places = new Set();
  
  patterns.forEach(regex => {
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      const place = match[1].trim();
      if (place && place.length > 2 && place.length < 50) {
        places.add(place);
      }
    }
  });

  return Array.from(places);
}
