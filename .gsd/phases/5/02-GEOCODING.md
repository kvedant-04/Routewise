---
phase: 5
plan: 2
wave: 1
depends_on: ["5.0", "5.1"]
files_modified: ["frontend/src/utils/geoUtils.js"]
autonomous: true
---

# Plan 5.2: Parallel Geocoding & Performance Fix

<objective>
Refactor the geocoding pipeline to eliminate sequential delays and enable production-grade performance.

Purpose: Fix "too slow" geocoding (2-4 mins) and achieve < 2s load times.
Output: Refactored `frontend/src/utils/geoUtils.js`
</objective>

<tasks>

<task type="auto">
  <name>Transition to Parallel Geocoding</name>
  <files>frontend/src/utils/geoUtils.js</files>
  <action>
    - REMOVE: `sleep()` and sequential loops.
    - IMPLEMENT: `Promise.all` parallel fetching for the geocoding array.
    - LIMIT: Only geocode the top 8-10 places from the itinerary (sorted by Day/Time).
    - CACHE: Enhance `localStorage` caching with a more robust key (`geo_{placeTag}_{cityTag}`).
    - PRESERVE ID: When returning coordinates, attach original event id: `return { ...coords, id: original.id }`. This is REQUIRED for map <-> UI sync.
  </action>
  <verify>Run geocoding for a 4-day itinerary and verify console shows "Geocoding Done" in < 2 seconds.</verify>
  <done>Promise.all handles fetching, resulting in instantaneous map marker appearance.</done>
</task>

<task type="auto">
  <name>Implement Geocoding Safety & Filtering</name>
  <files>frontend/src/utils/geoUtils.js</files>
  <action>
    - Add error handling to skip places that fail geocoding (return null).
    - Ensure results are returned with the original `id` to maintain Map sync.
  </action>
  <verify>Confirm that invalid/fake places don't crash the geocoding loop.</verify>
  <done>The pipeline is resilient and skips unresolvable locations.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Map markers for a 4-day trip appear within 2 seconds of generation.
- [ ] Caching works across page refreshes (no network calls for existing places).
</verification>

<success_criteria>
- [ ] Performance bottleneck removed.
- [ ] Robust caching and error handling implemented.
</success_criteria>
