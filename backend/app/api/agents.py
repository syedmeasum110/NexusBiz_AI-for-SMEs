from fastapi import APIRouter, HTTPException
from ..agents.base import AGENT_REGISTRY
from ..schemas.agents import AgentInfo

router = APIRouter()


@router.get("/agents", response_model=list[AgentInfo])
def list_agents():
    return [agent.info() for agent in AGENT_REGISTRY.values()]


@router.get("/agents/{agent_key}", response_model=AgentInfo)
def get_agent(agent_key: str):
    key = agent_key.lower().replace("-", "_").replace(" ", "_")
    if key not in AGENT_REGISTRY:
        # Check by partial name
        for k, v in AGENT_REGISTRY.items():
            if key in k:
                return v.info()
        raise HTTPException(status_code=404, detail=f"Agent '{agent_key}' not found")
    return AGENT_REGISTRY[key].info()
