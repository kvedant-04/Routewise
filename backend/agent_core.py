import os
from dotenv import load_dotenv
from crewai import Agent
from langchain_openai import ChatOpenAI
from langchain.tools import Tool

# Import tool functions and wrap them as LangChain Tool objects.
from tools import search_web as _search_web, calculate_expression as _calculate_expression, search_csv as _search_csv

load_dotenv()

# Wrap tool functions as LangChain Tool objects to satisfy CrewAI/LangChain validation.
search_web = Tool.from_function(
    _search_web,
    name="search_web",
    description="Search the web for relevant travel information.",
)
calculate_expression = Tool.from_function(
    _calculate_expression,
    name="calculate_expression",
    description="Evaluate numerical expressions for budgeting.",
)
search_csv = Tool.from_function(
    _search_csv,
    name="search_csv",
    description="Lookup destination data from the local CSV database.",
)

# Initialize OpenRouter LLM using LangChain's ChatOpenAI wrapper
# OpenRouter is OpenAI compatible, just swap the base_url
llm = ChatOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ.get("OPENROUTER_API_KEY", "dummy_key"),
    model="openai/gpt-4o-mini", # Default model for the agent
)

travel_planner_agent = Agent(
    role="Travel Planner Agent",
    goal="Plan complete travel itineraries using available tools",
    backstory="An expert AI travel planner that uses web search, dataset and calculations",
    tools=[search_web, calculate_expression, search_csv],
    verbose=True,
    allow_delegation=False,
    llm=llm
)
