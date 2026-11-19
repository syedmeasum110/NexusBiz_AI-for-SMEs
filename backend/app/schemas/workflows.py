from typing import List, Optional
from pydantic import BaseModel


class WorkflowStepItem(BaseModel):
    step_number: int
    agent_name: str
    action: str
    finding: str
    status: str = "completed"  # pending, running, completed, failed
    timestamp: str


class WorkflowActionSchema(BaseModel):
    id: int
    workflow_id: int
    agent_name: str
    title: str
    description: str
    action_type: str
    financial_impact: float
    priority: str
    requires_approval: bool
    status: str  # pending_approval, approved, executed, rejected
    executed_at: Optional[str] = None
    execution_result: Optional[str] = None


class WorkflowExecutionSchema(BaseModel):
    id: int
    title: str
    trigger_type: str
    status: str
    initial_trigger_detail: str
    steps: List[WorkflowStepItem]
    consolidated_decision: str
    actions: List[WorkflowActionSchema]
    created_at: str
    updated_at: str


class TriggerWorkflowRequest(BaseModel):
    trigger_type: str = "demo_scenario"
    custom_prompt: Optional[str] = None


class ActionDecisionRequest(BaseModel):
    decision: str = "approve"  # approve or reject
    notes: Optional[str] = None
