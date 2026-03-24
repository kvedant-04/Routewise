---
phase: 9
plan: 1
wave: 1
depends_on: []
files_modified: [d:\Routewise\frontend\src\App.jsx, d:\Routewise\frontend\src\components\MapIntelligence.jsx]
autonomous: true
user_setup: []

must_haves:
  truths:
    - "safeEvents acts as the strict, single source of truth for all frontend views"
    - "Map correctly filters out any coordinates missing lat/lng and binds rich popups"
  artifacts: []
---

# Plan 9.1: Normalize SafeEvents & Map Intelligence

<objective>
Refactor `App.jsx` to map the highly structured JSON payloads into a normalized `safeEvents` array. Apply the corresponding strict data structure to `MapIntelligence.jsx` to prevent map crashes.

Purpose: Fix empty list, timeline, and calendar views by providing components with the exact fields they expect.
Output: Upgraded `App.jsx` and `MapIntelligence.jsx` logic layers.
</objective>

<context>
Load for context:
- d:\Routewise\frontend\src\App.jsx
- d:\Routewise\frontend\src\components\MapIntelligence.jsx
</context>

<tasks>

<task type="auto">
  <name>Implement Single Source of Truth in App.jsx</name>
  <files>d:\Routewise\frontend\src\App.jsx</files>
  <action>
    Locate the `safeEvents` useMemo block. 
    Transform the JSON mapping to:
    return parsed.days.flatMap(day =>
      day.activities.map((act, index) => ({
        id: `${day.day}-${index}`,
        day: day.day,
        time: act.time_slot,
        exactTime: act.start_time,
        activity: act.activity,
        place: act.place,
        cost: act.cost,
        notes: act.notes,
        duration: act.duration_mins,
        city: parsed.destination
      }))
    );
    AVOID: Keeping any old fields like `description`. Ensure city maps to `parsed.destination`.
  </action>
  <verify>UI compiles successfully.</verify>
  <done>safeEvents returns exactly the fields specified above without undefined errors.</done>
</task>

<task type="auto">
  <name>Strict Validation & Rich Popups in MapIntelligence</name>
  <files>d:\Routewise\frontend\src\components\MapIntelligence.jsx</files>
  <action>
    Enforce strict filtering `validPoints = data.filter(p => p.lat && p.lng)`.
    Update the popup renderer to strictly use the new variables: Activity, Place, Time, Cost, and Notes mapping to the respective keys in the normalized `safeEvents` object.
    AVOID: Binding to `p.description` or legacy keys which will result in `undefined` renders.
  </action>
  <verify>Map renders successfully with no `undefined` values inside popups.</verify>
  <done>Map clusters and markers accurately reflect the activity, cost, map coordinates, and rich text notes.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] `safeEvents` is correctly parsed
- [ ] Map successfully filters invalid points without breaking
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
