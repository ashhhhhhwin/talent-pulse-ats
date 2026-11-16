from rapidfuzz import fuzz
from .skill_normalizer import normalize_skill
from .embedding_service import semantic_similarity


def _skill_match(candidate_skills: list[str], job_skill: str) -> bool:
    target = normalize_skill(job_skill)
    for cs in candidate_skills:
        norm = normalize_skill(cs)
        if norm == target:
            return True
        if fuzz.partial_ratio(norm, target) >= 85:
            return True
    return False


def compute_match(job: dict, candidate: dict, weights: dict) -> dict:
    required = job.get("required_skills", [])
    preferred = job.get("preferred_skills", [])
    cand_skills = candidate.get("skills", [])

    matched_required = [s for s in required if _skill_match(cand_skills, s)]
    matched_preferred = [s for s in preferred if _skill_match(cand_skills, s)]
    missing_required = [s for s in required if s not in matched_required]
    missing_preferred = [s for s in preferred if s not in matched_preferred]

    mandatory_score = (len(matched_required) / len(required) * 100) if required else 100.0

    all_job = required + preferred
    all_matched = matched_required + matched_preferred
    skill_score = (len(all_matched) / len(all_job) * 100) if all_job else 0.0

    min_exp = job.get("minimum_experience", 0) or 0
    cand_exp = candidate.get("experience_years", 0) or 0
    if cand_exp >= min_exp:
        experience_score = 100.0
    elif min_exp == 0:
        experience_score = 100.0
    else:
        experience_score = max(0.0, (cand_exp / min_exp) * 100)

    jd_text = f"{job.get('title', '')}. {job.get('description', '')}. Skills: {', '.join(all_job)}"
    resume_text = candidate.get("resume_text") or f"{candidate.get('name', '')} {' '.join(cand_skills)}"
    semantic_score = semantic_similarity(jd_text, resume_text)

    w = weights
    final_score = round(
        w.get("semantic", 0.5) * semantic_score
        + w.get("skill", 0.3) * skill_score
        + w.get("experience", 0.15) * experience_score
        + w.get("mandatory", 0.05) * mandatory_score,
        2,
    )

    explanation = (
        f"Semantic alignment {semantic_score:.1f}%. "
        f"Matched {len(all_matched)}/{len(all_job) or 0} skills. "
        f"Mandatory coverage {mandatory_score:.1f}%. "
        f"Experience {cand_exp} years vs {min_exp} required."
    )
    if missing_required:
        explanation += f" Missing mandatory: {', '.join(missing_required)}."

    return {
        "semantic_score": round(semantic_score, 2),
        "skill_score": round(skill_score, 2),
        "experience_score": round(experience_score, 2),
        "mandatory_score": round(mandatory_score, 2),
        "final_score": final_score,
        "matched_skills": all_matched,
        "missing_skills": missing_required + missing_preferred,
        "explanation": explanation,
    }
