from pydantic import BaseModel, Field
from typing import List, Optional


class JobPayload(BaseModel):
    title: str
    description: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    minimum_experience: int = 0


class CandidatePayload(BaseModel):
    name: str
    skills: List[str] = []
    experience_years: int = 0
    education: List[str] = []
    resume_text: str = ""


class MatchWeights(BaseModel):
    semantic: float = 0.50
    skill: float = 0.30
    experience: float = 0.15
    mandatory: float = 0.05


class MatchRequest(BaseModel):
    job: JobPayload
    candidate: CandidatePayload
    weights: MatchWeights = MatchWeights()


class MatchResponse(BaseModel):
    semantic_score: float
    skill_score: float
    experience_score: float
    mandatory_score: float
    final_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    explanation: str
