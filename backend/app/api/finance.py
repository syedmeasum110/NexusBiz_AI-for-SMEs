from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.business import Business
from .dependencies import get_current_business
from ..schemas.finance import FinanceAnalysisResponse
from ..services.finance import analyze_finance

router = APIRouter()


@router.get("/finance/analysis", response_model=FinanceAnalysisResponse)
def get_finance_analysis(
    biz: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    return analyze_finance(db, biz.id)
