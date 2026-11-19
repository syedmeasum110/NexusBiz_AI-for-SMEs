from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.business import Business
from .dependencies import get_current_business
from ..schemas.workflows import (
    WorkflowExecutionSchema,
    WorkflowActionSchema,
    TriggerWorkflowRequest,
    ActionDecisionRequest,
)
from ..services.workflows import (
    get_latest_workflow,
    list_workflows,
    trigger_demonstration_scenario,
    process_action_decision,
)

router = APIRouter()


@router.get("/workflows/latest", response_model=WorkflowExecutionSchema | None)
def get_latest(
    biz: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    wf = get_latest_workflow(db, biz.id)
    if not wf:
        # Trigger default demo scenario if none exists
        return trigger_demonstration_scenario(db, biz.id)
    return wf


@router.get("/workflows", response_model=list[WorkflowExecutionSchema])
def get_all_workflows(
    biz: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    return list_workflows(db, biz.id)


@router.post("/workflows/trigger", response_model=WorkflowExecutionSchema)
def trigger_workflow(
    req: TriggerWorkflowRequest,
    biz: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    return trigger_demonstration_scenario(db, biz.id)


@router.post("/workflows/actions/{action_id}/decision", response_model=WorkflowActionSchema)
def decide_action(
    action_id: int,
    req: ActionDecisionRequest,
    db: Session = Depends(get_db),
):
    try:
        return process_action_decision(db, action_id, req.decision, req.notes)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
