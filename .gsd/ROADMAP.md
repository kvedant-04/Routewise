# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0

## Must-Haves (from SPEC)
- [ ] Frontend UI for user input
- [x] FastAPI backend endpoint
- [ ] CrewAI agent with OpenRouter
- [ ] Include Tavily, CSV, and Calculator tools
- [ ] Display reasoning logs and final itinerary

## Phases

### Phase 1: Foundation & Backend Setup
**Status**: ✅ Complete
**Objective**: Set up modular folder structure, FastAPI server, and define the /plan-trip endpoint structure.
**Requirements**: REQ-03, REQ-11

### Phase 2: Agent Layer & Tool Integration
**Status**: ⬜ Not Started
**Objective**: Integrate OpenRouter, configure CrewAI, and implement the three mandatory tools (Tavily, CSV, Calculator).
**Requirements**: REQ-04, REQ-05, REQ-06, REQ-07, REQ-08, REQ-09

### Phase 3: Agent Workflow & Reasoning Execution
**Status**: ⬜ Not Started
**Objective**: Connect backend endpoint to the agent execution, ensure ReAct reasoning pattern, and format output.
**Requirements**: REQ-10

### Phase 4: Frontend Development & Integration
**Status**: ⬜ Not Started
**Objective**: Build React frontend, connect to FastAPI backend, display the generated itinerary and reasoning.
**Requirements**: REQ-01, REQ-02
