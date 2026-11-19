from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.business import Business
from .dependencies import get_current_business
from ..schemas.marketing import MarketingAnalysisResponse
from ..services.marketing import analyze_marketing

router = APIRouter()


@router.get("/marketing/analysis", response_model=MarketingAnalysisResponse)
def get_marketing_analysis(
    biz: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    return analyze_marketing(db, biz.id)
