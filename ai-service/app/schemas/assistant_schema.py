from pydantic import BaseModel, Field
from typing import List, Optional


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class Source(BaseModel):
    url: str = Field(description="Source URL used in the answer")


class WebCandidate(BaseModel):
    name: str = Field(description="Candidate full name")
    title: Optional[str] = Field(default=None, description="Current job title or headline")
    skills: List[str] = Field(default_factory=list, description="Relevant skills found")
    location: Optional[str] = Field(default=None, description="Location if available")
    profile_url: Optional[str] = Field(default=None, description="LinkedIn or profile URL")
    summary: Optional[str] = Field(default=None, description="Brief profile summary")


class AssistantChatRequest(BaseModel):
    message: str = Field(..., min_length=3, max_length=2000)
    history: List[ChatMessage] = Field(default_factory=list)


class AssistantChatResponse(BaseModel):
    answer: str = Field(description="Natural language answer for the HR user")
    sources: List[Source] = Field(default_factory=list)
    candidates: List[WebCandidate] = Field(
        default_factory=list,
        description="Candidate profiles discovered from web search",
    )
