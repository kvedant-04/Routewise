---
phase: 5
plan: 0
wave: 0
depends_on: []
files_modified: ["frontend/src/App.jsx"]
autonomous: true
---

# Plan 5.0: System Safety Layer

<objective>
Implement a global safety gate in the UI to prevent rendering broken or empty data and stop crash loops.

Purpose: Fix "blank screen" and "crash loop" issues during data hydration.
Output: Hardened global render logic in `App.jsx`.
</objective>

<tasks>

<task type="auto">
  <name>Implement Global Fallback Gate</name>
  <files>frontend/src/App.jsx</files>
  <action>
    Inside the `App` component or the main rendering block:
    - Add: `if (!safeEvents || safeEvents.length === 0) { return <div className="loading-stage">Generating itinerary...</div> }`.
    - Ensure this gate sits BEFORE any map or view rendering to prevent `undefined` access errors.
    - Add an ErrorBoundary wrap around the main content if not already present.
  </action>
  <verify>Force `safeEvents` to `[]` and confirm "Generating itinerary..." appears instead of a crash.</verify>
  <done>UI never renders empty/broken data; crash loops are prevented.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] No blank screens appear during the initial parsing delay.
</verification>

<success_criteria>
- [ ] Core UI is protected by a global validation gate.
</success_criteria>
