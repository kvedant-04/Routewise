---
phase: 5
plan: 4
wave: 1
depends_on: ["5.3"]
files_modified: ["frontend/src/index.css", "frontend/src/App.jsx"]
autonomous: true
---

# Plan 5.4: Cleanup & Visual Refinement

<objective>
Finalizing the production-grade state of Routewise by removing legacy code and applying the final Stitch AI design polish.

Purpose: Decommission legacy logic and achieve a premium SaaS feel.
Output: Refined CSS and clean codebase.
</objective>

<tasks>

<task type="auto">
  <name>Decommission Legacy Code</name>
  <files>frontend/src/App.jsx</files>
  <action>
    - DELETE: `extractLocationsFromMarkdown` (regex-based).
    - DELETE: Internal `parseItinerary` (replaced by `temporalParse.js`).
    - DELETE: Unused `sleep()` or sequential geocoding helper functions.
    - REMOVE: Any mock/placeholder logic from `App.jsx`.
  </action>
  <verify>Run the application and verify no console errors or missing dependencies.</verify>
  <done>Codebase is clean of weak legacy logic.</done>
</task>

<task type="auto">
  <name>Final Stitch AI Design Polish</name>
  <files>frontend/src/index.css</files>
  <action>
    - Refine cleanup of `index.css`: ensure clean typography hierarchy and proper spacing.
    - Apply **Stitch AI** transitions: All state changes (hover, active, switch) must use `200ms ease-weighted` transitions.
    - Ensure glassmorphism cards have consistent blur and border tokens.
  </action>
  <verify>Perform a visual audit of the app (hover effects, view switching) to ensure a premium feel.</verify>
  <done>The UI is indistinguishable from a high-end SaaS product.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] No "Rendering Timeline..." or other placeholder text remains in the UI.
- [ ] Mobile responsiveness is maintained.
</verification>

<success_criteria>
- [ ] Final production-ready state achieved.
- [ ] System is fully rebuilt and stable.
</success_criteria>
