import os
import pandas as pd
import numexpr as ne
from tavily import TavilyClient
from crewai.tools import tool

# Initialize Tavily Client
# It will automatically pick up TAVILY_API_KEY from the environment
tavily_client = TavilyClient()

@tool("Search web")
def search_web(query: str) -> str:
    """Useful to search the internet about a given topic and return relevant results."""
    try:
        response = tavily_client.search(query=query)
        return str(response)
    except Exception as e:
        return f"Error performing web search: {e}"

@tool("Calculate")
def calculate_expression(expression: str) -> str:
    """Useful to evaluate a mathematical expression. Input should be a valid string expression like '200 * 5'."""
    try:
        # numexpr is safe and fast for evaluating math
        result = ne.evaluate(expression)
        return str(result.item() if hasattr(result, 'item') else result)
    except Exception as e:
        return f"Error evaluating expression: {e}"

@tool("Search CSV")
def search_csv(city: str) -> str:
    """Useful to get travel destination data from the local database. Input should be a city name."""
    try:
        # Ensure we look in the data folder relative to the project root
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'destinations.csv')
        df = pd.read_csv(csv_path)
        
        # Case insensitive search
        matches = df[df['City'].str.contains(city, case=False, na=False)]
        
        if len(matches) == 0:
            return f"No data found for city: {city}"
            
        return matches.to_string(index=False)
    except Exception as e:
        return f"Error reading CSV data: {e}"
