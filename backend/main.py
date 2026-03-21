from dotenv import load_dotenv
import os
import time
import logging

# PHASE 1 — ENVIRONMENT CONFIGURATION
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="Routewise API", description="Backend for Routewise - AI Travel Planning Agent")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

class TripRequest(BaseModel):
    destination: str
    budget: float
    days: int

# PHASE 1 — FIX PYDANTIC MODELS
class ItineraryData(BaseModel):
    itinerary: str

class TripResponse(BaseModel):
    success: bool
    data: ItineraryData

def clean_output(text: str) -> str:
    """
    Aggressive cleaning of the agent output for the Hybrid Rendering system.
    """
    # 1. Strip everything before 'Final Answer:'
    if "Final Answer:" in text:
        text = text.split("Final Answer:")[-1]

    # 2. Remove markdown code blocks if they wrap the entire content
    text = text.strip()
    if text.startswith("```"):
        # Remove opening tag (e.g. ```json or just ```)
        lines = text.split("\n")
        if len(lines) > 2:
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].strip() == "```":
                lines = lines[:-1]
            text = "\n".join(lines).strip()

    # 3. Remove ReAct reasoning logs
    lines = text.split("\n")
    cleaned = [
        line for line in lines
        if not line.strip().startswith(("Thought:", "Action:", "Observation:", "Thought [Internal]:"))
    ]

    return "\n".join(cleaned).strip()

@app.get("/")
def read_root():
    return {"status": "healthy", "message": "Routewise API is running"}

import google.generativeai as genai

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# PHASE 3 — GEMINI INITIALIZATION (REFACTORED)
gemini_api_key = os.getenv("GEMINI_API_KEY")
if gemini_api_key and gemini_api_key != "your_key_here":
    genai.configure(api_key=gemini_api_key)
    # Dual Model Strategy
    primary_model = genai.GenerativeModel(model_name="gemini-2.0-flash")
    fallback_model = genai.GenerativeModel(model_name="gemini-1.5-flash-latest")
else:
    primary_model = None
    fallback_model = None

def generate_mock_itinerary(destination: str, days: int, budget: float) -> str:
    """
    PHASE 5 — MOCK ITINERARY SYSTEM
    Generates a realistic, premium-formatted fallback itinerary.
    """
    daily_budget = round(budget / days, 2)
    mock = f"""# 🌍 Travel Itinerary for {destination} ({days} Days)

---

## ✈️ Overview
- Total Budget: ${budget}
- Travel Style: Balanced (Optimized Fallback)
- Ideal Experience Summary: A curated exploration of {destination}'s highlights, optimized for value and efficiency.

---
"""
    for day in range(1, days + 1):
        mock += f"""
## 🗓️ Day {day}: Exploring the Heart of {destination}

### 🌅 Morning
- **Activity**: Guided Walking Tour
- **Details**: Discover secret alleys and historic landmarks with a local guide.
- **Why visit**: Perfect introduction to the city's character.
- **Estimated cost**: ${round(daily_budget * 0.2, 2)}

### 🌇 Afternoon
- **Food**: Local Market Tasting (Hidden Gems)
- **Activity**: Cultural Museum Visit
- **Tip**: Visit during lunch hour to avoid the largest crowds.

### 🌙 Evening
- **Experience**: Sunset Viewpoint & Local Dining
- **Atmosphere**: Vibrant, authentic, and scenic.

💰 Day {day} Cost Breakdown:
- Food: ${round(daily_budget * 0.4, 2)}
- Travel: ${round(daily_budget * 0.1, 2)}
- Activities: ${round(daily_budget * 0.3, 2)}
- Total: ${daily_budget}

---
"""
    mock += f"""
## 🗺️ Must-Visit Highlights
- **The Central Square**: The bustling heart of the city.
- **The Riverside Path**: Scenic walking route with local charm.

## 🍽️ Food Guide
- **Signature Dish**: Traditional local plateau.
- **Best Spot**: The Old Quarter Street Food Market.

## 💰 Budget Summary
- Total Estimated Cost: ${budget}
- Daily Average: ${daily_budget}
- Remaining Budget: $0.00

## 🧳 Smart Travel Tips
- Use public transport for maximum efficiency.
- Book tickets online to skip queues.
"""
    return mock.strip()

@app.post("/plan-trip", response_model=TripResponse)
async def plan_trip(request: TripRequest):
    """
    PHASE 11 — PRODUCTION OPTIMIZATION (FINAL)
    Limit-aware, fault-tolerant AI generation pipeline.
    """
    start_time = time.time()
    itinerary = None
    is_fallback = False
    error_type = None
    
    # 1. VALIDATE CONFIG
    if not primary_model:
        logger.error("Gemini API key not configured.")
        return {
            "success": True, 
            "data": {"itinerary": generate_mock_itinerary(request.destination, request.days, request.budget)},
            "fallback": True
        }

    # 2. ENHANCED PROMPT (Compressed & Dense)
    prompt = f"""
Generate a dense, information-rich, premium travel itinerary for {request.destination} 
({request.days} days, ${request.budget} budget, balanced style).

STRICT RULES:
- Output clean MARKDOWN only. NO JSON. NO system logs (Thought/Action/Final Answer).
- Be SPECIFIC with places/prices. NO generic filler. NO storytelling.
- Use this EXACT format: # Travel Itinerary for {{dest}}... ## Overview... ## Day X... ## Highlights... ## Food Guide... ## Budget Summary... ## Tips.

CONTENT:
1. Overview: Vibe/Style/Budget.
2. Day-wise: morning/afternoon/evening per day with specific costs.
3. Must-Visit: Landmarks + Hidden gems.
4. Food: Must-try dishes + specific spots.
5. Summary: Total/Daily/Remaining costs.
6. Tips: Local hacks/transport.

Keep response concise but information-dense.
"""

    # 3. GENERATION PIPELINE WITH AUTO-FAILOVER & RETRY
    models_to_try = [primary_model, fallback_model]
    max_retries = 2
    
    for model_obj in models_to_try:
        if itinerary: break # Success
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Attempting generation with {model_obj.model_name} (Attempt {attempt+1})")
                
                # PHASE 1 & 4 — LLM CALL
                response = model_obj.generate_content(
                    prompt,
                    generation_config={
                        "temperature": 0.65,
                        "top_p": 0.9,
                        "max_output_tokens": 1800 # STRICT UPPER LIMIT
                    }
                )
                
                raw_text = response.text
                
                # PHASE 6 — OUTPUT ENFORCEMENT & STRIPPING
                if raw_text:
                    # Clean unwanted prefixes
                    for prefix in ["Thought:", "Action:", "Observation:", "Final Answer:", "Thought [Internal]:"]:
                        if prefix in raw_text:
                            raw_text = raw_text.split(prefix)[-1]
                    
                    # PHASE 3 & 9 — HARD VALIDATION
                    if isinstance(raw_text, str) and len(raw_text.strip()) > 50:
                        itinerary = raw_text.strip()
                        break # Success!
                    else:
                        logger.warning(f"Invalid response length/type from {model_obj.model_name}")
                
            except Exception as e:
                error_type = type(e).__name__
                logger.error(f"Generation error ({error_type}): {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(0.5) # PHASE 6 — RETRY DELAY
                    continue
                break # Move to fallback model or mock
    
    # 4. FINAL FALLBACK TRIGGER
    if not itinerary:
        logger.warning("All AI models and retries failed. Triggering Mock Fallback.")
        itinerary = generate_mock_itinerary(request.destination, request.days, request.budget)
        is_fallback = True

    # 5. LOGGING & TELEMETRY
    duration = time.time() - start_time
    logger.info(f"Request complete. Duration: {duration:.2f}s | Fallback: {is_fallback}")

    return {
        "success": True,
        "data": {
            "itinerary": itinerary
        },
        "fallback": is_fallback
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
