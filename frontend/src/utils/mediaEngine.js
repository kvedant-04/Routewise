/**
 * mediaEngine.js — AI Visual Intelligence Pipeline (Phase VIP)
 * Phase 13.X: Hardened Hydration Manager
 *
 * STEP 1: Semantic Understanding  → backend /image-intelligence (Gemini-powered)
 * STEP 2: Premium Image Retrieval → Unsplash (primary) → Pexels (secondary)
 * STEP 3: AI Relevance & Duplicate Validation → prevent repetitive visual cloning
 * STEP 4: Smart Fallback Strategy → never random
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY || '';
const PEXELS_KEY   = import.meta.env.VITE_PEXELS_KEY   || '';

// ─── Phase 13.X: Smart Cache & Duplicate Prevention ───────────────────────
const TTL_MS = 45 * 60 * 1000; // 45 minutes
const MAX_CACHE_SIZE = 200;

class LRUCache {
  constructor() {
    this.cache = new Map();
  }
  get(key) {
    if (!this.cache.has(key)) return null;
    const item = this.cache.get(key);
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    // Refresh position
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }
  set(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, { value, expiry: Date.now() + TTL_MS });
    if (this.cache.size > MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}

const imageCache = new LRUCache();
const activeRequestMap = new Map(); // Deduplication registry
const seenImageIds = new Set();     // Duplicate Visual Detection

// ─── Phase 13.X: Concurrency Queue ───────────────────────────────────────
const MAX_CONCURRENT_FETCHES = 4;
let activeFetches = 0;
const fetchQueue = [];

async function enqueueFetch(fetchFn) {
  return new Promise((resolve, reject) => {
    fetchQueue.push(async () => {
      try {
        const result = await fetchFn();
        resolve(result);
      } catch (err) {
        reject(err);
      } finally {
        activeFetches--;
        processQueue();
      }
    });
    processQueue();
  });
}

function processQueue() {
  if (activeFetches >= MAX_CONCURRENT_FETCHES || fetchQueue.length === 0) return;
  activeFetches++;
  const nextFetch = fetchQueue.shift();
  nextFetch();
}

// ─── Curated Landmark Fallback Library ────────────────────────────────────
const LANDMARK_LIBRARY = {
  'senso-ji temple':       'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=90',
  'shibuya crossing':      'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&q=90',
  'fushimi inari shrine':  'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=1200&q=90',
  'tokyo skyline':         'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=90',
  'mount fuji':            'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200&q=90',
  'arashiyama bamboo':     'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=1200&q=90',
  'eiffel tower':          'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=90',
  'louvre museum':         'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&q=90',
  'seine river':           'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=90',
  'sacre-coeur':           'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=1200&q=90',
  'montmartre':            'https://images.unsplash.com/photo-1551634979-2b11f8c946fe?w=1200&q=90',
  'palace of versailles':  'https://images.unsplash.com/photo-1590425842890-53dfc4f0c073?w=1200&q=90',
  'colosseum':             'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=90',
  'trevi fountain':        'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=1200&q=90',
  'venice canal':          'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=1200&q=90',
  'amalfi coast':          'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=90',
  'florence duomo':        'https://images.unsplash.com/photo-1543429776-2782fc8e3f02?w=1200&q=90',
  'sagrada familia':       'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=1200&q=90',
  'alhambra':              'https://images.unsplash.com/photo-1596627116790-af6f46dddbfc?w=1200&q=90',
  'park guell':            'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=90',
  'taj mahal':             'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=90',
  'india gate':            'https://images.unsplash.com/photo-1573183563897-c64e01e1e9c1?w=1200&q=90',
  'amber fort':            'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=90',
  'varanasi ghat':         'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=1200&q=90',
  'times square':          'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&q=90',
  'golden gate bridge':    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&q=90',
  'central park':          'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=1200&q=90',
  'grand canyon':          'https://images.unsplash.com/photo-1527549993586-dff825b37782?w=1200&q=90',
  'statue of liberty':     'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1200&q=90',
  'big ben':               'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=1200&q=90',
  'tower bridge':          'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=90',
  'buckingham palace':     'https://images.unsplash.com/photo-1520564695943-7474c7ec5c2f?w=1200&q=90',
  'wat phra kaew':         'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1200&q=90',
  'chao phraya':           'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=90',
  'phi phi islands':       'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=90',
  'pyramids of giza':      'https://images.unsplash.com/photo-1538600836-95696e8c8421?w=1200&q=90',
  'sydney opera house':    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=90',
  'great barrier reef':    'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200&q=90',
};

const CATEGORY_ARCHETYPES = {
  landmark:   'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200&q=90',
  food:       'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=90',
  nature:     'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=90',
  culture:    'https://images.unsplash.com/photo-1518998053401-b26431207eeb?w=1200&q=90',
  nightlife:  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=90',
  transport:  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=90',
  wellness:   'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=90',
  shopping:   'https://images.unsplash.com/photo-1481437156560-3205f6a55735?w=1200&q=90',
  default:    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=90',
};

// ─── Safe Fetch with Timeout ──────────────────────────────────────────────
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 5000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// ─── STEP 1: Semantic Understanding Layer ──────────────────────────────────
async function getSemanticIntelligence(evt, destination, dayTheme = '') {
  try {
    const res = await fetchWithTimeout(`${BACKEND_URL}/image-intelligence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activity:    evt.activity    || '',
        place:       evt.place       || '',
        destination: destination     || '',
        time_slot:   evt.time_slot   || evt.timeSlot || 'Morning',
        notes:       evt.notes       || '',
        day_theme:   dayTheme        || '',
      }),
      timeout: 3000 // Fast fail for backend inference
    });
    if (!res.ok) throw new Error(`Backend returned ${res.status}`);
    return await res.json();
  } catch (err) {
    return _heuristicFallback(evt, destination);
  }
}

function _heuristicFallback(evt, destination) {
  const combined = `${evt.activity || ''} ${evt.notes || ''}`.toLowerCase();
  let category = 'culture';
  if (/food|eat|dining|restaurant|cafe|market|cuisine|breakfast|lunch|dinner/.test(combined)) category = 'food';
  else if (/park|garden|beach|nature|mountain|lake|river|hike|forest/.test(combined)) category = 'nature';
  else if (/museum|gallery|art|heritage|history|monument|castle|temple|shrine|palace/.test(combined)) category = 'landmark';
  else if (/bar|nightlife|cocktail|jazz|club|rooftop/.test(combined)) category = 'nightlife';
  else if (/spa|wellness|yoga|relax|massage/.test(combined)) category = 'wellness';
  else if (/shop|mall|boutique|bazaar/.test(combined)) category = 'shopping';

  const place = evt.place || '';
  const dest = destination || '';
  const primary = dest && !place.toLowerCase().includes(dest.toLowerCase()) ? `${place} ${dest}` : place;

  return {
    primary_query:    primary,
    fallback_queries: [`${dest} ${category}`, `${dest} landmark`, category],
    category,
    mood:             'vibrant',
    landmark_key:     category === 'landmark' ? place : '',
  };
}

// ─── STEP 2: Premium Image Retrieval ──────────────────────────────────────
async function fetchFromUnsplash(query, mood = 'vibrant') {
  if (!UNSPLASH_KEY) return null;
  const orientation = { intimate: 'portrait', street: 'squarish' }[mood] || 'landscape';
  try {
    const res = await fetchWithTimeout(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=${orientation}&content_filter=high`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` }, timeout: 4000 }
    );
    if (!res.ok) return null;
    const data = await res.json();
    
    // Duplicate Detection
    if (seenImageIds.has(data.id)) return null; 

    // Relevance Validation
    const imgDesc = `${data.description || ''} ${data.alt_description || ''} ${data.tags?.map(t => t.title).join(' ') || ''}`.toLowerCase();
    if (scoreRelevance(query, imgDesc) < 0.15) return null;

    // Phase 13.X: Image Quality Gating
    if (data.width && data.height) {
      if (data.width < 800 || data.height < 600) return null; // Reject low res
      if (data.width / data.height > 3) return null; // Reject extreme panoramic
    }

    seenImageIds.add(data.id);
    return data?.urls?.regular ? {
      url: `${data.urls.regular}&w=1200&q=85`,
      width: data.width || 1200,
      height: data.height || 800,
      orientation: data.width > data.height ? 'landscape' : 'portrait'
    } : null;
  } catch { return null; }
}

async function fetchFromPexels(query) {
  if (!PEXELS_KEY) return null;
  try {
    const res = await fetchWithTimeout(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      { headers: { Authorization: PEXELS_KEY }, timeout: 4000 }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const photos = data?.photos || [];
    
    // Filter duplicates and score
    const validPhotos = photos.filter(p => !seenImageIds.has(`pexels-${p.id}`));
    if (!validPhotos.length) return null;

    const scored = validPhotos.map(p => ({
      id: `pexels-${p.id}`,
      url: p.src?.large2x || p.src?.large,
      width: p.width,
      height: p.height,
      score: scoreRelevance(query, `${p.alt || ''} ${p.photographer_url || ''}`.toLowerCase()),
    })).sort((a, b) => b.score - a.score);

    const top = scored[0];
    if (top) {
      if (top.width && top.height) {
        if (top.width < 800 || top.height < 600) return null;
        if (top.width / top.height > 3) return null;
      }
      seenImageIds.add(top.id);
      return {
        url: top.url,
        width: top.width || 1200,
        height: top.height || 800,
        orientation: top.width > top.height ? 'landscape' : 'portrait'
      };
    }
    return null;
  } catch { return null; }
}

function scoreRelevance(query, imageMetaText) {
  if (!query || !imageMetaText) return 0;
  const queryTokens = query.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(t => t.length > 2);
  if (!queryTokens.length) return 0;
  const matches = queryTokens.filter(token => imageMetaText.includes(token));
  return matches.length / queryTokens.length;
}

function getSmartFallback(intelligence, destination) {
  let fallbackUrl = null;
  const lk = (intelligence.landmark_key || '').toLowerCase().trim();
  if (lk) {
    for (const [key, url] of Object.entries(LANDMARK_LIBRARY)) {
      if (lk.includes(key) || key.includes(lk)) { fallbackUrl = url; break; }
    }
  }
  if (!fallbackUrl) {
    const destLower = (destination || '').toLowerCase().trim();
    for (const [key, url] of Object.entries(LANDMARK_LIBRARY)) {
      if (key.includes(destLower) || destLower.includes(key.split(' ')[0])) { fallbackUrl = url; break; }
    }
  }
  if (!fallbackUrl) {
    fallbackUrl = CATEGORY_ARCHETYPES[intelligence.category || 'default'] || CATEGORY_ARCHETYPES.default;
  }
  return {
    url: fallbackUrl,
    width: 1200,
    height: 800,
    orientation: 'landscape'
  };
}

async function fetchActivityImageInternal(evt, destination, dayTheme = '') {
  const intel = await getSemanticIntelligence(evt, destination, dayTheme);
  const { primary_query, fallback_queries = [], mood } = intel;

  let url = await fetchFromUnsplash(primary_query, mood);
  if (url) return url;

  if (fallback_queries[0]) {
    url = await fetchFromUnsplash(fallback_queries[0], mood);
    if (url) return url;
  }

  url = await fetchFromPexels(primary_query);
  if (url) return url;

  if (fallback_queries[0]) {
    url = await fetchFromPexels(fallback_queries[0]);
    if (url) return url;
  }

  if (fallback_queries[1]) {
    url = await fetchFromUnsplash(fallback_queries[1], 'vibrant');
    if (url) return url;
  }

  return getSmartFallback(intel, destination);
}

// ─── PUBLIC API ────────────────────────────────────────────────────────────

/**
 * Fetch a single image, fully integrated with Cache, Deduplication, and Queuing.
 * Used by <PremiumImage /> for isolated hydration.
 */
export async function fetchSingleImage(evt, destination, dayTheme = '') {
  const defaultFallback = { url: CATEGORY_ARCHETYPES.default, width: 1200, height: 800, orientation: 'landscape' };
  if (!evt || !evt.id) return defaultFallback;
  const cacheKey = `${evt.id}::${destination}`;
  
  // 1. Check LRU Cache
  const cached = imageCache.get(cacheKey);
  if (cached) return cached;

  // 2. Check Active In-Flight Request Deduplication
  if (activeRequestMap.has(cacheKey)) {
    return activeRequestMap.get(cacheKey);
  }

  // 3. Queue the fetch and register promise
  const fetchPromise = enqueueFetch(() => fetchActivityImageInternal(evt, destination, dayTheme))
    .then(url => {
      imageCache.set(cacheKey, url);
      activeRequestMap.delete(cacheKey);
      return url;
    })
    .catch(() => {
      activeRequestMap.delete(cacheKey);
      return { url: CATEGORY_ARCHETYPES.default, width: 1200, height: 800, orientation: 'landscape' };
    });

  activeRequestMap.set(cacheKey, fetchPromise);
  return fetchPromise;
}

/**
 * Get category fallback
 */
export function getFallbackImage(category = 'default') {
  return {
    url: CATEGORY_ARCHETYPES[category] || CATEGORY_ARCHETYPES.default,
    width: 1200,
    height: 800,
    orientation: 'landscape'
  };
}

/**
 * Preload the first few above-the-fold images asynchronously.
 * Does not block the main UI thread.
 */
export function preloadAboveTheFold(safeEvents, destination, dayThemeMap = {}) {
  if (!Array.isArray(safeEvents)) return;
  // Tier 1: Just first 3 events
  const tier1 = safeEvents.slice(0, 3);
  tier1.forEach(evt => {
    const dayTheme = dayThemeMap[evt.day] || '';
    fetchSingleImage(evt, destination, dayTheme).catch(() => {});
  });
}
