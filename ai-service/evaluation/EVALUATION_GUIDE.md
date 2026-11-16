# How to Calculate Evaluation Metrics — Smart Recruiter

Run from `UI/ai-service` (venv active):

```powershell
cd D:\HR_SMART_PLATFORM\UI\ai-service
.\venv\Scripts\Activate.ps1
python evaluation/run_evaluation.py
```

Fast run (skip model comparison — downloads ~400MB mpnet model):

```powershell
python evaluation/run_evaluation.py --skip-models
```

Results saved to: `evaluation/results/evaluation_report.json`

---

## 1. Precision, Recall, F1 (Skill Extraction)

### What you need
A **labelled test dataset** where each resume has **expected skills** (ground truth).

File: `evaluation/labels/skill_extraction.json`

### Formulas

```
Precision = TP / (TP + FP) × 100
Recall    = TP / (TP + FN) × 100
F1        = 2 × (Precision × Recall) / (Precision + Recall)
```

Where:
- **TP** = skills correctly extracted
- **FP** = skills extracted but not in ground truth (false alarms)
- **FN** = skills in ground truth but missed

### Example

| | |
|---|---|
| Expected | React, TypeScript, Redux, Jest |
| Predicted | React, TypeScript, Redux, JavaScript |
| TP | 3 (React, TypeScript, Redux) |
| FP | 1 (JavaScript) |
| FN | 1 (Jest) |
| **Precision** | 3/4 = **75%** |
| **Recall** | 3/4 = **75%** |
| **F1** | **75%** |

### Viva answer

> *"I created a labelled test set of 6 resumes with manually annotated expected skills. I compare `extract_skills()` output against ground truth using normalized skill names, then compute macro-averaged Precision, Recall, and F1."*

---

## 2. MRR & NDCG (Ranking Quality)

### What you need
For each job, rank candidates by your system's score and assign **relevance grades**:

| Grade | Meaning |
|-------|---------|
| 2 | Highly relevant (should rank top) |
| 1 | Partially relevant |
| 0 | Not relevant |

File: `evaluation/labels/ranking_scenarios.json`

### MRR (Mean Reciprocal Rank)

*"Is the first good candidate near the top?"*

```
RR = 1 / rank_of_first_relevant_candidate
MRR = average(RR) across all jobs
```

Example: Best candidate at rank 1 → RR = 1.0. At rank 3 → RR = 0.33.

### NDCG@5 (Normalized Discounted Cumulative Gain)

*"Is the full ranking order good?"*

Higher relevance at top ranks = higher score. Penalizes good candidates ranked too low.

```
DCG = sum over ranks of (2^relevance - 1) / log2(rank + 1)
NDCG = DCG / ideal_DCG
```

Range: 0 to 1 (1 = perfect ranking).

### Viva answer

> *"For each job I label candidates with relevance scores 0/1/2, run hybrid matching, sort by final score, and measure MRR and NDCG@5 against the ideal ranking."*

---

## 3. Model Comparison (MiniLM vs MPNet)

Compares two Sentence Transformer models for **semantic score**:

| Model | Size | Speed | Typical quality |
|-------|------|-------|-----------------|
| `all-MiniLM-L6-v2` | Small (~80MB) | Fast | Good |
| `all-mpnet-base-v2` | Larger (~420MB) | Slower | Better accuracy |

Script runs same ranking scenarios with each model and compares MRR/NDCG.

### Viva answer

> *"I compared all-MiniLM-L6-v2 vs all-mpnet-base-v2 on the same labelled ranking dataset. I report MRR and NDCG@5 for each to justify my model choice."*

---

## 4. Weight Sensitivity Analysis

Tests different hybrid formula weights:

```
Final = w1×Semantic + w2×Skill + w3×Experience + w4×Mandatory
```

Script tries 4 weight combinations and reports which gives best NDCG@5.

### Viva answer

> *"I performed weight sensitivity analysis by varying semantic and skill weights while keeping the sum at 1.0, and selected the configuration with highest NDCG@5 on the test set."*

---

## Adding Your Own Labels

Edit `evaluation/labels/skill_extraction.json`:

```json
{
  "id": "my_resume_1",
  "name": "Candidate Name",
  "resume_text": "Full resume text here...",
  "expected_skills": ["React", "Python", "SQL"]
}
```

Edit `evaluation/labels/ranking_scenarios.json` — set `"relevance": 2` for best match, `0` for poor match.

**Important:** `expected_skills` should only include skills from your `CANONICAL_SKILLS` dictionary — skills not in the dictionary cannot be extracted.

---

## Dissertation Table Template

| Metric | Value | Dataset |
|--------|-------|---------|
| Skill Extraction Precision | XX% | 6 labelled resumes |
| Skill Extraction Recall | XX% | 6 labelled resumes |
| Skill Extraction F1 | XX% | 6 labelled resumes |
| Ranking MRR | X.XX | 3 job scenarios |
| Ranking NDCG@5 | X.XX | 3 job scenarios |
| MiniLM NDCG@5 | X.XX | Model comparison |
| MPNet NDCG@5 | X.XX | Model comparison |

Fill in XX after running the script.
