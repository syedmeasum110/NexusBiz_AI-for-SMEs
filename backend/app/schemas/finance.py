from typing import List, Optional
from pydantic import BaseModel


class ExpenseBreakdownItem(BaseModel):
    category: str
    amount: float
    percentage: float
    description: str


class MonthlyFinanceItem(BaseModel):
    month: str
    year: int
    revenue: float
    cogs: float
    gross_profit: float
    expenses: float
    net_profit: float
    margin_percent: float


class FinanceAnalysisResponse(BaseModel):
    agent: str = "Finance Agent"
    current_month_revenue: float
    current_month_profit: float
    current_month_expenses: float
    profit_margin_percent: float
    revenue_growth_mom: float
    cash_flow_status: str
    expense_breakdown: List[ExpenseBreakdownItem]
    monthly_trend: List[MonthlyFinanceItem]
    key_findings: List[str]
    risks: List[str]
    cost_optimizations: List[str]
    interpretation: Optional[str] = None
    interpretation_source: str = "deterministic"
