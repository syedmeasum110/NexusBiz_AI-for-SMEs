from typing import List, Optional
from pydantic import BaseModel


class MetricItem(BaseModel):
    label: str
    value: float
    prefix: str = ""
    change: Optional[float] = None
    change_label: Optional[str] = None
    note: Optional[str] = None


class SalesTrendItem(BaseModel):
    month: str
    year: int
    revenue: float
    profit: float
    orders: int


class InventoryAlertItem(BaseModel):
    item: str
    sku: Optional[str] = None
    status: str
    qty: int
    revenue_at_risk: float = 0.0
    days_of_stock_remaining: Optional[float] = None
    recommended_reorder_qty: Optional[int] = None
    excess_stock_qty: Optional[int] = None


class TopProductItem(BaseModel):
    name: str
    sku: str
    sales: int
    revenue: float
    stock_qty: int
    trend: str


class WeakProductItem(BaseModel):
    name: str
    sku: str
    sales: int
    revenue: float
    stock_qty: int
    reason: str


class RecommendationItem(BaseModel):
    priority: str
    title: str
    description: str
    expected_impact: Optional[str] = None
    domain: Optional[str] = None
    agent: Optional[str] = None


class RecentActivityItem(BaseModel):
    agent: str
    action: str
    time: str
    finding: Optional[str] = None


class DashboardData(BaseModel):
    business_name: str
    owner_name: str
    location: str
    currency: str
    as_of_date: str
    health_score: int
    risk_level: str
    metrics: List[MetricItem]
    sales_trend: List[SalesTrendItem]
    inventory_alerts: List[InventoryAlertItem]
    top_products: List[TopProductItem]
    weak_products: List[WeakProductItem]
    recommendations: List[RecommendationItem]
    recent_activity: List[RecentActivityItem]
