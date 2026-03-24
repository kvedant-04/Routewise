---
phase: 9
plan: 2
wave: 1
depends_on: [".gsd/phases/9/01-normalization.md"]
files_modified: [
  "d:\Routewise\frontend\src\components\ListView.jsx",
  "d:\Routewise\frontend\src\components\TimelineView.jsx",
  "d:\Routewise\frontend\src\components\CalendarView.jsx"
]
autonomous: true
user_setup: []

must_haves:
  truths:
    - "ListView correctly displays activity, place, time, cost, and notes."
    - "TimelineView maps exactTime to time and correctly binds title and notes."
    - "CalendarView displays time, activity, and small place labels."
  artifacts: []
---

# Plan 9.2: React Components Data Binding Update

<objective>
Update the main rendering views to use the correct data mapping from the newly normalized `safeEvents` payload. Clean out deprecated properties (`description`, raw unstructured time).

Purpose: Ensure the user sees all rich data provided by the JSON generation pipeline in every view without blanks.
Output: Upgraded React components handling complete itinerary iteration.
</objective>

<context>
Load for context:
- d:\Routewise\frontend\src\components\ListView.jsx
- d:\Routewise\frontend\src\components\TimelineView.jsx
- d:\Routewise\frontend\src\components\CalendarView.jsx
</context>

<tasks>

<task type="auto">
  <name>ListView Data Binding Upgrade</name>
  <files>d:\Routewise\frontend\src\components\ListView.jsx</files>
  <action>
    Replace `act.description` with `act.activity`. Add distinct UI rows/badges to show `act.place`, `act.time`, `act.cost`, and `act.notes`.
    AVOID: Keeping any old fields like `description`. DO NOT render partial data if defined.
  </action>
  <verify>Compile checks pass. No missing references.</verify>
  <done>ListView cards proudly display Activity, Place, Time, Cost, and Notes properties.</done>
</task>

<task type="auto">
  <name>TimelineView Data Binding Upgrade</name>
  <files>d:\Routewise\frontend\src\components\TimelineView.jsx</files>
  <action>
    Map `evt.exactTime` correctly using `act.start_time` mapping from `safeEvents`. Replace old generic `evt.activity` references and insert `notes` under the title with a structured `cost` badge and `duration` indicator. 
    AVOID: Simple string concatenation of undefined properties.
  </action>
  <verify>Compile checks pass. No missing references.</verify>
  <done>Timeline blocks contain Time, Activity, Place, Notes, and Cost badges.</done>
</task>

<task type="auto">
  <name>CalendarView Data Binding Upgrade</name>
  <files>d:\Routewise\frontend\src\components\CalendarView.jsx</files>
  <action>
    Bind `act.exactTime` to `evt.start_time` equivalent. Bind `evt.activity` reliably, and add a small place label below it. Add conditional blank state ("No events available").
    AVOID: Empty calendar boxes due to mismatched fields.
  </action>
  <verify>Compile checks pass. No missing references.</verify>
  <done>CalendarView shows Time, Activity name, and small place labels successfully.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] No occurrences of `.description` remain in any views.
- [ ] Timeline, Calendar, and List cleanly handle their data schema bindings.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
