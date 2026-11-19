from typing import List, Optional
from pydantic import BaseModel
from .dashboard import InventoryAlertItem


class ProductStockItem(BaseModel):
    id: int
    sku: str
    name: str
    category: str
    price: float
    cost: float
    stock_qty: int
    reorder_threshold: int
    status: str
    days_left: Optional[float] = None
    weekly_velocity: float = 0.0


class InventoryAnalysisResponse(BaseModel):
    agent: str = "Inventory Agent"
    total_skus: int
    critical_stockouts: int
    low_stock_items: int
    overstocked_items: int
    capital_tied_in_overstock: float
    revenue_at_risk_stockouts: float
    products: List[ProductStockItem]
    alerts: List[InventoryAlertItem]
    recommendations: List[str]
    forecast_notes: List[str]
    interpretation: Optional[str] = None
    interpretation_source: str = "deterministic"
