from abc import ABC, abstractmethod
from typing import Dict, List, Optional
from ..schemas.agents import AgentInfo


class BaseAgent(ABC):
    """Base class for all AI agents in the NexusBiz AI workforce."""

    name: str = ""
    role: str = ""
    description: str = ""
    icon: str = "sparkles"
    color: str = "emerald"
    status: str = "active"

    @abstractmethod
    def tasks(self) -> List[str]:
        """Return the list of tasks this agent handles."""
        ...

    @abstractmethod
    def key_metrics(self) -> List[str]:
        """Return key metrics monitored by this agent."""
        ...

    def info(self) -> AgentInfo:
        return AgentInfo(
            name=self.name,
            role=self.role,
            description=self.description,
            status=self.status,
            icon=self.icon,
            color=self.color,
            tasks=self.tasks(),
            key_metrics=self.key_metrics(),
        )


AGENT_REGISTRY: Dict[str, BaseAgent] = {}


def register_agent(agent: BaseAgent) -> None:
    key = agent.name.lower().replace(" ", "_")
    AGENT_REGISTRY[key] = agent
