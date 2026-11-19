from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.business import Business
from .dependencies import get_current_business
from ..schemas.ceo import CEOAnalysisResponse, RoutingDecision, CEOOrchestrateRequest
from ..services.ceo import analyze_ceo, route_question, orchestrate_ceo_stream

router = APIRouter()


@router.get("/ceo/analysis", response_model=CEOAnalysisResponse)
def get_ceo_analysis(
    question: str = Query("Why are my sales going down?", description="Owner business query"),
    biz: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    return analyze_ceo(db, question, biz.id)


@router.get("/ceo/route")
def get_ceo_route(
    question: str = Query(..., description="Query to route"),
):
    routes = route_question(question)
    return {
        "question": question,
        "routed_domains": list(routes.keys()),
        "routing_details": routes,
    }


@router.get("/ceo/orchestrate")
async def get_ceo_orchestration(
    question: str = Query("Why is my business profit decreasing and what should I do?", description="Query for multi-agent visual orchestration"),
    biz: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    return StreamingResponse(
        orchestrate_ceo_stream(db, question, biz.id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/ceo/orchestrate")
async def post_ceo_orchestration(
    req: CEOOrchestrateRequest,
    biz: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    return StreamingResponse(
        orchestrate_ceo_stream(db, req.question, biz.id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

