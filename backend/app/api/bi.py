from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.business import Business
from .dependencies import get_current_business
from ..schemas.bi import BIAnalysisResponse
from ..services.bi import analyze_bi

router = APIRouter()


@router.get("/bi/analysis", response_model=BIAnalysisResponse)
def get_bi_analysis(
    biz: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    return analyze_bi(db, biz.id)
