import requests
import json

def test_itinerary(destination, budget, days):
    url = "http://127.0.0.1:8000/plan-trip"
    payload = {
        "destination": destination,
        "budget": budget,
        "days": days
    }
    try:
        response = requests.post(url, json=payload, timeout=30)
        print(f"\n--- Testing: {destination} | ${budget} | {days} Days ---")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Success: {data.get('success')}")
        print(f"Fallback Active: {data.get('fallback')}")
        itinerary = data.get('data', {}).get('itinerary', '')
        print(f"Content Length: {len(itinerary)}")
        if len(itinerary) > 100:
            print("Preview: " + itinerary[:200] + "...")
        else:
            print("Content: " + itinerary)
    except Exception as e:
        print(f"Error testing {destination}: {str(e)}")

if __name__ == "__main__":
    # Edge Case 1: Empty Destination
    test_itinerary("", 500, 3)
    
    # Edge Case 2: Very Low Budget
    test_itinerary("Paris", 1.0, 3)
    
    # Edge Case 3: Large Days
    test_itinerary("Tokyo", 2000, 15)
