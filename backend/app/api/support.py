from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.business import Business
from .dependencies import get_current_business
from ..schemas.support import SupportAnalysisResponse
from ..services.support import analyze_support

router = APIRouter()


@router.get("/support/analysis", response_model=SupportAnalysisResponse)
def get_support_analysis(
    biz: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    return analyze_support(db, biz.id)
