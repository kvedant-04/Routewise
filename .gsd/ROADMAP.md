# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0

## Must-Haves (from SPEC)
- [ ] Frontend UI for user input
- [x] FastAPI backend endpoint
- [x] CrewAI agent with OpenRouter
- [x] Include Tavily, CSV, and Calculator tools
- [x] Display reasoning logs and final itinerary

## Phases

### Phase 1: Foundation & Backend Setup
**Status**: ✅ Complete
**Objective**: Set up modular folder structure, FastAPI server, and define the /plan-trip endpoint structure.
**Requirements**: REQ-03, REQ-11

### Phase 2: Agent Layer & Tool Integration
**Status**: ✅ Complete
**Objective**: Integrate OpenRouter, configure CrewAI, and implement the three mandatory tools (Tavily, CSV, Calculator).
**Requirements**: REQ-04, REQ-05, REQ-06, REQ-07, REQ-08, REQ-09

### Phase 3: Agent Workflow & Reasoning Execution
**Status**: ✅ Complete
**Objective**: Connect backend endpoint to the agent execution, ensure ReAct reasoning pattern, and format output.
**Requirements**: REQ-10

### Phase 4: Frontend Development & Integration
**Status**: ✅ Complete
**Objective**: Build React frontend, connect to FastAPI backend, display the generated itinerary and reasoning.
**Requirements**: REQ-01, REQ-02
34: 
35: ### Phase 5: Production-Grade System Rebuild
**Status**: ✅ Complete
**Objective**: Hardening the data pipeline, parallelizing geocoding, and syncing the tri-view UI (List, Timeline, Calendar) with a single source of truth.
**Requirements**: REQ-12, REQ-13, REQ-14

### Phase 6: AI Engine Recovery & Data Contract Hardening
**Status**: ✅ Complete
**Objective**: Transitioning to a zero-trust JSON pipeline, upgrading AI models (GPT-4o-Mini), and applying the unified Stitch AI Design System.
**Requirements**: REQ-15, REQ-16, REQ-17, REQ-18

### Phase 11: End-to-End Data Pipeline Hardening
**Status**: 🏗 In Progress
**Objective**: Transform Routewise into a production-grade AI SaaS platform with a bulletproof backend normalization layer and a zero-trust frontend mapping layer.
**Requirements**: REQ-19, REQ-20, REQ-21
