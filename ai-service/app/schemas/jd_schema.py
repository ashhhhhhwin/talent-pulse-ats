from pydantic import BaseModel
from typing import List, Optional


class JDParseRequest(BaseModel):
    text: str
    title: Optional[str] = None


class JDParseResponse(BaseModel):
    title: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    minimum_experience: int = 0
    education: List[str] = []
    certifications: List[str] = []
    responsibilities: List[str] = []
