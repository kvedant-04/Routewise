import os
from dotenv import load_dotenv
from crewai import Agent
from langchain_openai import ChatOpenAI

# Import tool functions decorated with @tool from tools.py
from tools import search_web, calculate_expression, search_csv

load_dotenv()

# Initialize OpenRouter LLM using LangChain's ChatOpenAI wrapper
# OpenRouter is OpenAI compatible, just swap the base_url
llm = ChatOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.environ.get("OPENROUTER_API_KEY", "dummy_key"),
    model="openai/gpt-4o-mini", # Default model for the agent
)

travel_planner_agent = Agent(
    role="Expert Travel Planner",
    goal="Create the most personalized and optimized travel itineraries based on destination, budget, and time.",
    backstory=(
        "You are an experienced travel agent who has lived all over the world. "
        "You excel at balancing costs with incredible experiences and creating structured, actionable itineraries."
        "You think step-by-step to gather information and output clear advice."
    ),
    verbose=True,
    allow_delegation=False,
    llm=llm,
    tools=[search_web, calculate_expression, search_csv]
)
