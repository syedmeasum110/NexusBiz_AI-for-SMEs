from typing import List, Optional
from pydantic import BaseModel


class TicketItem(BaseModel):
    id: int
    customer_name: str
    ticket_type: str
    status: str
    sentiment: str
    description: str
    channel: str
    created_at: str


class SupportAnalysisResponse(BaseModel):
    agent: str = "Customer Support Agent"
    total_tickets: int
    open_tickets: int
    resolved_tickets: int
    negative_sentiment_rate: float
    delivery_complaint_count: int
    delivery_issue_spike: bool
    recent_tickets: List[TicketItem]
    top_complaint_drivers: List[str]
    retention_strategies: List[str]
    interpretation: Optional[str] = None
    interpretation_source: str = "deterministic"
