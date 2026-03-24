---
phase: 5
plan: 1
wave: 1
depends_on: []
files_modified: ["frontend/src/utils/temporalParse.js", "frontend/src/App.jsx"]
autonomous: true
---

# Plan 5.1: Hardened Data Pipeline (The Parser)

<objective>
Rebuild the itinerary parsing logic into a specialized, zero-trust utility that discards garbage and enforces a strict data contract.

Purpose: Fix "garbage data" (e.g., "$400", "Free") appearing in UI fields and ensure consistency across all views.
Output: `frontend/src/utils/temporalParse.js`
</objective>

<context>
Load for context:
- frontend/src/App.jsx (current parser logic)
- .gsd/SPEC.md
</context>

<tasks>

<task type="auto">
  <name>Create temporalParse.js utility</name>
  <files>frontend/src/utils/temporalParse.js</files>
  <action>
    Implement `parseItinerary(markdown, destination)` with:
    - DISCARD RULE: If `place` length < 3 OR contains `$` OR contains "Free" -> discard event.
    - STRICT CLEANING:
        - Remove: prices ($, €, ₹), text inside parentheses (), and prefixes like "s:", "Cost:", "Price:".
        - Ensure: `place` is ONLY a real location name (no numbers, no currency).
        - If cleaned `place` becomes empty/invalid -> discard event.
    - NOISE REMOVAL: Strip words like "Visit", "Explore", "Discover", "Go to" from place names.
    - SCHEMA: Return array of objects with {id, day, time, activity, place, city, exactTime, duration}.
    AVOID: Using weak regex that consumes sibling slots. Use non-greedy multiline lookaheads.
  </action>
  <verify>Check PARSED DATA log in console with a dummy itinerary containing "$400" and "Visit: Louvre".</verify>
  <done>Clean array returned without noise words or price garbage.</done>
</task>

<task type="auto">
  <name>Integrate temporalParse into App.jsx</name>
  <files>frontend/src/App.jsx</files>
  <action>
    - Import `parseItinerary` from `./utils/temporalParse`.
    - Replace internal `parseItinerary` function.
    - Update `safeEvents` useMemo to call the new utility.
    - Add "Generating itinerary..." loading stage feedback.
  </action>
  <verify>Application loads and console shows "SAFE EVENTS" matching the strict contract.</verify>
  <done>App.jsx uses the new utility for all data orchestration.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] No events in safeEvents contain "$" or "Free" in the `place` field.
- [ ] Place names are clean (e.g., "Eiffel Tower" instead of "Visit Eiffel Tower").
</verification>

<success_criteria>
- [ ] Parser returns high-fidelity data only.
- [ ] App.jsx is decoupled from parsing logic.
</success_criteria>
