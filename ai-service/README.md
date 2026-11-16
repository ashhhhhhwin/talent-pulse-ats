# Smart Recruiter – Python AI Service

FastAPI microservice for NLP/ML processing.

## Stack

- **FastAPI** – REST API framework
- **spaCy** – NLP pipeline (NER-ready)
- **Sentence Transformers** (`all-MiniLM-L6-v2`) – Semantic embeddings
- **Scikit-learn** – Cosine similarity
- **RapidFuzz** – Fuzzy skill matching
- **NumPy** – Numerical processing

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/ai/parse-resume` | Resume → structured profile |
| POST | `/ai/parse-jd` | Job description → requirements |
| POST | `/ai/match` | Hybrid candidate scoring |
| POST | `/ai/assistant/chat` | HR chat — web candidate search via Tavily + LangChain |
| GET | `/health` | Service health |

## Run locally

**Important:** Use the project virtual environment — do NOT run with Anaconda/global Python (causes NumPy version conflicts).

```powershell
cd D:\HR_SMART_PLATFORM\UI\ai-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
pip install langchain langchain-google-genai langchain-tavily tavily-python
python -m spacy download en_core_web_sm
uvicorn app.main:app --reload --port 8000
```

Or double-click **`start.bat`** (Windows).

Docs: http://localhost:8000/docs

## Matching formula

Deterministic hybrid score (weights passed from Node.js):

```
final_score = w_sem×semantic + w_skill×skill + w_exp×experience + w_mand×mandatory
```

Semantic score uses cosine similarity between JD and resume embeddings.

## AI Assistant (Tavily + Google Gemini)

Set in `ai-service/.env`:

```env
GOOGLE_API_KEY=your-google-api-key
GOOGLE_MODEL=gemini-2.0-flash
TAVILY_API_KEY=your-tavily-api-key
```

Install assistant dependencies:

```bash
pip install langchain langchain-google-genai langchain-tavily tavily-python python-dotenv
```
