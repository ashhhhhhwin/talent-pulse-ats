import re
from .skill_extractor import extract_skills
from ..utils.text_cleaner import extract_years, clean_text


def parse_jd(text: str, title: str | None = None) -> dict:
    cleaned = clean_text(text)
    skills = extract_skills(cleaned)

    required = []
    preferred = []
    in_preferred = False
    for line in cleaned.split("\n"):
        ll = line.lower()
        if "preferred" in ll or "nice to have" in ll:
            in_preferred = True
        elif "required" in ll or "must have" in ll or "mandatory" in ll:
            in_preferred = False

    for skill in skills:
        if in_preferred:
            preferred.append(skill)
        else:
            required.append(skill)

    if not required and skills:
        required = skills[: max(1, len(skills) // 2)]
        preferred = skills[len(required) :]

    responsibilities = [
        l.strip()
        for l in cleaned.split("\n")
        if l.strip().startswith(("-", "•", "*")) or re.match(r"^\d+\.", l.strip())
    ][:10]

    return {
        "title": title or "Job Opening",
        "required_skills": required,
        "preferred_skills": preferred,
        "minimum_experience": extract_years(cleaned),
        "education": [],
        "certifications": [],
        "responsibilities": responsibilities,
    }
