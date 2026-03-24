---
phase: 6
plan: 0
wave: 1
depends_on: []
files_modified: ["backend/main.py"]
autonomous: true
---

# Plan 6.0: AI Engine & Structured JSON (Backend)

<objective>
Update the backend to produce 100% structured JSON itineraries, bypassing markdown and ensuring high-quality multi-day output with GPT-4o-Mini.

Purpose: Eliminate parsing errors and inconsistent AI responses.
Output: Fixed `main.py` with structured response logic.
</objective>

<context>
Load for context:
- d:\Routewise\backend\main.py
- C:\Users\Dell\.gemini\antigravity\brain\b1a8b071-6b6c-40b1-9196-4e9346d375e0\implementation_plan_v6.md
</context>

<tasks>

<task type="auto">
  <name>Model & Response Enhancement (JSON Mode)</name>
  <files>backend/main.py</files>
  <action>
    - Update `TripResponse` and `ItineraryData` models to handle a structured JSON response.
    - MANDATORY: Use `response_format={"type": "json_object"}` in the OpenRouter `chat.completions.create` call.
    - UPGRADE: Use `openai/gpt-4o-mini` as the primary fallback model.
    - REFACTOR: Replace the 1-time retry with a `MAX_RETRIES = 3` loop that validates the JSON structure and content quality before returning.
  </action>
  <verify>Check `main.py` for `response_format` and `MAX_RETRIES` implementation.</verify>
  <done>Backend is hard-coded to return JSON objects with recursive retry logic.</done>
</task>

<task type="auto">
  <name>Ultra-Strict JSON Prompt Hardening</name>
  <files>backend/main.py</files>
  <action>
    - Update the system prompt with the following STRICT RULES:
        * ONLY use REAL places (no generic "Explore city" or "Visit local attractions").
        * Each day MUST include exactly 4 slots: Morning, Afternoon, Evening, Night.
        * Each activity MUST have: place, time, duration, cost.
        * If any rule is broken during internal validation -> regenerate immediately (up to 3 times).
  </action>
  <verify>Test with a request to `/plan-trip` and inspect the JSON for generic text.</verify>
  <done>Prompt enforces high-fidelity real-world data and structured completeness.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Backend returns valid JSON, not markdown.
- [ ] Fallback model is `gpt-4o-mini`.
- [ ] Prompt explicitly forbids conversational text.
</verification>

<success_criteria>
- [ ] POST `/plan-trip` returns structured JSON.
- [ ] Itinerary includes exactly the number of days requested.
</success_criteria>
