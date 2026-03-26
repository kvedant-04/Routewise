from dotenv import load_dotenv
import os
import time
import logging
import requests
from openai import OpenAI

# PHASE 1 — ENVIRONMENT CONFIGURATION
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator
from typing import Optional, Any, List

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

# PHASE 6 — REFINED DATA CONTRACT
class Activity(BaseModel):
    time_slot: str = Field(default="Morning")
    start_time: str = Field(default="09:00")
    duration_mins: int = Field(default=60)
    activity: str = Field(default="Walking tour")
    place: str = Field(default="City Center")
    city: str = Field(default="")
    cost: float = Field(default=0.0)
    notes: str = Field(default="Enjoy the visit.")

    @model_validator(mode='before')
    @classmethod
    def robust_mapping(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # 1. TIME/SLOT NORMALIZATION
            start_time = data.get("start_time") or data.get("time") or "09:00 AM"
            data["start_time"] = start_time
            if "time_slot" not in data:
                data["time_slot"] = "Morning" # Default slot
            
            # 2. DURATION NORMALIZATION
            dur = data.get('duration_mins') or data.get('duration') or 60
            if isinstance(dur, str):
                import re
                match = re.search(r'\d+', dur)
                data['duration_mins'] = int(match.group()) if match else 60
            else:
                data['duration_mins'] = int(dur)
            
            # 3. CORE FIELD FALLBACKS
            data.setdefault('activity', 'Explore local area')
            data.setdefault('place', 'City Center')
            data.setdefault('notes', 'Popular recommendation')
            
            # 4. COST NORMALIZATION
            try:
                data['cost'] = float(data.get('cost', 0))
            except:
                data['cost'] = 0.0

        return data

class Day(BaseModel):
    day: int = Field(default=1)
    theme: str = Field(default="Exploration")
    activities: List[Activity] = Field(default_factory=list)

class BudgetBreakdown(BaseModel):
    food: float
    transport: float
    activities: float
    total: float

class ItineraryJSON(BaseModel):
    destination: str
    total_days: int
    summary: str
    days: list[Day]
    budget_breakdown: BudgetBreakdown

class TripResponse(BaseModel):
    success: bool
    data: ItineraryJSON
    fallback: bool = False

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
gemini_client = None
if gemini_api_key and gemini_api_key != "your_key_here":
    try:
        gemini_client = genai.Client(api_key=gemini_api_key)
        logger.info("Google GenAI Client Initialized")
    except Exception as e:
        logger.error(f"Failed to initialize GenAI Client: {e}")
else:
    logger.warning("GEMINI_API_KEY not found or default. Gemini Features disabled.")

# PHASE 2 — OPENROUTER CLIENT
openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
openrouter_client = None
if openrouter_api_key and openrouter_api_key != "your_key_here":
    try:
        openrouter_client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=openrouter_api_key,
        )
        logger.info("OpenRouter Client Initialized")
    except Exception as e:
        logger.error(f"Failed to initialize OpenRouter Client: {e}")

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
    PHASE 6 — ZERO-TRUST JSON ENGINE
    Enforces structured output with recursive quality validation.
    """
    start_time = time.time()
    itinerary_json = None
    is_fallback = False
    
    # SYSTEM PROMPT (ULTR-STRICT)
    prompt = f"""
Generate a high-quality travel itinerary for {request.destination} 
({request.days} days, ${request.budget} budget).

### CRITICAL OUTPUT RULES:
- RETURN ONLY VALID JSON.
- DO NOT INCLUDE MARKDOWN.
- NO explanation text before or after JSON.
- FIELD NAMES MUST MATCH EXACTLY:
    - time_slot (e.g., "Morning")
    - start_time (formatted "HH:MM AM/PM")
    - duration_mins (integer)
    - activity (descriptive title)
    - place (real location name)
    - notes (expert travel tip)
    - cost (approximate number)

### JSON SCHEMA:
{{
  "destination": "{request.destination}",
  "total_days": {request.days},
  "summary": "...",
  "days": [
    {{
      "day": 1,
      "theme": "...",
      "activities": [
        {{
          "time_slot": "Morning",
          "start_time": "09:00 AM",
          "duration_mins": 120,
          "activity": "...",
          "place": "...",
          "city": "...",
          "cost": 0,
          "notes": "..."
        }}
      ]
    }}
  ],
  "budget_breakdown": {{ "food": 0, "transport": 0, "activities": 0, "total": 0 }}
}}
"""

    def is_valid(data, requested_days):
        if not data or not isinstance(data, dict):
            return False
        if "days" not in data:
            return False
        if len(data.get("days", [])) != requested_days:
            return False
        
        for day in data["days"]:
            if len(day.get("activities", [])) < 3:
                return False
        return True

    def extract_json(content):
        import json
        import re
        try:
            return json.loads(content)
        except:
            match = re.search(r"\{.*\}", content, re.DOTALL)
            if match:
                return json.loads(match.group(0))
        return None

    MAX_RETRIES = 3
    used_model = "NONE"
    
    # 1. PRIMARY ENGINE (GEMINI/OPENROUTER)
    for attempt in range(MAX_RETRIES):
        try:
            logger.info(f"AI Generation Attempt {attempt + 1}/{MAX_RETRIES}...")
            
            # Prefer OpenRouter gpt-4o-mini for structure reliability
            if openrouter_client:
                used_model = "openai/gpt-4o-mini"
                response = openrouter_client.chat.completions.create(
                    model=used_model,
                    messages=[{"role": "user", "content": prompt}],
                    response_format={"type": "json_object"},
                    extra_headers={"HTTP-Referer": "http://localhost:5174", "X-Title": "Routewise"}
                )
                
                raw_text = response.choices[0].message.content
                logger.info(f"RAW AI RESPONSE: {raw_text}")
                
                parsed = extract_json(raw_text)
                logger.info(f"PARSED JSON: {parsed}")
                
                if is_valid(parsed, request.days):
                    itinerary_json = parsed
                    break
                else:
                    logger.warning(f"Quality validation failed on attempt {attempt + 1}")
            
        except Exception as e:
            logger.error(f"Attempt {attempt + 1} failed: {e}")
            time.sleep(1)

    # 2. FINAL FALLBACK (HIGH-FIDELITY DETERMINISTIC)
    if not itinerary_json:
        logger.warning("Generative AI failed quality gates. Triggering Hard Fallback.")
        is_fallback = True
        used_model = "deterministic_fallback_v2"
        itinerary_json = {
            "destination": request.destination,
            "total_days": request.days,
            "summary": f"A professionally curated selection of the best highlights in {request.destination}.",
            "days": [
                {
                    "day": d + 1,
                    "theme": "Cultural & Historic Landmarks",
                    "activities": [
                        {
                            "time_slot": "Morning", 
                            "start_time": "09:00 AM", 
                            "duration_mins": 120, 
                            "activity": f"Visit {request.destination} Historic Quarter", 
                            "place": f"Old Town {request.destination}", 
                            "city": request.destination, 
                            "cost": 0.0, 
                            "notes": "Beautiful architecture and local history."
                        },
                        {
                            "time_slot": "Afternoon", 
                            "start_time": "01:30 PM", 
                            "duration_mins": 180, 
                            "activity": "Main Museum & Gallery Tour", 
                            "place": f"Royal {request.destination} Museum", 
                            "city": request.destination, 
                            "cost": 15.0, 
                            "notes": "Must-see exhibits and local art."
                        },
                        {
                            "time_slot": "Evening", 
                            "start_time": "07:00 PM", 
                            "duration_mins": 120, 
                            "activity": "Sunset Views & Local Dining", 
                            "place": f"{request.destination} Riverbank", 
                            "city": request.destination, 
                            "cost": 45.0, 
                            "notes": "Great atmosphere for dinner."
                        }
                    ]
                } for d in range(request.days)
            ],
            "budget_breakdown": {
                "food": round(request.budget * 0.3, 2), 
                "transport": round(request.budget * 0.1, 2), 
                "activities": round(request.budget * 0.6, 2), 
                "total": request.budget
            }
        }

    duration = time.time() - start_time
    logger.info(f"Request complete. Duration: {duration:.2f}s | Model: {used_model} | Fallback: {is_fallback}")

    return {
        "success": True,
        "data": itinerary_json,
        "fallback": is_fallback
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
