---
phase: 6
plan: 2
wave: 3
depends_on: ["6.1"]
files_modified: ["frontend/src/components/MapIntelligence.jsx"]
autonomous: true
---

# Plan 6.2: Map Sync & Performance Verification

<objective>
Finalize the map-to-JSON integration and verify the system's performance and accuracy for complex multi-day plans.

Purpose: Guarantee 1:1 data integrity and premium geospatial feedback.
Output: Finalized `MapIntelligence.jsx` and verification report.
</objective>

<context>
Load for context:
- d:\Routewise\frontend\src\components\MapIntelligence.jsx
- d:\Routewise\backend\main.py
</context>

<tasks>

<task type="auto">
  <name>Structured Map Intelligence & Filtering</name>
  <files>frontend/src/components/MapIntelligence.jsx</files>
  <action>
    - Update `MapIntelligence` to read the new fields from the JSON events (`cost`, `notes`, `time_slot`).
    - MANDATORY: Implement the strict `validPoints` filter:
      ```javascript
      const validPoints = data.filter(
        p => p.lat && p.lng && p.place && p.place.length > 2
      );
      ```
    - Customize map popups to display these high-fidelity fields in a clean, multi-line format.
  </action>
  <verify>Check `MapIntelligence.jsx` for the updated `validPoints` filter.</verify>
  <done>Map popups are data-rich and markers are strictly filtered for quality.</done>
</task>

<task type="auto">
  <name>Multi-Day Stress Test & Unblocking Verification</name>
  <files>frontend/src/App.jsx</files>
  <action>
    - Perform 3 consecutive generations for 2-day itineraries in different cities.
    - Confirm 100% success rate for JSON structure and day count.
    - Verify that no "Explore city" or generic filler text survives the validation layer.
  </done>
  <verify>Check console for "AI ENGINE FIXED — PRODUCTION QUALITY ACHIEVED 🚀".</verify>
  <done>System is verified production-ready with zero unstructured data leaks.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Map markers show cost and notes.
- [ ] 2-day request always yields 2 days.
- [ ] All "generic" text is filtered out.
</verification>

<success_criteria>
- [ ] Zero parser errors.
- [ ] Sub-2s map loading remains intact.
- [ ] User receives exactly what they requested (structured & high-quality).
</success_criteria>
