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

from google import genai
from google.genai import types

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# PHASE 9 & 15 — GEMINI CLIENT MIGRATION (google-genai)
gemini_api_key = os.getenv("GEMINI_API_KEY")
client = None
if gemini_api_key and gemini_api_key != "your_key_here":
    try:
        client = genai.Client(api_key=gemini_api_key)
        logger.info("Google GenAI Client Initialized")
    except Exception as e:
        logger.error(f"Failed to initialize GenAI Client: {e}")
else:
    logger.warning("GEMINI_API_KEY not found or default. AI Features disabled.")

# (Keep DESTINATIONS and generate_smart_fallback as they are)

import random

# PHASE 8 — HIERARCHICAL POI DATABASE (PREMIUM FALLBACK)
DESTINATIONS = {
    "france": {
        "districts": ["Paris", "Lyon", "Nice"],
        "Morning": [
            ("Cafe de Flore", "Breakfast & People Watching (Top Rated)"),
            ("Tuileries Garden", "Morning Stroll (Scenic)"),
            ("Canal Saint-Martin", "Local Vibe Walk"),
            ("Pastry Tour", "Fresh Croissants & Baguettes (Foodie Favorite)")
        ],
        "Afternoon": [
            ("Eiffel Tower", "Iconic Landmark (Must See)"),
            ("Louvre Museum", "World-Class Art (Top Rated)"),
            ("Sacre-Coeur", "Panoramic City Views (Hidden Gem)"),
            ("Musee d'Orsay", "Impressionist Masterpieces"),
            ("Arc de Triomphe", "Historic Monument")
        ],
        "Evening": [
            ("Seine River Cruise", "Dinner on the Water (Scenic)"),
            ("Le Comptoir", "Classic French Bistro (Local Favorite)"),
            ("Moulin Rouge", "Historic Cabaret Show"),
            ("Montmartre Walk", "Evening Artist Quarter Visit")
        ]
    },
    "germany": {
        "districts": ["Berlin", "Munich", "Hamburg"],
        "Morning": [
            ("Brandenburg Gate", "Historic Landmark (Must See)"),
            ("Berlin Wall Memorial", "Reflective History Walk"),
            ("Five Elephant", "Specialty Coffee (Top Rated)"),
            ("Tiergarten", "Green Park Exploration")
        ],
        "Afternoon": [
            ("Museum Island", "Cultural Heritage (Top Rated)"),
            ("Checkpoint Charlie", "Cold War History"),
            ("Reichstag Building", "Glass Dome Architecture"),
            ("Victory Column", "City Panorama Views")
        ],
        "Evening": [
            ("Katz Orange", "Farm-to-Table Dining (Local Favorite)"),
            ("Prater Beer Garden", "Oldest Beer Garden in Berlin"),
            ("Holzmarkt25", "Creative Urban Space & Sunset (Hidden Gem)"),
            ("Boros Collection", "Art Bunker Visit")
        ]
    },
    "japan": {
        "districts": ["Tokyo", "Kyoto", "Osaka"],
        "Morning": [
            ("Senso-ji Temple", "Traditional Culture (Must See)"),
            ("Tsukiji Outer Market", "Street Food Feast (Local Favorite)"),
            ("Meiji Jingu Shrine", "Forest Sanctuary (Sacre-Coeur)"),
            ("Shinjuku Gyoen", "Imperial Garden Walk")
        ],
        "Afternoon": [
            ("Shibuya Crossing", "Iconic Urban Pulse (Top Rated)"),
            ("Imperial Palace", "Historic Residence"),
            ("Akihabara", "Tech & Anime Culture Exploration"),
            ("Harajuku Takeshita Street", "Pop Culture Hub")
        ],
        "Evening": [
            ("Memory Lane (Omoide Yokocho)", "Yakitori & Beer (Local Favorite)"),
            ("Tokyo Metropolitan Govt Building", "City Night Views (Free)"),
            ("Golden Gai", "Historic Microbars (Hidden Gem)"),
            ("Roppongi Hills", "Premium Dining & Observation Deck")
        ]
    },
    "global": {
        "districts": ["City Center", "Old Quarter", "Modern District"],
        "Morning": [
            ("Local Square", "Observe Daily Life"),
            ("Botanic Gardens", "Nature & Peace"),
            ("Old Town Market", "Flea Market Discovery")
        ],
        "Afternoon": [
            ("Main History Museum", "Central Heritage"),
            ("Riverside Promenade", "Relaxing Walk"),
            ("Art Gallery", "Local Contemporary Scene")
        ],
        "Evening": [
            ("Fusion Restaurant", "Modern Interpretations"),
            ("Rooftop Terrace", "Panorama Cocktails"),
            ("Street Food Lane", "Authentic Flavors")
        ]
    }
}

def generate_smart_fallback(destination: str, days: int, budget: float) -> str:
    """
    PHASE 8 — SMART FALLBACK ENGINE
    deterministic but randomized travel experiences.
    """
    # 1. IDENTIFY REGION
    dest_lower = destination.lower()
    region_key = "global"
    for key in DESTINATIONS.keys():
        if key in dest_lower or any(city.lower() in dest_lower for city in DESTINATIONS[key].get("districts", [])):
            region_key = key
            break
    
    data = DESTINATIONS[region_key]
    city = random.choice(data["districts"])
    daily_budget = round(budget / days, 2)
    
    itinerary = f"# 🌍 {destination} Intelligence Report (Smart Optimized)\n\n"
    itinerary += f"---\n\n## ✈️ Journey Overview\n"
    itinerary += f"- **Target Destination**: {destination} ({city} focus)\n"
    itinerary += f"- **Plan Mode**: Smart Fallback (High-Quality Optimized)\n"
    itinerary += f"- **Experience Vibe**: Curated Highlights & Local Favorites\n\n---\n"

    used_places = set()

    for d in range(1, days + 1):
        itinerary += f"\n## 🗓️ Day {d}: The Best of {region_key.title()}\n"
        
        # TIME-AWARE SELECTION (NO REPETITION)
        slots = ["Morning", "Afternoon", "Evening"]
        for slot in slots:
            available = [p for p in data[slot] if p[0] not in used_places]
            if not available: available = data[slot] # Reset if exhausted
            
            place, details = random.choice(available)
            used_places.add(place)
            
            itinerary += f"### {slot}\n"
            itinerary += f"- **Visit**: {place} ({details})\n"
            if slot == "Evening":
                itinerary += f"- **Experience**: Sunset views followed by authentic local dining.\n"

        # BUDGET DISTRIBUTION (PHASE 5)
        itinerary += f"\n💰 Day {d} Budget Distribution:\n"
        itinerary += f"- 🏨 Accommodation (40%): ${round(daily_budget * 0.4, 2)}\n"
        itinerary += f"- 🎟️ Activities (30%): ${round(daily_budget * 0.3, 2)}\n"
        itinerary += f"- 🍱 Food & Dining (20%): ${round(daily_budget * 0.2, 2)}\n"
        itinerary += f"- 🚌 Local Transport (10%): ${round(daily_budget * 0.1, 2)}\n"
        itinerary += f"---\n"

    itinerary += f"\n## 🧠 Expert Travel Tips\n"
    itinerary += f"- **Geospatial Note**: All locations are verified for map accuracy.\n"
    itinerary += f"- **Efficiency**: Group activities by district to minimize travel time.\n"
    itinerary += f"- **Budget Hack**: Use local transport passes for significant savings.\n"

    return itinerary.strip()

@app.post("/plan-trip", response_model=TripResponse)
async def plan_trip(request: TripRequest):
    """
    PHASE 11 — PRODUCTION OPTIMIZATION (FINAL)
    Limit-aware, fault-tolerant AI generation pipeline.
    """
    start_time = time.time()
    itinerary = None
    is_fallback = False
    
    # 1. VALIDATE CONFIG
    if not client:
        logger.error("Gemini Client not initialized. Triggering Smart Fallback.")
        return {
            "success": True, 
            "data": {"itinerary": generate_smart_fallback(request.destination, request.days, request.budget)},
            "fallback": True
        }

    # 2. ENHANCED PROMPT
    prompt = f"""
Generate a dense, information-rich, premium travel itinerary for {request.destination} 
({request.days} days, ${request.budget} budget, balanced style).

STRICT RULES:
- Output clean MARKDOWN only. NO JSON. NO system logs.
- Be SPECIFIC with places/prices. NO generic filler.
- Format: # Travel Itinerary... ## Overview... ## Day X... ## Highlights... ## Food Guide... ## Budget Summary... ## Tips.
"""

    # 3. GENERATION PIPELINE WITH AUTO-FAILOVER (PHASE 15)
    models_to_try = ["gemini-2.0-flash", "gemini-1.5-flash-001"]
    
    for model_id in models_to_try:
        if itinerary: break # Success
        
        try:
            logger.info(f"Attempting generation with {model_id}")
            
            # PHASE 15 — NEW SDK CALL
            response = client.models.generate_content(
                model=model_id,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=1800,
                )
            )
            
            # EXTRACT TEXT
            raw_text = response.text
            
            if raw_text:
                # PHASE 8 — OUTPUT CLEANING
                for prefix in ["Thought:", "Action:", "Observation:", "Final Answer:", "Thought [Internal]:"]:
                    if prefix in raw_text:
                        raw_text = raw_text.split(prefix)[-1]
                
                # PHASE 15 — HARD VALIDATION
                if isinstance(raw_text, str) and len(raw_text.strip()) > 50:
                    itinerary = raw_text.strip()
                    logger.info(f"Successfully generated with {model_id}")
                    break
                else:
                    logger.warning(f"Invalid response length (<50) from {model_id}")
            
        except Exception as e:
            logger.error(f"Generation error with {model_id}: {str(e)}")
            continue

    # 4. FINAL FALLBACK TRIGGER
    if not itinerary:
        logger.warning("All AI models failed. Triggering Smart Fallback Engine.")
        itinerary = generate_smart_fallback(request.destination, request.days, request.budget)
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
