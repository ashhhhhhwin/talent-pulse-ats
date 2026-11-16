from fastapi import APIRouter, HTTPException

from ..schemas.assistant_schema import AssistantChatRequest, AssistantChatResponse

router = APIRouter()


@router.post("/chat", response_model=AssistantChatResponse)
def assistant_chat(payload: AssistantChatRequest):
    try:
        from ..services.assistant_service import run_assistant_chat

        return run_assistant_chat(payload.message, payload.history)
    except ImportError as exc:
        raise HTTPException(
            status_code=503,
            detail="Assistant dependencies missing. Run: pip install langchain-google-genai langchain-tavily",
        ) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Assistant query failed: {exc}") from exc
