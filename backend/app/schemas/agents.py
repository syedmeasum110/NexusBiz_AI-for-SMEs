from typing import List, Optional
from pydantic import BaseModel


class AgentInfo(BaseModel):
    name: str
    role: str
    description: str
    status: str
    icon: str
    color: str
    tasks: List[str]
    last_active: Optional[str] = None
    key_metrics: Optional[List[str]] = None


class AgentActivityItem(BaseModel):
    id: Optional[int] = None
    agent_name: str
    action: str
    finding: str
    data_points: str
    created_at: str
