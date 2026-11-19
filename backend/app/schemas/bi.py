from typing import List, Optional
from pydantic import BaseModel


class DomainScore(BaseModel):
    domain: str
    label: str
    score: int
    weight: float
    contribution: float
    data_available: bool = True
    key_signal: str


class HealthScoreBreakdown(BaseModel):
    score: int
    risk_level: str
    formula: str
    domain_scores: List[DomainScore]
    weakest_domain: str
    strongest_domain: str


class CrossDomainPattern(BaseModel):
    title: str
    description: str
    domains_involved: List[str]
    severity: str


class BIFacts(BaseModel):
    health_score: HealthScoreBreakdown
    cross_domain_patterns: List[CrossDomainPattern]
    macro_opportunities: List[str]
    systemic_risks: List[str]


class BIAnalysisResponse(BaseModel):
    agent: str = "Business Intelligence Agent"
    facts: BIFacts
    interpretation: Optional[str] = None
    interpretation_source: str = "deterministic"
