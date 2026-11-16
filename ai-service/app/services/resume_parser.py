import re
from ..utils.text_cleaner import clean_text, extract_email, extract_phone, extract_years
from .skill_extractor import extract_skills


def _guess_name(text: str) -> str:
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for line in lines[:5]:
        if "@" in line or re.search(r"\d{5,}", line):
            continue
        if 2 <= len(line.split()) <= 4 and len(line) < 60:
            return line.title()
    return "Unknown Candidate"


def _extract_education(text: str) -> list[str]:
    edu = []
    patterns = [
        r"(B\.?\s?Tech[^\n]{0,80})",
        r"(M\.?\s?Tech[^\n]{0,80})",
        r"(MBA[^\n]{0,80})",
        r"(B\.?\s?E\.?[^\n]{0,80})",
        r"(M\.?\s?Sc[^\n]{0,80})",
    ]
    for p in patterns:
        for m in re.finditer(p, text, re.I):
            edu.append(m.group(1).strip())
    return list(dict.fromkeys(edu))[:5]


def _extract_job_titles(text: str) -> list[str]:
    titles = []
    keywords = ["engineer", "developer", "analyst", "manager", "lead", "architect", "consultant"]
    for line in text.split("\n"):
        l = line.strip()
        if any(k in l.lower() for k in keywords) and len(l) < 80:
            titles.append(l)
    return titles[:5]


def parse_resume(text: str) -> dict:
    cleaned = clean_text(text)
    return {
        "name": _guess_name(cleaned),
        "email": extract_email(cleaned),
        "phone": extract_phone(cleaned),
        "skills": extract_skills(cleaned),
        "experience_years": extract_years(cleaned),
        "education": _extract_education(cleaned),
        "certifications": [],
        "projects": [],
        "organizations": [],
        "job_titles": _extract_job_titles(cleaned),
        "summary": cleaned[:400],
    }
