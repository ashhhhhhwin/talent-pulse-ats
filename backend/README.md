# Smart Recruiter – Node.js Backend

Express API orchestration layer for the Smart Recruiter dissertation project.

## Architecture

```
React (port 5173) → Node/Express (port 5000) → SQL Server
                                              → Python FastAPI (port 8000)
```

## Package rationale

| Package | Purpose |
|---------|---------|
| **express** | HTTP server and REST routing |
| **mssql** | Microsoft SQL Server driver |
| **jsonwebtoken** | JWT authentication for recruiters |
| **bcryptjs** | Secure password hashing |
| **multer** | Multipart resume file uploads |
| **axios** | HTTP client to Python AI service |
| **cors** | Allow React dev server cross-origin requests |
| **helmet** | Security headers |
| **dotenv** | Environment-based configuration |
| **express-validator** / **joi** | Request body validation |
| **winston** | Structured logging |
| **swagger-ui-express** | Interactive API documentation |
| **pdf-parse** / **mammoth** | Server-side text extraction (PDF/DOCX) before AI parsing |

## Setup

1. **SQL Server**: Run `database/schema.sql` in SSMS.
2. **Environment**: Copy `.env.example` to `.env` and set DB credentials.
3. **Install & seed**:
   ```bash
   cd backend
   npm install
   npm run db:init
   ```
4. **Start AI service** (separate terminal):
   ```bash
   cd ../ai-service
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   uvicorn app.main:app --reload --port 8000
   ```
5. **Start API**:
   ```bash
   npm run dev
   ```

API docs: http://localhost:5000/api/docs  
Health: http://localhost:5000/health

Default admin: `admin@smartrecruiter.local` / `Admin@123`

## Key endpoints

- `POST /api/auth/login` – JWT login
- `GET /api/jobs` – List job descriptions
- `POST /api/resumes/upload` – Upload PDF/DOCX, parse, score
- `POST /api/matching/jobs/:jobId/run` – Run hybrid matching
- `GET /api/matching/jobs/:jobId/results` – Ranked candidates
- `PATCH /api/candidates/:id/stage` – Pipeline stage update
- `GET /api/dashboard/stats` – Dashboard KPIs

## Hybrid scoring (configurable via `.env`)

```
Final = 0.50×Semantic + 0.30×Skill + 0.15×Experience + 0.05×Mandatory
```

Scores are computed by the Python AI service (Sentence Transformers + RapidFuzz) with a deterministic Node.js fallback when AI is unavailable.
