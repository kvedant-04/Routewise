from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="Routewise API", description="Backend for Routewise - AI Travel Planning Agent")

# Pydantic models for request
class TripRequest(BaseModel):
    destination: str
    budget: float
    days: int

class TripResponse(BaseModel):
    status: str
    itinerary: str
    reasoning_logs: Optional[str] = None

@app.get("/")
def read_root():
    return {"status": "healthy", "message": "Routewise API is running"}

@app.post("/plan-trip", response_model=TripResponse)
def plan_trip(request: TripRequest):
    # Mock response for now
    mock_itinerary = f"Day 1-X: Explore {request.destination} with a budget of ${request.budget} for {request.days} days."
    mock_logs = "Thought: I need to generate an itinerary.\nAction: Use tools.\nObservation: Tools used.\nFinal Answer: Generated itinerary."
    
    return TripResponse(
        status="success",
        itinerary=mock_itinerary,
        reasoning_logs=mock_logs
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
