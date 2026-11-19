from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.business import Business
from .dependencies import get_current_business
from ..schemas.inventory import InventoryAnalysisResponse
from ..services.inventory import analyze_inventory

router = APIRouter()


@router.get("/inventory/analysis", response_model=InventoryAnalysisResponse)
def get_inventory_analysis(
    biz: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    return analyze_inventory(db, biz.id)
