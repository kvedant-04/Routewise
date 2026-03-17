from crewai.tools import tool
from dotenv import load_dotenv
import os
from pathlib import Path
import pandas as pd
import numexpr as ne
from tavily import TavilyClient

load_dotenv()

@tool("Search web")
def search_web(query: str) -> str:
    """Useful to search the internet about a given topic and return relevant real-time results."""
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return "Tavily API key missing"

    try:
        client = TavilyClient(api_key=api_key)
        response = client.search(query=query)
        return str(response)
    except Exception as e:
        return f"Error performing web search: {e}"


@tool("Calculate")
def calculate_expression(expression: str) -> str:
    """Useful to evaluate a mathematical expression. Input should be a valid string expression like '200 * 5'."""
    try:
        result = ne.evaluate(expression)
        if hasattr(result, "item"):
            result = result.item()
        return str(result)
    except Exception:
        return "Invalid expression"


@tool("Search CSV")
def search_csv(city: str) -> str:
    """Useful to get travel destination data (attractions, average cost, best season) from the local database. Input should be a city name."""
    try:
        csv_path = Path(__file__).resolve().parents[1] / "data" / "destinations.csv"
        if not csv_path.exists():
            return "Error: Local database (destinations.csv) not found."
            
        df = pd.read_csv(csv_path)

        matches = df[df["City"].str.contains(city, case=False, na=False)]
        if matches.empty:
            return f"No data found for city: {city}"

        return matches.to_string(index=False)
    except Exception as e:
        return f"Error reading CSV data: {e}"
