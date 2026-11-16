from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from dotenv import load_dotenv
from .routes.ai_routes import router as ai_router
from .routes.assistant_routes import router as assistant_router

_SERVICE_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(_SERVICE_ROOT / ".env")
load_dotenv(_SERVICE_ROOT / ".env.txt")

app = FastAPI(
    title="Smart Recruiter AI Service",
    description="FastAPI NLP/ML service for resume parsing, JD analysis, and hybrid candidate matching",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router, prefix="/ai", tags=["AI"])
app.include_router(assistant_router, prefix="/ai/assistant", tags=["Assistant"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "smart-recruiter-ai"}
