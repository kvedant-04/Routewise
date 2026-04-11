/**
 * mediaEngine.js — Phase 13 v2
 * FIXED: smart compound query builder for relevant images.
 * Unsplash if key available, Picsum Photos (deterministic seed) otherwise.
 * In-memory cache → no duplicate calls.
 */

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_KEY || '';

// Global in-memory cache keyed by query string
const imageCache = new Map();

/* ──────────────────────────────────────────────────────
   SMART QUERY BUILDER
   Combines place + activity keywords for max relevance.
   ────────────────────────────────────────────────────── */
export function buildQuery(evt, destination = '') {
  const place = String(evt.place || '').trim();
  const activity = String(evt.activity || '').trim();
  const dest = String(destination || '').trim();

  // Strip generic filler words from place name
  const cleanPlace = place
    .replace(/\b(the|a|an|visit|see|explore|go to|tour of)\b/gi, '')
    .trim();

  // Build compound query: "Eiffel Tower Paris" or "Street food Bangkok"
  if (cleanPlace && dest && !cleanPlace.toLowerCase().includes(dest.toLowerCase())) {
    return `${cleanPlace} ${dest}`;
  }
  if (cleanPlace) return cleanPlace;
  if (activity && dest) return `${activity} ${dest}`;
  if (activity) return activity;
  return dest || 'travel';
}

/* ──────────────────────────────────────────────────────
   SEMANTIC FALLBACK POOL
   Pre-curated high-quality travel images guaranteeing relevance
   when Unsplash API rate limits are hit or key is missing.
   ────────────────────────────────────────────────────── */
const SEMANTIC_FALLBACKS = {
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80',
  nature: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=900&q=80',
  historic: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=900&q=80',
  museum: 'https://images.unsplash.com/photo-1518998053401-b26431207eeb?w=900&q=80',
  city: 'https://images.unsplash.com/photo-1477959858617-67f851977558?w=900&q=80',
  transport: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=900&q=80',
  relax: 'https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=900&q=80',
  shopping: 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=900&q=80',
  default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&q=80'
};

function getPlaceholder(query = '') {
  const qx = query.toLowerCase();
  if (qx.match(/food|eat|dining|restaurant|cafe|meal|dinner|lunch|breakfast|market|taste/)) return SEMANTIC_FALLBACKS.food;
  if (qx.match(/park|mountain|beach|lake|hike|nature|garden|forest|river|valley|scenic/)) return SEMANTIC_FALLBACKS.nature;
  if (qx.match(/temple|shrine|castle|palace|historic|monument|ruin|church|cathedral/)) return SEMANTIC_FALLBACKS.historic;
  if (qx.match(/museum|gallery|art|exhibit|culture/)) return SEMANTIC_FALLBACKS.museum;
  if (qx.match(/shopping|mall|store|buy|boutique/)) return SEMANTIC_FALLBACKS.shopping;
  if (qx.match(/train|flight|bus|transport|station|airport|transit/)) return SEMANTIC_FALLBACKS.transport;
  if (qx.match(/spa|relax|hotel|lounge|resort|massage/)) return SEMANTIC_FALLBACKS.relax;
  if (qx.match(/city|street|downtown|square|avenue|urban/)) return SEMANTIC_FALLBACKS.city;
  
  return SEMANTIC_FALLBACKS.default;
}

/* ──────────────────────────────────────────────────────
   FETCH SINGLE IMAGE (with cache)
   ────────────────────────────────────────────────────── */
async function fetchImage(query) {
  if (!query) return getPlaceholder('travel');

  const key = query.toLowerCase().trim();
  if (imageCache.has(key)) return imageCache.get(key);

  if (UNSPLASH_ACCESS_KEY) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&content_filter=high`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
      );
      if (res.ok) {
        const data = await res.json();
        const url = data?.urls?.regular;
        if (url) {
          imageCache.set(key, url);
          return url;
        }
      }
    } catch (_) { /* fall through */ }
  }

  const url = getPlaceholder(query);
  imageCache.set(key, url);
  return url;
}

/* ──────────────────────────────────────────────────────
   PUBLIC API
   ────────────────────────────────────────────────────── */

/**
 * Build a { [eventId]: imageUrl } map for all safeEvents.
 * Fetches happen in parallel; results are cached.
 */
export async function buildMediaMap(safeEvents, destination = '') {
  if (!Array.isArray(safeEvents) || safeEvents.length === 0) return {};

  const entries = await Promise.all(
    safeEvents.map(async (evt) => {
      const query = buildQuery(evt, destination);
      const url = await fetchImage(query);
      return [evt.id, url];
    })
  );

  return Object.fromEntries(entries);
}

/**
 * Get image for a single event from an existing mediaMap.
 */
export function getEventImage(mediaMap, eventId, destination = '') {
  return mediaMap?.[eventId] || getPlaceholder(destination || 'travel');
}
