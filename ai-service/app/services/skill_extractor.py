from rapidfuzz import fuzz
from .skill_normalizer import CANONICAL_SKILLS, normalize_skill


def extract_skills(text: str) -> list[str]:
    lower = text.lower()
    found = []
    for skill in CANONICAL_SKILLS:
        norm = normalize_skill(skill)
        if norm in lower or skill.lower() in lower:
            found.append(skill)
            continue
        # fuzzy token match
        for token in lower.replace("/", " ").replace(",", " ").split():
            if len(token) > 2 and fuzz.ratio(token, norm) >= 88:
                found.append(skill)
                break
    return list(dict.fromkeys(found))
