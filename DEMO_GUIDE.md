# Smart Recruiter — Manager Demo Guide

Use this script for a **15–20 minute** walkthrough with your manager.

---

## Before the Demo (30 min prep)

### 1. Start all services

**Terminal 1 — AI Service**
```powershell
cd D:\HR_SMART_PLATFORM\UI\ai-service
.\start.bat
```
Wait for: `Uvicorn running on http://127.0.0.1:8000`

**Terminal 2 — Backend**
```powershell
cd D:\HR_SMART_PLATFORM\UI\backend
npm run dev
```
Wait for: `Smart Recruiter API listening on port 5000`

**Terminal 3 — React UI**
```powershell
cd D:\HR_SMART_PLATFORM\UI
npm run dev
```
Open: **http://localhost:5173**

### 2. Sample resumes ready

Location: `UI/demo-resumes/`

| File | Best match role | Expected score |
|------|-----------------|----------------|
| `01_Priya_Sharma_Senior_Frontend.docx` | Senior Frontend Engineer | **High (~85%+)** |
| `02_Rahul_Verma_Backend_Node.docx` | Backend Engineer (Node.js) | **High (~80%+)** |
| `03_Ananya_Nair_Data_Analyst.docx` | Data Analyst | **High (~75%+)** |
| `04_Karthik_Iyer_Junior_Developer.docx` | Senior Frontend (stretch) | **Lower (~50–65%)** |
| `05_Sneha_Patel_DevOps.docx` | Backend (partial) | **Medium (~55–70%)** |
| `06_Meera_Krishnan_FullStack_Strong.docx` | Frontend or Backend | **Very high** |

Upload 2–3 resumes **before** the meeting so Dashboard already has data.

---

## How to Start (Opening — 2 minutes)

**Say this:**

> "Smart Recruiter is an AI-assisted recruitment platform I built for my M.Tech dissertation.  
> It helps HR **shortlist** the most relevant candidates for a job — it does **not** make hiring decisions.  
> The recruiter always makes the final call."

**Show:** Dashboard home page.

**Point out:**
- Total Candidates
- Active Openings
- Average Match Score
- Top Matching Candidates list

**One line on architecture:**

> "React talks to Node.js, Node.js talks to SQL Server and a Python AI service.  
> The UI never calls Python directly — that's enterprise-style separation."

---

## Demo Flow (Recommended order)

### Step 1 — Job Openings (2 min)

**Navigate:** Job Openings

**Explain:**
- 3 open roles are seeded: Frontend, Backend, Data Analyst
- Each job has **required** vs **preferred** skills
- System scores every candidate against every open job

**Show:** Click each job card → matched candidates sidebar

---

### Step 2 — Live Resume Upload (5 min) ⭐ Most impressive

**Navigate:** Upload & Parse Resume

**Upload:** `01_Priya_Sharma_Senior_Frontend.docx`

**Explain while it parses:**
1. PDF/DOCX uploaded to Node.js backend
2. Text extracted (mammoth/pdf-parse)
3. Sent to Python AI service → structured profile (name, skills, experience)
4. Hybrid matching runs against **all open jobs**
5. Scores saved to SQL Server
6. UI displays results — **React does not calculate scores**

**Point out on screen:**
- Parsed profile (name, email, skills)
- Similarity scores per job
- Best match highlighted

**Then upload:** `04_Karthik_Iyer_Junior_Developer.docx`

**Explain:**
> "Same pipeline, but lower score — 2 years experience vs 4 required, missing Redux/Jest.  
> This shows the scoring is **deterministic and explainable**, not random."

---

### Step 3 — Hybrid Matching Formula (3 min)

**Say:**

> "The match % is not from ChatGPT. It's a **hybrid formula** with four components:"

```
Final Score =
  50% × Semantic Score    (Sentence Transformers — meaning similarity)
+ 30% × Skill Score       (required + preferred skills matched)
+ 15% × Experience Score  (years vs job minimum)
+  5% × Mandatory Score   (required skills only)
```

**Example (Priya vs Frontend job):**
- Has React, TypeScript, Redux, Jest → high skill score
- 6 years vs 4 required → 100% experience
- Strong semantic alignment → high final score

**Open a candidate card** → show Matched Skills / Missing Skills / explanation text

---

### Step 4 — Candidates & Ranking (2 min)

**Navigate:** Candidates & Scoring

**Show:**
- Filter by job
- Min score slider
- Candidates sorted by **Final Score DESC**

**Explain:**
- Mandatory missing skills penalize score more than preferred gaps
- Recruiter uses this as **decision support**, not auto-hire

---

### Step 5 — Interview Pipeline (2 min)

**Navigate:** Interview Pipeline

**Demo:**
- Move a high-scoring candidate to **Screening**
- Drag card to **Technical** round
- Show notes field

**Explain stages:**
Applied → Shortlisted → Technical Interview → Offer Extended

> "Pipeline state is persisted in SQL Server with history audit trail."

---

### Step 6 — AI Sourcing Assistant (2 min) Optional

**Click:** AI Assistant button (top right)

**Ask live:** *"Find React developers with 5+ years in Bengaluru"*

**Explain:**
- Separate feature: **external web search** (Tavily + Google Gemini)
- Finds profiles on LinkedIn/GitHub — not from uploaded resumes
- Restricted to candidate sourcing only (not general chat)

---

## What to Emphasize for Your Manager

| Topic | Key message |
|-------|-------------|
| **Business value** | Faster shortlisting, consistent scoring, less manual resume reading |
| **Not auto-hire** | Decision-support only — HR stays in control |
| **Explainability** | Every score shows semantic, skill, experience, mandatory breakdown |
| **Tech stack** | React, Node.js, SQL Server, Python — matches enterprise standards |
| **Security** | JWT auth, RBAC, audit logs, resume data in SQL Server |
| **Dissertation** | Deterministic, reproducible AI — suitable for academic evaluation |

---

## If Something Breaks During Demo

| Problem | Quick fix |
|---------|-----------|
| APIs fail / 502 | Restart backend: `cd UI/backend && npm run dev` |
| Upload fails | Check AI service: `UI/ai-service/start.bat` |
| Empty dashboard | Upload 1–2 resumes beforehand |
| Browser console `runtime.lastError` | Ignore — browser extension, not your app |

**Fallback:** UI shows mock data if API is down — mention "demo mode" and focus on UI flow.

---

## Closing (1 min)

**Say:**

> "This is Phase 1 of the dissertation system: end-to-end upload, parse, score, rank, and pipeline.  
> Next steps: experimental evaluation with labelled data, Docker deployment, and precision/recall metrics.  
> I'm not claiming production-ready yet — that's future work documented in the dissertation."

**Offer:** Share the PowerPoint at `D:\HR_SMART_PLATFORM\Smart_Recruiter_Presentation.pptx`

---

## 5-Minute Version (if manager is busy)

1. Dashboard (30 sec)
2. Upload Priya's resume live (2 min)
3. Show score breakdown on candidate card (1 min)
4. Show pipeline drag-and-drop (1 min)
5. Architecture one-liner + Q&A (30 sec)

---

Good luck with your presentation!
