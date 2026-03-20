from dotenv import load_dotenv
import os
from pathlib import Path

load_dotenv()

import pandas as pd
import numexpr as ne
from tavily import TavilyClient

def search_web(query: str) -> str:
    """Search the web for a query and return a text summary of results."""
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return "Tavily API key missing"

    try:
        client = TavilyClient(api_key=api_key)
        response = client.search(query=query)
        return str(response)
    except Exception as e:
        return f"Error performing web search: {e}"


def calculate_expression(expression: str) -> str:
    """Evaluate a mathematical expression safely using numexpr."""
    try:
        result = ne.evaluate(expression)
        if hasattr(result, "item"):
            result = result.item()
        return str(result)
    except Exception:
        return "Invalid expression"


def search_csv(city: str) -> dict:
    """Look up a city in the local destinations CSV and return the first matching row as a dict."""
    try:
        csv_path = Path(__file__).resolve().parents[1] / "data" / "destinations.csv"
        df = pd.read_csv(csv_path)

        matches = df[df["City"].str.contains(city, case=False, na=False)]
        if matches.empty:
            return {"error": f"No data found for city: {city}"}

        record = matches.iloc[0].to_dict()
        return record
    except Exception:
        return {"error": "Error reading CSV data"}
