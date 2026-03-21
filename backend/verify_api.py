import requests
import json

url = "http://127.0.0.1:8000/plan-trip"
data = {
    "destination": "London",
    "budget": 100,
    "days": 1
}

try:
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=4))
except Exception as e:
    print(f"Error: {e}")
