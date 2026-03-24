---
phase: 6
plan: 1
wave: 2
depends_on: ["6.0"]
files_modified: ["frontend/src/App.jsx", "frontend/src/components/ListView.jsx", "frontend/src/index.css"]
autonomous: true
---

# Plan 6.1: Zero-Trust UI & Stitch AI Implementation (Frontend)

<objective>
Update the frontend to consume structured JSON directly and apply the premium Stitch AI Design System visual tokens.

Purpose: Improve data reliability and UI aesthetics.
Output: Updated `App.jsx` and refreshed design system in `index.css`.
</objective>

<context>
Load for context:
- d:\Routewise\frontend\src\App.jsx
- d:\Routewise\frontend\src\index.css
- d:\Routewise\frontend\src\components\ListView.jsx
</context>

<tasks>

<task type="auto">
  <name>Zero-Trust JSON Integration</name>
  <files>frontend/src/App.jsx</files>
  <action>
    - IMPLEMENT: `const parsed = typeof itinerary === "string" ? JSON.parse(itinerary) : itinerary;` in the `useMemo` of `ItineraryCanvas`.
    - REFACTOR `safeEvents` to use the strict mapping:
      ```javascript
      return parsed.days.flatMap(day =>
        day.activities.map((act, idx) => ({
          id: `${day.day}-${idx}`,
          day: day.day,
          time: act.time_slot,
          exactTime: act.start_time,
          duration: act.duration_mins,
          activity: act.activity,
          place: act.place,
          city: act.city,
          cost: act.cost,
          notes: act.notes
        }))
      );
      ```
    - Decommission legacy `parseItinerary` / `temporalParse.js` calls.
  </action>
  <verify>Check console for debug logs; verify all itinerary fields are populated.</verify>
  <done>Frontend uses zero-trust JSON mapping for all views.</done>
</task>

<task type="auto">
  <name>Stitch AI Premium UI Refinement</name>
  <files>frontend/src/index.css</files>
  <action>
    - Integrate Stitch AI standard tokens for `glassmorphism`: `backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1);`.
    - Apply smooth `200ms ease-out` transitions to all hover states and view switches.
    - Add `box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);` to active cards.
    - Refresh typography with `font-weight: 600` for headers and refined spacing.
  </action>
  <verify>Visually check for depth and blur in the itinerary canvas.</verify>
  <done>UI feels premium, responsive, and uses unified design tokens.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] No regular expressions used for itinerary extraction.
- [ ] Glassmorphism effects are visible on all itinerary cards.
- [ ] Hover states trigger smooth transitions.
</verification>

<success_criteria>
- [ ] UI renders immediately upon JSON arrival.
- [ ] Visual depth (blur/borders) matches the premium spec.
</success_criteria>
