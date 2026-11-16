from fastapi import APIRouter
from ..schemas.resume_schema import ResumeParseRequest, ResumeParseResponse
from ..schemas.jd_schema import JDParseRequest, JDParseResponse
from ..schemas.match_schema import MatchRequest, MatchResponse
from ..services.resume_parser import parse_resume
from ..services.jd_parser import parse_jd
from ..services.similarity_service import compute_match

router = APIRouter()


@router.post("/parse-resume", response_model=ResumeParseResponse)
def parse_resume_route(payload: ResumeParseRequest):
    return parse_resume(payload.text)


@router.post("/parse-jd", response_model=JDParseResponse)
def parse_jd_route(payload: JDParseRequest):
    return parse_jd(payload.text, payload.title)


@router.post("/match", response_model=MatchResponse)
def match_route(payload: MatchRequest):
    result = compute_match(
        payload.job.model_dump(),
        payload.candidate.model_dump(),
        payload.weights.model_dump(),
    )
    return result
