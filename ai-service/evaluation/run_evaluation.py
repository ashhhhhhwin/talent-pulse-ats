"""
Run dissertation evaluation metrics for Smart Recruiter.

Usage (from UI/ai-service with venv active):
  python evaluation/run_evaluation.py
  python evaluation/run_evaluation.py --skip-models   # skip embedding model comparison (faster)
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from app.services.skill_extractor import extract_skills
from app.services.skill_normalizer import normalize_skill
from app.services.similarity_service import compute_match
from evaluation.metrics import (
    average_metrics,
    mrr,
    ranking_metrics,
    skill_extraction_metrics,
)

LABELS = Path(__file__).resolve().parent / "labels"
DEFAULT_WEIGHTS = {"semantic": 0.5, "skill": 0.3, "experience": 0.15, "mandatory": 0.05}
MODELS = ["all-MiniLM-L6-v2", "all-mpnet-base-v2"]

WEIGHT_GRID = [
    {"semantic": 0.50, "skill": 0.30, "experience": 0.15, "mandatory": 0.05},
    {"semantic": 0.40, "skill": 0.40, "experience": 0.15, "mandatory": 0.05},
    {"semantic": 0.60, "skill": 0.25, "experience": 0.10, "mandatory": 0.05},
    {"semantic": 0.30, "skill": 0.50, "experience": 0.15, "mandatory": 0.05},
]


def load_json(name: str):
    with open(LABELS / name, encoding="utf-8") as f:
        return json.load(f)


def semantic_with_model(text_a: str, text_b: str, model_name: str) -> float:
    from sentence_transformers import SentenceTransformer

    model = SentenceTransformer(model_name)
    emb = model.encode([text_a, text_b], normalize_embeddings=True)
    sim = float(np.dot(emb[0], emb[1]))
    return max(0.0, min(1.0, sim)) * 100


def compute_match_offline(job: dict, candidate: dict, weights: dict, semantic_score: float) -> dict:
    """Hybrid score using provided semantic score — no embedding model load."""
    from app.services.similarity_service import _skill_match

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
    if cand_exp >= min_exp or min_exp == 0:
        experience_score = 100.0
    else:
        experience_score = max(0.0, (cand_exp / min_exp) * 100)

    w = weights
    final_score = round(
        w["semantic"] * semantic_score
        + w["skill"] * skill_score
        + w["experience"] * experience_score
        + w["mandatory"] * mandatory_score,
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


def compute_match_with_semantic_override(job: dict, candidate: dict, weights: dict, semantic_score: float) -> dict:
    return compute_match_offline(job, candidate, weights, semantic_score)


def evaluate_skill_extraction() -> dict:
    rows = []
    samples = load_json("skill_extraction.json")
    print("\n=== 1. Skill Extraction: Precision, Recall, F1 ===")
    for sample in samples:
        predicted = extract_skills(sample["resume_text"])
        m = skill_extraction_metrics(sample["expected_skills"], predicted, normalize_skill)
        m["id"] = sample["id"]
        m["name"] = sample["name"]
        rows.append(m)
        print(
            f"  {sample['name']:<18} P={m['precision']:>6}%  R={m['recall']:>6}%  F1={m['f1']:>6}%"
            f"  (missed: {', '.join(m['missed']) or 'none'})"
        )

    avg = average_metrics(rows)
    print(f"\n  Macro Average -> Precision={avg['precision']}%  Recall={avg['recall']}%  F1={avg['f1']}%")
    return {"per_resume": rows, "macro_average": avg}


def score_scenario(scenario: dict, weights: dict, model_name: str | None = None, offline: bool = False) -> list[dict]:
    job = scenario["job"]
    scored = []
    for cand in scenario["candidates"]:
        labelled_sem = cand.get("semantic_score")
        if model_name:
            jd_text = f"{job['title']}. {job['description']}. Skills: {', '.join(job['required_skills'] + job['preferred_skills'])}"
            resume_text = cand.get("resume_text") or " ".join(cand["skills"])
            sem = semantic_with_model(jd_text, resume_text, model_name)
            result = compute_match_with_semantic_override(job, cand, weights, sem)
        elif offline and labelled_sem is not None:
            result = compute_match_offline(job, cand, weights, labelled_sem)
        else:
            try:
                result = compute_match(job, cand, weights)
            except Exception:
                if labelled_sem is not None:
                    result = compute_match_offline(job, cand, weights, labelled_sem)
                else:
                    raise

        scored.append({**cand, **result})

    return scored


def evaluate_ranking(weights: dict | None = None, model_name: str | None = None, offline: bool = False) -> dict:
    weights = weights or DEFAULT_WEIGHTS
    scenarios = load_json("ranking_scenarios.json")
    ndcg_scores = []
    rr_list = []

    for scenario in scenarios:
        scored = score_scenario(scenario, weights, model_name, offline=offline)
        m = ranking_metrics(scored, score_key="final_score", k=5)
        ndcg_scores.append(m["ndcg_at_k"])
        rr_list.append([1 if c["relevance"] > 0 else 0 for c in m["ranked"]])

    return {
        "mrr": mrr(rr_list),
        "ndcg_at_5": round(sum(ndcg_scores) / len(ndcg_scores), 4) if ndcg_scores else 0,
        "per_scenario_ndcg": ndcg_scores,
    }


def evaluate_model_comparison() -> dict:
    print("\n=== 3. Embedding Model Comparison ===")
    results = {}
    for model in MODELS:
        print(f"  Loading {model} ...")
        r = evaluate_ranking(DEFAULT_WEIGHTS, model_name=model)
        results[model] = r
        print(f"    MRR={r['mrr']}  NDCG@5={r['ndcg_at_5']}")
    return results


def evaluate_weight_sensitivity(offline: bool = False) -> dict:
    print("\n=== 4. Hybrid Formula Weight Sensitivity ===")
    rows = []
    for w in WEIGHT_GRID:
        r = evaluate_ranking(w, offline=offline)
        row = {**w, "mrr": r["mrr"], "ndcg_at_5": r["ndcg_at_5"]}
        rows.append(row)
        print(
            f"  sem={w['semantic']:.2f} skill={w['skill']:.2f} exp={w['experience']:.2f} "
            f"mand={w['mandatory']:.2f} -> MRR={r['mrr']}  NDCG@5={r['ndcg_at_5']}"
        )
    best = max(rows, key=lambda x: x["ndcg_at_5"])
    print(f"\n  Best NDCG@5 config: semantic={best['semantic']}, skill={best['skill']}")
    return rows


def print_ranking_details(offline: bool = False):
    print("\n=== 2. Candidate Ranking: MRR & NDCG@5 ===")
    scenarios = load_json("ranking_scenarios.json")
    rr_list = []

    for scenario in scenarios:
        scored = score_scenario(scenario, DEFAULT_WEIGHTS, offline=offline)
        m = ranking_metrics(scored, score_key="final_score", k=5)
        rr_list.append([1 if c["relevance"] > 0 else 0 for c in m["ranked"]])
        print(f"\n  Job: {scenario['job']['title']}")
        print(f"  NDCG@5 = {m['ndcg_at_k']}")
        for i, c in enumerate(m["ranked"], 1):
            rel = {0: "low", 1: "partial", 2: "high"}[c["relevance"]]
            print(f"    #{i} {c['name']:<18} score={c['score']:>5}  relevance={rel}")

    print(f"\n  Overall MRR = {mrr(rr_list)}")
    ndcg_avg = round(
        sum(ranking_metrics(score_scenario(s, DEFAULT_WEIGHTS, offline=offline))["ndcg_at_k"] for s in scenarios)
        / len(scenarios),
        4,
    )
    print(f"\n  Overall NDCG@5 (avg) = {ndcg_avg}")


def save_report(report: dict):
    out = Path(__file__).resolve().parent / "results" / "evaluation_report.json"
    out.parent.mkdir(exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"\nSaved report -> {out}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-models", action="store_true", help="Skip slow embedding model comparison")
    parser.add_argument("--offline", action="store_true", help="Use labelled semantic scores (no model load)")
    parser.add_argument("--live-semantic", action="store_true", help="Load Sentence Transformer for live semantic scores")
    args = parser.parse_args()
    offline = args.offline or not args.live_semantic

    print("Smart Recruiter — Experimental Evaluation")
    print("=" * 50)

    report = {}
    report["skill_extraction"] = evaluate_skill_extraction()
    print_ranking_details(offline=offline)
    report["ranking_default_weights"] = evaluate_ranking(DEFAULT_WEIGHTS, offline=offline)
    report["mode"] = "offline_labelled_semantic" if offline else "live_sentence_transformer"

    if not args.skip_models and not offline:
        report["model_comparison"] = evaluate_model_comparison()
    elif not args.skip_models and offline:
        print("\n=== 3. Embedding Model Comparison — SKIPPED (use --live-semantic to enable) ===")
    else:
        print("\n=== 3. Embedding Model Comparison — SKIPPED (--skip-models) ===")

    report["weight_sensitivity"] = evaluate_weight_sensitivity(offline=offline)
    save_report(report)

    print("\nDone. Use these numbers in your dissertation evaluation chapter.")


if __name__ == "__main__":
    main()
