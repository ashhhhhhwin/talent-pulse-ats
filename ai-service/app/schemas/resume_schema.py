from pydantic import BaseModel, Field
from typing import List, Optional


class ResumeParseRequest(BaseModel):
    text: str = Field(..., min_length=10)


class ResumeParseResponse(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    experience_years: int = 0
    education: List[str] = []
    certifications: List[str] = []
    projects: List[str] = []
    organizations: List[str] = []
    job_titles: List[str] = []
    summary: Optional[str] = None
