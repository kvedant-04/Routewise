---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Define CrewAI Tasks and Execute Agent Workflow

## Objective
Connect the customized tools to the CrewAI Agent, define the exact tasks for the travel agent to execute, and integrate this into the FastAPI `/plan-trip` endpoint to enable the full ReAct workflow.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md
- backend/main.py
- backend/agent_core.py
- backend/tools.py

## Tasks

<task type="auto">
  <name>Construct CrewAI Workflow in Endpoint</name>
  <files>
    - backend/main.py
    - backend/agent_core.py
    - backend/tools.py
  </files>
  <action>
    - Update `backend/main.py` and `backend/agent_core.py` to import the tools from `tools.py`.
    - Modify `agent_core.py` or the `main.py` endpoint so the `travel_planner_agent` includes the tools array: `[search_web, calculate_expression, search_csv]`.
    - Inside the `/plan-trip` endpoint in `main.py`, create a CrewAI `Task`. The task description should instruct the agent to:
      1. Use the CSV tool to check for local tips about the {destination}.
      2. Use the Web Search tool to find current weather and events for the {destination}.
      3. Use the Calculator tool to breakdown the user's budget ({budget}) across {days} days and estimate daily costs.
      4. Synthesize all this into a structured itinerary.
    - Create a `Crew` with the `travel_planner_agent` and the constructed task.
    - Call `crew.kickoff()` to execute the flow.
    - Capture the final result from the kickoff and return it in the `itinerary` field of `TripResponse`.
    - For `reasoning_logs`, either redirect `sys.stdout` temporarily during `crew.kickoff()` (since `verbose=True` prints to console) or just return a placeholder string indicating logs are in the console.
  </action>
  <verify>Get-Content backend/main.py | Select-String "crew.kickoff()"</verify>
  <done>The FastAPI endpoint triggers the CrewAI workflow utilizing all three tools and returns the generated itinerary.</done>
</task>

## Success Criteria
- [ ] Agent is equipped with the 3 custom tools.
- [ ] `/plan-trip` endpoint executes the `Crew` kickoff.
- [ ] The generated response is returned as the API response.
