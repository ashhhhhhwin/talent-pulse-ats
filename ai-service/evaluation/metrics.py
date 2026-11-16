"""Evaluation metrics for Smart Recruiter dissertation."""

from __future__ import annotations

import math


def normalize_skill_set(skills: list[str], normalizer) -> set[str]:
    return {normalizer(s) for s in skills if s}


def skill_extraction_metrics(expected: list[str], predicted: list[str], normalizer) -> dict:
    """Per-resume precision, recall, F1 using normalized skill names."""
    exp = normalize_skill_set(expected, normalizer)
    pred = normalize_skill_set(predicted, normalizer)

    tp = len(exp & pred)
    fp = len(pred - exp)
    fn = len(exp - pred)

    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) else 0.0

    return {
        "true_positive": tp,
        "false_positive": fp,
        "false_negative": fn,
        "precision": round(precision * 100, 2),
        "recall": round(recall * 100, 2),
        "f1": round(f1 * 100, 2),
        "expected": sorted(exp),
        "predicted": sorted(pred),
        "missed": sorted(exp - pred),
        "extra": sorted(pred - exp),
    }


def average_metrics(rows: list[dict]) -> dict:
    if not rows:
        return {"precision": 0, "recall": 0, "f1": 0}
    return {
        "precision": round(sum(r["precision"] for r in rows) / len(rows), 2),
        "recall": round(sum(r["recall"] for r in rows) / len(rows), 2),
        "f1": round(sum(r["f1"] for r in rows) / len(rows), 2),
    }


def dcg(relevances: list[float], k: int | None = None) -> float:
    items = relevances[:k] if k else relevances
    score = 0.0
    for i, rel in enumerate(items):
        score += (2**rel - 1) / math.log2(i + 2)
    return score


def ndcg_at_k(relevances: list[float], k: int = 5) -> float:
    """NDCG@k for a ranked list. relevances ordered by predicted rank."""
    ideal = sorted(relevances, reverse=True)
    ideal_dcg = dcg(ideal, k)
    if ideal_dcg == 0:
        return 0.0
    return round(dcg(relevances, k) / ideal_dcg, 4)


def mrr(relevance_lists: list[list[int]]) -> float:
    """
    Mean Reciprocal Rank across queries.
    Each inner list is binary relevance in predicted rank order.
    """
    rr = []
    for rels in relevance_lists:
        for i, rel in enumerate(rels):
            if rel > 0:
                rr.append(1 / (i + 1))
                break
        else:
            rr.append(0.0)
    return round(sum(rr) / len(rr), 4) if rr else 0.0


def ranking_metrics(candidates: list[dict], score_key: str = "final_score", k: int = 5) -> dict:
    """
    candidates: list with 'relevance' (0/1/2) and score_key.
    Returns MRR, NDCG@k, and ranked order for one job scenario.
    """
    ranked = sorted(candidates, key=lambda c: c[score_key], reverse=True)
    relevances = [c["relevance"] for c in ranked]
    binary = [1 if r > 0 else 0 for r in relevances]

    return {
        "ndcg_at_k": ndcg_at_k(relevances, k),
        "reciprocal_rank": next((1 / (i + 1) for i, r in enumerate(binary) if r), 0.0),
        "ranked": [
            {
                "name": c["name"],
                "score": round(c[score_key], 2),
                "relevance": c["relevance"],
            }
            for c in ranked
        ],
    }
