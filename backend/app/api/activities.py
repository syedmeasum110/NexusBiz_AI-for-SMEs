from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.business import Business, AgentActivity
from .dependencies import get_current_business
from ..schemas.agents import AgentActivityItem

router = APIRouter()


@router.get("/agent-activities", response_model=list[AgentActivityItem])
def list_activities(
    agent: str | None = Query(None, description="Filter by agent name"),
    limit: int = Query(50, le=100),
    biz: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    query = db.query(AgentActivity).filter(AgentActivity.business_id == biz.id)
    if agent:
        query = query.filter(AgentActivity.agent_name.ilike(f"%{agent}%"))
    items = query.order_by(AgentActivity.created_at.desc()).limit(limit).all()

    return [
        AgentActivityItem(
            id=item.id,
            agent_name=item.agent_name,
            action=item.action,
            finding=item.finding,
            data_points=item.data_points,
            created_at=item.created_at.strftime("%Y-%m-%d %H:%M:%S") if item.created_at else "",
        )
        for item in items
    ]
