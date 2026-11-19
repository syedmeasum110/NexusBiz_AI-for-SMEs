from typing import List, Optional
from pydantic import BaseModel


class CampaignItem(BaseModel):
    id: int
    name: str
    channel: str
    spend: float
    impressions: int
    clicks: int
    conversions: int
    revenue_generated: float
    roas: float
    conversion_rate: float
    status: str


class MarketingAnalysisResponse(BaseModel):
    agent: str = "Marketing Agent"
    total_marketing_spend: float
    total_attributed_revenue: float
    average_roas: float
    top_performing_channel: str
    underperforming_campaigns: List[str]
    campaigns: List[CampaignItem]
    growth_strategies: List[str]
    channel_recommendations: List[str]
    interpretation: Optional[str] = None
    interpretation_source: str = "deterministic"
