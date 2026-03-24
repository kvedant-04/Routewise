---
phase: 5
plan: 3
wave: 1
depends_on: ["5.1", "5.2"]
files_modified: ["frontend/src/components/ListView.jsx", "frontend/src/components/TimelineView.jsx", "frontend/src/components/CalendarView.jsx", "frontend/src/components/MapIntelligence.jsx"]
autonomous: true
---

# Plan 5.3: Synchronized UI & Map Popups

<objective>
Refactor the UI views and map popups to use the hardened data contract, ensuring a clean and consistent SaaS experience.

Purpose: Fix "undefined" values and garbage text in UI components.
Output: Refactored UI components.
</objective>

<tasks>

<task type="auto">
  <name>Sync UI View Data Mapping</name>
  <files>frontend/src/components/ListView.jsx, frontend/src/components/TimelineView.jsx, frontend/src/components/CalendarView.jsx</files>
  <action>
    - ListView: Use `activity` field for primary text.
    - TimelineView: Use `activity || place` for nodes and labels.
    - CalendarView: Ensure `exactTime || time` mapping is consistent.
    - Implement the "No events available" fallback UI within each component.
  </action>
  <verify>Switch between all 3 views and confirm no "undefined" text appears and all show same data.</verify>
  <done>All views are perfectly synced with the `safeEvents` source of truth.</done>
</task>

<task type="auto">
  <name>Enhance Map Intelligence Popups</name>
  <files>frontend/src/components/MapIntelligence.jsx</files>
  <action>
    - Update popups to show: Place Name, Day, Time, and Price (if available).
    - Ensure `validPoints` filtering is strict: `data.filter(p => p.lat && p.lng)`.
    - Implement the "Mapping locations..." fallback state during geocoding.
  </action>
  <verify>Click a map marker and confirm the popup content is clean and accurate.</verify>
  <done>Map popups are premium and mirror the itinerary cards.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Hover-sharing works: Hovering a card highlights the map marker and scrolling to the card on marker click.
- [ ] Zero undefined values in all views.
</verification>

<success_criteria>
- [ ] Front-to-back synchronization achieved.
- [ ] Premium SaaS feel with zero garbage data.
</success_criteria>
