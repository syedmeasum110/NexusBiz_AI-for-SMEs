from typing import List, Optional
from pydantic import BaseModel
from .bi import HealthScoreBreakdown


class RoutingDecision(BaseModel):
    domain: str
    agent_name: str
    consulted: bool
    reason: str


class KeyFinding(BaseModel):
    domain: str
    agent_name: str
    statement: str
    severity: str = "neutral"  # negative, neutral, positive


class RootCause(BaseModel):
    id: str
    domain: str
    agent_name: str
    title: str
    explanation: str
    evidence: str
    financial_impact: Optional[str] = None


class RecommendedAction(BaseModel):
    id: str
    priority: str  # urgent, high, medium, low
    title: str
    description: str
    assigned_agent: str
    domain: str
    expected_impact: str
    action_type: str = "general"
    financial_commitment: float = 0.0
    requires_approval: bool = False


class CEOAnswer(BaseModel):
    routing: List[RoutingDecision]
    consulted_agents: List[str]
    health_score: Optional[HealthScoreBreakdown] = None
    key_findings: List[KeyFinding]
    root_causes: List[RootCause]
    recommended_actions: List[RecommendedAction]
    executive_summary: str


class CEOAnalysisResponse(BaseModel):
    agent: str = "CEO Agent"
    question: str
    answer: CEOAnswer
    interpretation: Optional[str] = None
    interpretation_source: str = "deterministic"
    generated_at: str


class CEOOrchestrateRequest(BaseModel):
    question: str = "Why is my business profit decreasing and what should I do?"

