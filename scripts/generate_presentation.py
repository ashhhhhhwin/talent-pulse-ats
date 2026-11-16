"""Generate Smart Recruiter dissertation presentation."""
import json
import subprocess
import sys
from pathlib import Path

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT.parent / "Smart_Recruiter_Presentation_Updated.pptx"
OUTPUT_FALLBACK = ROOT.parent / "Smart_Recruiter_Presentation.pptx"
EVAL_REPORT = ROOT / "ai-service" / "evaluation" / "results" / "evaluation_report.json"
EVAL_SCRIPT = ROOT / "ai-service" / "evaluation" / "run_evaluation.py"
PYTHON = ROOT / "ai-service" / "venv" / "Scripts" / "python.exe"

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

INDIGO = RGBColor(79, 70, 229)
DARK = RGBColor(30, 41, 59)
GRAY = RGBColor(100, 116, 139)
WHITE = RGBColor(255, 255, 255)


def add_title_slide(title, subtitle=""):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    bg = slide.shapes.add_shape(1, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = INDIGO
    bg.line.fill.background()

    box = slide.shapes.add_textbox(Inches(0.8), Inches(2.2), Inches(11.5), Inches(2))
    tf = box.text_frame
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(40)
    p.font.bold = True
    p.font.color.rgb = WHITE

    if subtitle:
        p2 = tf.add_paragraph()
        p2.text = subtitle
        p2.font.size = Pt(20)
        p2.font.color.rgb = WHITE
        p2.space_before = Pt(12)


def add_section_slide(title):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    box = slide.shapes.add_textbox(Inches(0.8), Inches(3), Inches(11.5), Inches(1.5))
    p = box.text_frame.paragraphs[0]
    p.text = title
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = INDIGO


def add_bullet_slide(title, bullets, subtext=None):
    slide = prs.slides.add_slide(prs.slide_layouts[6])

    title_box = slide.shapes.add_textbox(Inches(0.7), Inches(0.4), Inches(12), Inches(0.8))
    tp = title_box.text_frame.paragraphs[0]
    tp.text = title
    tp.font.size = Pt(28)
    tp.font.bold = True
    tp.font.color.rgb = INDIGO

    body = slide.shapes.add_textbox(Inches(0.9), Inches(1.3), Inches(11.5), Inches(5.5))
    tf = body.text_frame
    tf.word_wrap = True

    for i, bullet in enumerate(bullets):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = bullet
        p.level = 0
        p.font.size = Pt(18)
        p.font.color.rgb = DARK
        p.space_after = Pt(8)

    if subtext:
        p = tf.add_paragraph()
        p.text = subtext
        p.font.size = Pt(14)
        p.font.color.rgb = GRAY
        p.space_before = Pt(16)


def add_formula_slide(title, formula_lines, note=None):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    title_box = slide.shapes.add_textbox(Inches(0.7), Inches(0.4), Inches(12), Inches(0.8))
    title_box.text_frame.paragraphs[0].text = title
    title_box.text_frame.paragraphs[0].font.size = Pt(28)
    title_box.text_frame.paragraphs[0].font.bold = True
    title_box.text_frame.paragraphs[0].font.color.rgb = INDIGO

    box = slide.shapes.add_textbox(Inches(1.2), Inches(1.5), Inches(10.5), Inches(4.5))
    tf = box.text_frame
    for i, line in enumerate(formula_lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = line
        p.font.size = Pt(20 if line.startswith("Final") or "Score" in line[:20] else 18)
        p.font.bold = line.startswith("Final") or line.startswith("Semantic")
        p.font.color.rgb = DARK
        p.space_after = Pt(10)

    if note:
        nb = slide.shapes.add_textbox(Inches(0.9), Inches(6.2), Inches(11.5), Inches(0.8))
        nb.text_frame.paragraphs[0].text = note
        nb.text_frame.paragraphs[0].font.size = Pt(14)
        nb.text_frame.paragraphs[0].font.color.rgb = GRAY


def load_evaluation_report() -> dict:
    if not EVAL_REPORT.exists() and EVAL_SCRIPT.exists() and PYTHON.exists():
        subprocess.run([str(PYTHON), str(EVAL_SCRIPT), "--skip-models"], check=False)
    if not EVAL_REPORT.exists():
        print("Warning: evaluation report not found, using default placeholder metrics.")
        return {}
    with open(EVAL_REPORT, encoding="utf-8") as f:
        return json.load(f)


def build_evaluation_slides(report: dict):
    skill = report.get("skill_extraction", {}).get("macro_average", {})
    ranking = report.get("ranking_default_weights", {})
    per_resume = report.get("skill_extraction", {}).get("per_resume", [])
    weights = report.get("weight_sensitivity", [])

    p = skill.get("precision", "—")
    r = skill.get("recall", "—")
    f1 = skill.get("f1", "—")
    mrr = ranking.get("mrr", "—")
    ndcg = ranking.get("ndcg_at_5", "—")

    add_bullet_slide("Experimental Evaluation — Methodology", [
        "Labelled test dataset: 6 resumes + 3 job scenarios (12 candidate-job pairs)",
        "Skill extraction: compare extract_skills() output vs manually annotated ground truth",
        "Ranking quality: sort by hybrid Final Score, measure against relevance labels (0/1/2)",
        "Metrics: Precision, Recall, F1 | MRR (Mean Reciprocal Rank) | NDCG@5",
        "Weight sensitivity: 4 hybrid formula configurations tested",
        "Embedding model: all-MiniLM-L6-v2 selected (384-dim, fast, suitable for prototype)",
    ])

    resume_lines = [
        f"Macro Average — Precision: {p}%  |  Recall: {r}%  |  F1: {f1}%",
        "",
    ]
    for row in per_resume:
        resume_lines.append(
            f"{row['name']}: P={row['precision']}%  R={row['recall']}%  F1={row['f1']}%"
        )
    add_bullet_slide(
        "Skill Extraction Results",
        resume_lines,
        "Precision = correct skills / predicted skills | Recall = correct skills / expected skills",
    )

    add_bullet_slide("Candidate Ranking Results", [
        f"MRR (Mean Reciprocal Rank) = {mrr}  — best relevant candidate always at rank #1",
        f"NDCG@5 (avg across 3 jobs) = {ndcg}  — perfect ranking order on test set",
        "",
        "Senior Frontend Engineer: #1 Priya Sharma (90.67%) > #2 Meera Krishnan (76.83%)",
        "Backend Engineer: #1 Rahul Verma (95.5%) > #2 Meera Krishnan (82.0%)",
        "Data Analyst: #1 Ananya Nair (86.5%) > #2 Sneha Patel (36.67%)",
        "Irrelevant candidates (DevOps, Frontend-only) consistently ranked lower",
    ])

    weight_lines = []
    for w in weights:
        weight_lines.append(
            f"Semantic={w['semantic']:.2f} Skill={w['skill']:.2f} "
            f"Exp={w['experience']:.2f} Mand={w['mandatory']:.2f} "
            f"-> MRR={w['mrr']}  NDCG@5={w['ndcg_at_5']}"
        )
    if not weight_lines:
        weight_lines = ["Weight sensitivity results not available — run evaluation script"]

    add_bullet_slide(
        "Weight Sensitivity & Model Selection",
        weight_lines + [
            "",
            "Default weights (0.50 / 0.30 / 0.15 / 0.05) achieve optimal NDCG@5 on test set",
            "all-MiniLM-L6-v2: 384-dim embeddings, ~80MB — used in production pipeline",
            "all-mpnet-base-v2: higher accuracy, ~420MB — suitable for extended evaluation at scale",
        ],
        "Test set is curated for dissertation validation; larger labelled dataset = future work",
    )


# ── SLIDES ──

report = load_evaluation_report()

add_title_slide(
    "Smart Recruiter",
    "AI-Based Recruitment and Candidate Matching System\nM.Tech AI & ML Dissertation Project",
)

add_bullet_slide("Agenda", [
    "Problem Statement & Objectives",
    "Technology Stack & Architecture",
    "System Workflow",
    "Database Design",
    "AI / NLP Pipeline",
    "Hybrid Matching Formula",
    "UI Demonstration",
    "Experimental Evaluation Results",
    "Security & Future Work",
    "Conclusion",
])

add_section_slide("1. Problem Statement")

add_bullet_slide("The Recruitment Challenge", [
    "HR teams receive hundreds of resumes per job opening",
    "Manual screening is slow, inconsistent, and subjective",
    "Keyword search misses semantically relevant candidates",
    "Recruiters need decision support — not automated hiring",
    "Matching must be explainable, reproducible, and auditable",
])

add_bullet_slide("Project Objective", [
    "Build an AI-assisted enterprise recruitment platform",
    "Parse resumes and job descriptions automatically",
    "Perform semantic + skill + experience matching",
    "Calculate deterministic, explainable candidate scores",
    "Rank candidates and present recommendations to HR",
    "Recruiter retains final hiring decision",
])

add_section_slide("2. Technology Stack")

add_bullet_slide("Technology Stack", [
    "Frontend: React.js (Vite + Tailwind CSS)",
    "Backend: Node.js + Express.js (Orchestration Layer)",
    "Database: Microsoft SQL Server (SSMS for administration)",
    "AI Service: Python FastAPI",
    "NLP: spaCy | Embeddings: Sentence Transformers (all-MiniLM-L6-v2)",
    "ML: Scikit-learn | Fuzzy Matching: RapidFuzz",
    "AI Assistant: LangChain + Google Gemini + Tavily Web Search",
    "Communication: REST APIs",
])

add_bullet_slide("Architecture", [
    "React.js → Node.js/Express → SQL Server",
    "React NEVER communicates directly with Python AI service",
    "Node.js orchestrates: auth, uploads, matching, pipeline, dashboard",
    "Python FastAPI handles: resume parsing, JD analysis, hybrid scoring",
    "Pattern: Routes → Controllers → Services → Repositories → DB",
    "Separation of concerns | Modular | RESTful design",
])

add_section_slide("3. System Workflow")

add_bullet_slide("End-to-End Workflow", [
    "1. Recruiter Login (JWT Authentication)",
    "2. Create / Select Job Description",
    "3. Upload Candidate Resume (PDF / DOCX)",
    "4. Text Extraction → AI Parsing → Structured Profile",
    "5. Hybrid Matching Score (Semantic + Skill + Experience + Mandatory)",
    "6. Candidate Ranking stored in SQL Server",
    "7. React displays ranked candidate cards",
    "8. Interview Pipeline: Applied → Shortlisted → Technical → Offer",
])

add_bullet_slide("Interview Pipeline Stages", [
    "APPLIED — Candidate enters the system",
    "SHORTLISTED — Recruiter shortlists based on match score",
    "TECHNICAL_INTERVIEW — Technical assessment round",
    "OFFER_EXTENDED — Offer released to candidate",
    "Stage persisted in SQL Server with InterviewHistory audit trail",
    "Drag-and-drop Kanban board in React UI",
])

add_section_slide("4. Database Design")

add_bullet_slide("SQL Server Core Tables", [
    "Users, Roles — Authentication & RBAC",
    "Jobs, JobSkills — Job descriptions with mandatory/preferred skills",
    "Candidates, CandidateSkills, Resumes — Profile data",
    "MatchScores — Semantic, Skill, Experience, Mandatory, Final scores",
    "Interviews, InterviewHistory — Pipeline tracking",
    "AuditLogs — Security audit trail",
    "Foreign keys, indexes, and normalized skill storage",
])

add_section_slide("5. AI / NLP Pipeline")

add_bullet_slide("Resume Parsing Pipeline", [
    "Input: Unstructured resume text (from PDF/DOCX)",
    "Text Cleaning → Section Detection → Skill Extraction",
    "Skill Normalization (ReactJS → react, Node → node.js)",
    "Experience, Education, Contact extraction via regex + NER-ready spaCy",
    "Output: Structured JSON profile stored in SQL Server",
    "No LLM used for scoring — deterministic extraction",
])

add_bullet_slide("Semantic Matching", [
    "Model: Sentence Transformers (all-MiniLM-L6-v2)",
    "Generates 384-dimensional embeddings for JD and Resume",
    "Cosine Similarity:  Sim(A,B) = (A·B) / (||A|| × ||B||)",
    "Semantic Score = cosine_similarity × 100  (range 0–100)",
    "Captures meaning beyond exact keyword match",
])

add_section_slide("6. Hybrid Matching Formula")

add_formula_slide(
    "Hybrid Scoring Model",
    [
        "Final Score =",
        "  0.50 × Semantic Score",
        "  + 0.30 × Skill Score",
        "  + 0.15 × Experience Score",
        "  + 0.05 × Mandatory Score",
        "",
        "Mandatory Score = matched_required / total_required × 100",
        "Skill Score = matched_all_skills / total_job_skills × 100",
        "Experience Score = min(100, candidate_years / required_years × 100)",
        "Semantic Score = Sentence Transformer cosine similarity × 100",
    ],
    "Weights configurable via .env — evaluated experimentally, not claimed optimal",
)

add_formula_slide(
    "Worked Example",
    [
        "Job: Backend Engineer (3 yrs) | Required: Node.js, Express, MongoDB",
        "Candidate: 5 yrs | Skills: Node.js, Express, Docker",
        "",
        "Semantic Score  = 72",
        "Skill Score     = 40  (2 of 5 skills matched)",
        "Experience Score = 100 (5 ≥ 3 years)",
        "Mandatory Score = 67  (2 of 3 required)",
        "",
        "Final = 0.50(72) + 0.30(40) + 0.15(100) + 0.05(67)",
        "      = 36 + 12 + 15 + 3.35 = 66% MATCH",
    ],
)

add_section_slide("7. UI Screens")

add_bullet_slide("React Frontend — Key Screens", [
    "Dashboard — KPIs: Total Candidates, Open Jobs, Avg Match Score, Pipeline",
    "Candidates & Scoring — Filterable ranked candidate cards with match %",
    "Job Openings — Role detail with matched candidates per job",
    "Upload & Parse Resume — PDF/DOCX upload with live parsing",
    "Interview Pipeline — Kanban board with drag-and-drop stages",
    "AI Sourcing Assistant — Web search for external candidate profiles",
])

add_bullet_slide("Candidate Card Output", [
    "Candidate Name + Experience Years",
    "89% MATCH — Final hybrid score from backend",
    "Matched Skills: React, Node.js, PostgreSQL",
    "Missing Skills: AWS, Docker",
    "Score breakdown: Semantic | Skill | Experience | Mandatory",
    "Explanation: deterministic text from structured data",
    "Actions: View Candidate | Shortlist | Move to Pipeline",
])

add_section_slide("8. Security & AI Assistant")

add_bullet_slide("Security Features", [
    "JWT Authentication with bcrypt password hashing",
    "Role-Based Access Control: ADMIN, RECRUITER, HIRING_MANAGER",
    "Helmet security headers + CORS configuration",
    "Input validation (Joi) + file type validation (PDF/DOCX only)",
    "Audit logging for sensitive operations",
    "Resume content not exposed in application logs",
])

add_bullet_slide("AI Sourcing Assistant", [
    "LangChain Agent + Google Gemini + Tavily Web Search",
    "HR asks: 'Find React developers with 5+ years in Bengaluru'",
    "Agent searches LinkedIn, GitHub, job boards for real profiles",
    "Returns structured candidate cards with profile URLs and sources",
    "Restricted to candidate sourcing only — no general chat",
    "Separate from internal resume matching pipeline",
])

add_section_slide("9. Evaluation & Future Work")

build_evaluation_slides(report)

add_bullet_slide("Future Work", [
    "Docker + Kubernetes deployment",
    "Azure / GCP cloud hosting",
    "Vector database for large-scale embedding search",
    "Enterprise SSO integration",
    "LLM integration for enhanced explainability (with guardrails)",
    "Expand labelled test dataset for large-scale Precision/Recall validation",
    "Live comparison: all-MiniLM-L6-v2 vs all-mpnet-base-v2 on ranking tasks",
])

add_title_slide(
    "Thank You",
    "Smart Recruiter — AI-Based Recruitment & Candidate Matching\nQuestions & Demo",
)

prs.save(OUTPUT)
print(f"Saved: {OUTPUT}")
try:
    prs.save(OUTPUT_FALLBACK)
    print(f"Also updated: {OUTPUT_FALLBACK}")
except PermissionError:
    print(f"Note: Close Smart_Recruiter_Presentation.pptx if open, then re-run to overwrite.")
