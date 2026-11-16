import os
import re
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_tavily import TavilySearch
from pydantic import ValidationError

from ..schemas.assistant_schema import AssistantChatResponse, ChatMessage

_SERVICE_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_SERVICE_ROOT / ".env")
load_dotenv(_SERVICE_ROOT / ".env.txt")  # fallback if user saved as .env.txt

RECRUITER_SYSTEM_PROMPT = """You are Smart Recruiter AI Sourcing Assistant — a specialized HR tool for ONE task only:
search the public web and return candidate profiles relevant to the recruiter's query.

STRICT RULES — NEVER BREAK:
1. ONLY perform web search for candidate/recruitment sourcing. Use Tavily search every time.
2. NEVER write code, scripts, emails, essays, or general knowledge answers.
3. NEVER respond to greetings, small talk, or off-topic questions — refuse politely in `answer`.
4. NEVER act as a general chatbot. You are not ChatGPT for open conversation.
5. Search LinkedIn, GitHub, job boards, and professional directories for REAL profiles.
6. Never invent people or URLs. Only include profiles supported by search results.
7. Populate `candidates` with structured profiles and list all URLs in `sources`.
8. If the query is not about finding candidates, respond ONLY with:
   "I can only search the web for candidate profiles. Ask me to find people by skill, role, or location."

Allowed query examples:
- "Find React developers in Bengaluru with 5+ years"
- "Search LinkedIn for Node.js backend engineers"
- "Get profiles of data analysts with Python and SQL skills"

Forbidden: greetings, "write python", homework, jokes, weather, unrelated advice."""


OFF_TOPIC_PATTERNS = [
    r"^\s*(hi|hello|hey|good morning|good evening|how are you|thanks|thank you|bye)\s*[!.?]*\s*$",
    r"\b(write|generate|create)\s+(a\s+)?(python|java|javascript|code|script|program|function|sql query)\b",
    r"\bexplain\s+(python|javascript|machine learning|ai|blockchain)\b",
    r"\b(weather|joke|poem|story|recipe|homework|essay)\b",
    r"\bwho is (the|a) (president|prime minister)\b",
]

SOURCING_SIGNALS = [
    r"\b(find|search|get|look for|source|fetch|discover|show me|list)\b",
    r"\b(candidate|candidates|profile|profiles|resume|recruit|hiring|hire|talent|applicant)\b",
    r"\b(developer|engineer|analyst|designer|manager|architect|consultant|specialist)\b",
    r"\b(linkedin|github|naukri|indeed|job board)\b",
    r"\b(skill|skills|experience|years|yrs|location|remote|hybrid|on-site)\b",
    r"\b(react|node\.?js|python|java|sql|aws|angular|devops|full stack|frontend|backend)\b",
]


def _is_sourcing_query(query: str) -> bool:
    text = query.strip().lower()
    if len(text) < 8:
        return False

    for pattern in OFF_TOPIC_PATTERNS:
        if re.search(pattern, text, re.I):
            return False

    return any(re.search(pattern, text, re.I) for pattern in SOURCING_SIGNALS)


def _off_topic_response() -> AssistantChatResponse:
    return AssistantChatResponse(
        answer=(
            "I can only search the web for candidate profiles. "
            "Ask me to find people by skill, role, experience, or location — "
            'for example: "Find React developers with 5+ years in Mumbai."'
        ),
        sources=[],
        candidates=[],
    )


def _build_messages(query: str, history: list[ChatMessage]) -> list:
    messages: list = [SystemMessage(content=RECRUITER_SYSTEM_PROMPT)]
    for item in history[-8:]:
        if item.role == "user":
            messages.append(HumanMessage(content=item.content))
        else:
            messages.append(AIMessage(content=item.content))
    messages.append(HumanMessage(content=query))
    return messages


def _get_agent():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY is not configured in ai-service environment")

    tavily_key = os.getenv("TAVILY_API_KEY")
    if not tavily_key:
        raise RuntimeError("TAVILY_API_KEY is not configured in ai-service environment")

    model_name = os.getenv("GOOGLE_MODEL", "gemini-2.0-flash")
    llm = ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=api_key,
        temperature=0,
    )
    tools = [TavilySearch(max_results=5)]
    return create_agent(model=llm, tools=tools, response_format=AssistantChatResponse)


_agent = None


def _agent_instance():
    global _agent
    if _agent is None:
        _agent = _get_agent()
    return _agent


def _extract_structured(result: Any) -> AssistantChatResponse:
    if isinstance(result, AssistantChatResponse):
        return result

    if isinstance(result, dict):
        if "structured_response" in result and result["structured_response"]:
            payload = result["structured_response"]
            if isinstance(payload, AssistantChatResponse):
                return payload
            return AssistantChatResponse.model_validate(payload)

        if "output" in result and result["output"]:
            return AssistantChatResponse.model_validate(result["output"])

        if "answer" in result:
            return AssistantChatResponse.model_validate(result)

    raise ValueError("Agent returned an unexpected response format")


def run_assistant_chat(query: str, history: list[ChatMessage] | None = None) -> AssistantChatResponse:
    history = history or []

    if not _is_sourcing_query(query):
        return _off_topic_response()

    agent = _agent_instance()
    messages = _build_messages(query, history)

    try:
        result = agent.invoke({"messages": messages})
        return _extract_structured(result)
    except ValidationError as exc:
        raise ValueError(f"Could not parse assistant response: {exc}") from exc
